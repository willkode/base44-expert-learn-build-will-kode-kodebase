import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";
import ProductDetailHero from "@/components/products/ProductDetailHero";
import ProductFeatureList from "@/components/products/ProductFeatureList";
import ProductProblemSolution from "@/components/products/ProductProblemSolution";
import MarketingEngineProDetails from "@/components/products/MarketingEngineProDetails";
import AutoBloggingDetails from "@/components/products/AutoBloggingDetails";
import ResendEmailDetails from "@/components/products/ResendEmailDetails";
import TwilioSmsDetails from "@/components/products/TwilioSmsDetails";
import SocialMediaDetails from "@/components/products/SocialMediaDetails";
import SecurityLockdownDetails from "@/components/products/SecurityLockdownDetails";
import PromptVaultDetails from "@/components/products/PromptVaultDetails";
import VibeCodingBusinessOsDetails from "@/components/products/VibeCodingBusinessOsDetails";
import CustomOutreachEngineProDetails from "@/components/products/CustomOutreachEngineProDetails";
import MonetizationEngineDetails from "@/components/products/MonetizationEngineDetails";
import AgentWorkforceDetails from "@/components/products/AgentWorkforceDetails";
import ClientPortalDetails from "@/components/products/ClientPortalDetails";
import MobileApprovalKitDetails from "@/components/products/MobileApprovalKitDetails";
import CompleteBundleDetails from "@/components/products/CompleteBundleDetails";
import { trackViewItem, trackSelectItem } from "@/lib/analytics";
import { getProductSalePriceCents, formatUsd, isSummerSaleActive } from "@/lib/summerSale";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ slug, active: true }).then((items) => {
      const p = items[0] || null;
      setProduct(p);
      setLoading(false);
      if (p) trackViewItem({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-28 pb-24 px-6">
        <LoadingState label="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 pb-24 px-6 text-center">
        <p className="text-muted-foreground mb-4">We couldn't find that product.</p>
        <Button onClick={() => navigate("/products")}>View all products</Button>
      </div>
    );
  }

  const onSale = isSummerSaleActive();
  const salePriceCents = getProductSalePriceCents(product.priceCents);
  const price = formatUsd(salePriceCents);
  const fullPrice = formatUsd(product.priceCents);
  const handleBuy = () => {
    trackSelectItem({ id: product.id, name: product.name, category: product.category, price: product.priceCents / 100 });
    navigate(`/checkout?product=${product.id}`);
  };

  return (
    <div className="pt-28 pb-24 px-6">
      <Seo
        title={`${product.name} — ${product.category} | KodeBase`}
        description={product.tagline || product.description}
        path={`/products/${product.slug}`}
        type="product"
        image={product.imageUrl || undefined}
      />
      <div className="max-w-6xl mx-auto">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-10">
          <ArrowLeft className="w-4 h-4" /> All products
        </Link>

        <ProductDetailHero product={product} onBuy={handleBuy} />

        {product.slug === "ai-drift-control-system" && <ProductProblemSolution />}

        {product.slug === "kode-marketing-engine-pro" && <MarketingEngineProDetails />}

        {product.slug === "ai-auto-blogging-system" && <AutoBloggingDetails />}

        {product.slug === "resend-email-marketing-system" && <ResendEmailDetails />}

        {product.slug === "twilio-sms-marketing-system" && <TwilioSmsDetails />}

        {product.slug === "social-media-marketing-system" && <SocialMediaDetails />}

        {product.slug === "security-lockdown-pro" && <SecurityLockdownDetails />}

        {product.slug === "prompt-vault" && <PromptVaultDetails onBuy={handleBuy} price={price} />}

        {product.slug === "vibe-coding-business-os" && <VibeCodingBusinessOsDetails />}

        {product.slug === "custom-outreach-engine-pro" && <CustomOutreachEngineProDetails />}

        {product.slug === "saas-monetization-engine-pro" && <MonetizationEngineDetails />}

        {product.slug === "ai-agent-workforce-system" && <AgentWorkforceDetails />}

        {product.slug === "client-portal-white-label-system" && <ClientPortalDetails />}

        {product.slug === "mobile-app-store-approval-kit" && <MobileApprovalKitDetails />}

        {product.slug === "complete-builder-bundle" && <CompleteBundleDetails bundlePriceCents={product.priceCents} />}

        {product.description && (
          <div className="max-w-3xl mx-auto text-center mt-24 mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Overview</span>
            <h2 className="font-sora font-bold text-3xl md:text-4xl tracking-tight mt-4 mb-5">
              {product.slug === "kode-marketing-engine-pro"
                ? <>One purchase. <span className="text-gradient-orange">Every engine.</span></>
                : <>What's <span className="text-gradient-orange">inside.</span></>}
            </h2>
            <p className="text-lg text-muted-foreground">{product.description}</p>
          </div>
        )}

        <ProductFeatureList features={product.features} />

        <div className="max-w-2xl mx-auto text-center mt-24 rounded-2xl border border-border bg-card p-10 glow-orange">
          <h2 className="font-sora font-bold text-2xl md:text-3xl mb-3">
            {product.slug === "prompt-vault"
              ? <>Ready to unlock the <span className="text-gradient-orange">Prompt Vault?</span></>
              : product.slug === "vibe-coding-business-os"
              ? <>Ready to build your <span className="text-gradient-orange">Business OS?</span></>
              : product.slug === "custom-outreach-engine-pro"
              ? <>Ready to build your <span className="text-gradient-orange">outreach engine?</span></>
              : product.slug === "saas-monetization-engine-pro"
              ? <>Ready to start <span className="text-gradient-orange">getting paid?</span></>
              : product.slug === "ai-agent-workforce-system"
              ? <>Ready to hire your <span className="text-gradient-orange">AI workforce?</span></>
              : product.slug === "client-portal-white-label-system"
              ? <>Ready to deliver like an <span className="text-gradient-orange">agency?</span></>
              : product.slug === "mobile-app-store-approval-kit"
              ? <>Ready to get <span className="text-gradient-orange">approved?</span></>
              : product.slug === "complete-builder-bundle"
              ? <>Ready to own <span className="text-gradient-orange">everything?</span></>
              : <>Ready to install your <span className="text-gradient-orange">marketing engine?</span></>}
          </h2>
          <p className="text-muted-foreground mb-6">{product.supportNote || "One-time fee · Free support included"}</p>
          <Button
            size="lg"
            onClick={handleBuy}
            className="font-semibold text-base px-8 bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
          >
            Buy Now — {onSale && <span className="line-through opacity-60 mr-1.5">{fullPrice}</span>}{price}
          </Button>
          <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure checkout powered by Square
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
            <RefreshCw className="w-3 h-3" /> Lifetime updates included — every future version free
          </p>
        </div>
      </div>
    </div>
  );
}