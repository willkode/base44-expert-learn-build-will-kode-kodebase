import { reservePromotion, completePromotion, reconcilePromotion, publicStatus, readPromotion, CAMPAIGN } from "../base44/shared/migrationPromotion.ts";
const assert = (ok, message) => { if (!ok) throw new Error(message); };
let row, links, orders, payments, failures, calls;
function reset() {
 row={id:"test",campaign:CAMPAIGN,revision:0,slots:Array.from({length:10},(_,i)=>({number:i+1,state:"available"}))};
 links=new Map();orders=new Map();payments=new Map();failures=false;calls=0;
}
const base44={asServiceRole:{entities:{MigrationPromotion:{
 filter:async()=>structuredClone([row]),
 updateMany:async(q,d)=>{await Promise.resolve();if(q.id!==row.id||q.revision!==row.revision)return {updated:0};row={...row,...structuredClone(d.$set)};return {updated:1};}
}}}};
globalThis.fetch=async(url,opts={})=>{
 calls++; if(failures) throw new Error("provider unavailable");
 const path=new URL(url).pathname;
 if(opts.method==="POST"){
  const request=JSON.parse(opts.body);const key=request.idempotency_key;
  if(!links.has(key)){
   links.set(key,{id:"link-"+key,order_id:"order-"+key,url:"https://example.test/"+key});
   orders.set("order-"+key,{id:"order-"+key,state:"OPEN",metadata:request.order.metadata,tenders:[]});
  }
  return Response.json({payment_link:links.get(key)});
 }
 if(opts.method==="DELETE"){
  const key=path.split("/").pop().replace("link-","");
  orders.get("order-"+key).state="CANCELED";return Response.json({});
 }
 if(path.includes("/orders/"))return Response.json({order:orders.get(path.split("/").pop())});
 if(path.includes("/payments/"))return Response.json({payment:payments.get(path.split("/").pop())});
 throw new Error("Unexpected request "+path);
};
const req=()=>({order:{metadata:{},line_items:[]},checkout_options:{}});
Deno.test("simultaneous checkouts cannot oversell; retries reuse a hold",async()=>{
 reset();
 const results=await Promise.allSettled(Array.from({length:15},(_,i)=>reservePromotion(base44,"buyer"+i+"@example.test","base44_migration",req())));
 assert(results.filter(r=>r.status==="fulfilled").length===10,"exactly ten successful checkouts");
 assert(row.slots.filter(s=>s.state==="held").length===10,"ten held");
 assert(new Set(row.slots.map(s=>s.token)).size===10,"unique tokens");
 const again=await reservePromotion(base44,"buyer0@example.test","base44_migration",req());
 assert(again.checkoutUrl===results[0].value.checkoutUrl,"retry reused link");
});
Deno.test("signed completed payment consumes once; failed, old, wrong amount do not",async()=>{
 reset(); await reservePromotion(base44,"buyer@example.test","base44_migration",req());
 const slot=row.slots[0];
 const payment={id:"p1",order_id:slot.order_id,status:"COMPLETED",amount_money:{amount:5000,currency:"USD"}};
 await completePromotion(base44,{...payment,status:"FAILED"});
 await completePromotion(base44,{...payment,amount_money:{amount:19900,currency:"USD"}});
 await completePromotion(base44,{...payment,order_id:"historical"});
 assert(publicStatus(row).claimed===0,"invalid completions ignored");
 await completePromotion(base44,payment);await completePromotion(base44,payment);
 assert(publicStatus(row).claimed===1,"duplicate did not double count");
 const again=await Promise.allSettled([reservePromotion(base44,"BUYER@example.test","base44_migration",req())]);
 assert(again[0].status==="rejected","one paid spot per normalized email");
});
Deno.test("mobile total and sold-out transition",async()=>{
 reset();
 for(let i=0;i<10;i++){
  await reservePromotion(base44,"mobile"+i+"@example.test","base44_migration_mobile",req());
  const s=row.slots[i];assert(s.amount_cents===14900,"mobile is +99");
  await completePromotion(base44,{id:"p"+i,order_id:s.order_id,status:"COMPLETED",amount_money:{amount:14900,currency:"USD"}});
 }
 const status=publicStatus(row);assert(status.soldOut&&status.price===199&&status.claimed===10&&status.remaining===0,"sold out returns 199");
});
Deno.test("abandoned checkout cancels before releasing; provider uncertainty retains hold",async()=>{
 reset();await reservePromotion(base44,"abandoned@example.test","base44_migration",req());
 row.slots[0].expires_at=0;failures=true;await reconcilePromotion(base44);
 assert(row.slots[0].state==="held","failed provider must keep hold");
 failures=false;const orderId=row.slots[0].order_id;await reconcilePromotion(base44);
 assert(orders.get(orderId).state==="CANCELED"&&row.slots[0].state==="available","cancel then release");
});
Deno.test("completed and pending payments never release an expired hold",async()=>{
 reset();await reservePromotion(base44,"late@example.test","base44_migration",req());row.slots[0].expires_at=0;
 const order=orders.get(row.slots[0].order_id);order.tenders=[{payment_id:"late"}];
 payments.set("late",{id:"late",order_id:order.id,status:"APPROVED",amount_money:{amount:5000,currency:"USD"}});
 await reconcilePromotion(base44);assert(row.slots[0].state==="held","pending retained");
 payments.get("late").status="COMPLETED";
 await reconcilePromotion(base44);assert(row.slots[0].state==="paid","completed reconciled");
});
Deno.test("ambiguous link creation retries idempotently without consuming more spots",async()=>{
 reset();failures=true;await Promise.allSettled([reservePromotion(base44,"retry@example.test","base44_migration",req())]);
 assert(row.slots.filter(s=>s.state==="held").length===1,"uncertain hold retained");
 failures=false;await reservePromotion(base44,"retry@example.test","base44_migration",req());
 assert(links.size===1&&row.slots.filter(s=>s.state==="held").length===1,"one link and one hold");
});
