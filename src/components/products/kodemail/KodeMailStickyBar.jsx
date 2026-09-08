import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import KodeMailBuyButton from "./KodeMailBuyButton";
import { KODEMAIL_PRICE, KODEMAIL_LIST_PRICE } from "./kodeMailData";

export default function KodeMailStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <div className="font-sora font-extrabold text-lg text-gradient-orange">${KODEMAIL_PRICE}</div>
              <div className="text-[11px] text-muted-foreground line-through">${KODEMAIL_LIST_PRICE}</div>
            </div>
            <KodeMailBuyButton
              location="kodemail_sticky_bar"
              label={`Own my email — $${KODEMAIL_PRICE}`}
              className="flex-1 !py-5 !px-4 text-sm"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}