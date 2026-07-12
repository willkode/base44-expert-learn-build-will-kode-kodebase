import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);
import { Check, Sparkles, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import LoadingState from "@/components/shared/LoadingState";
import Seo from "@/components/seo/Seo";
import { softwareApplicationSchema } from "@/lib/seo";
import { trackSelectItem, trackAddToCart } from "@/lib/analytics";
import { useCart } from "@/components/cart/CartContext";
import { isSummerSaleActive, getProductSalePriceCents, getSaleDiscountPercent, formatUsd, SUMMER_SALE_END_LABEL } from "@/lib/summerSale";
import SummerSaleBanner from "@/components/products/SummerSaleBanner";
import FeaturedBundleCard from "@/components/products/FeaturedBundleCard";

const FEATURED_SLUG = "complete-base44-knowledge-kit";
const HIDDEN_SLUGS = ["complete-builder-bundle", "starter-prompt-pack"];

export default function Products() {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    base44.entities.Product.filter({ active: true }, "order").then((items) => {
      setProducts(items);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    [products]
  );

  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (HIDDEN_SLUGS.includes(p.slug)) return false;
      const matchesCategory = category === "all" || p.category === category;
      const matchesSearch =
        !q ||
        [p.name, p.tagline, p.description, ...(p.features || [])]
          .filter(Boolean)
          .some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.priceCents - a.priceCents);
    else if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, category, sort]);

  const featuredProduct = useMemo(
    () => visibleProducts.find((p) => p.slug === FEATURED_SLUG),
    [visibleProducts]
  );
  const gridProducts = useMemo(
    () => visibleProducts.filter((p) => p.slug !== FEATURED_SLUG),
    [visibleProducts]
  );

  return (
    <div className="pt-28 pb-24 px-6">
      <Seo
        title="Prompt Packages — Buy Once, Build Forever | KodeBase"
        description="Professionally engineered Base44 prompt packages that build complete systems into your app. One-time fee, instant download, free support."
        path="/products"
        type="website"
        image="https://media.base44.com/images/public/6a1905a0bc76553d6c934574/4615989ef_generated_image.png"
        jsonLd={[softwareApplicationSchema()]}
      />
      <div className="max-w-7xl mx-auto">
        <SummerSaleBanner />
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-widest">Products</span>
          <h1 className="font-sora font-bold text-3xl md:text-5xl tracking-tight mt-4 mb-5">
            Premium prompt packages. <span className="text-gradient-orange">Buy once, build forever.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Professionally engineered prompts that build complete systems into your app. One-time fee. Free support.
          </p>
        </div>

        {loading ? (
          <LoadingState label="Loading products..." />
        ) : (
          <>
          <div className="max-w-5xl mx-auto mb-10 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name: A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {visibleProducts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No products match your search.</p>
          ) : (
          <>
          {featuredProduct && <FeaturedBundleCard product={featuredProduct} />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gridProducts.map((p, i) => (
              <MotionLink
                key={p.id}
                to={`/products/${p.slug}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card/60 overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.name} className="w-full aspect-video object-cover" />
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                    {p.badge && (
                      <Badge className="text-xs bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                        <Sparkles className="w-3 h-3 mr-1" /> {p.badge}
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-sora font-bold text-xl mb-1.5">{p.name}</h2>
                  {p.tagline && <p className="text-sm text-muted-foreground mb-4">{p.tagline}</p>}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {(p.features || []).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        {isSummerSaleActive() ? (
                          <>
                            <Badge className="mb-1.5 text-[10px] bg-primary/15 text-primary border-primary/30 hover:bg-primary/15">
                              Will's Birthday Sale · {getSaleDiscountPercent(p.slug)}% off
                            </Badge>
                            <div className="flex items-end gap-1.5">
                              <span className="font-sora font-extrabold text-3xl">{formatUsd(getProductSalePriceCents(p.priceCents, p.slug))}</span>
                              <span className="text-muted-foreground mb-1 text-sm line-through">{formatUsd(p.priceCents)}</span>
                              <span className="text-muted-foreground mb-1 text-sm">one-time</span>
                            </div>
                            <p className="text-xs text-primary mt-1">Sale ends {SUMMER_SALE_END_LABEL}</p>
                          </>
                        ) : (
                          <div className="flex items-end gap-1">
                            <span className="font-sora font-extrabold text-3xl">{formatUsd(p.priceCents)}</span>
                            <span className="text-muted-foreground mb-1 text-sm">one-time</span>
                          </div>
                        )}
                        {p.supportNote && <p className="text-xs text-muted-foreground mt-1">{p.supportNote}</p>}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          trackSelectItem({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
                          navigate(`/checkout?product=${p.id}`);
                        }}
                        className="font-semibold bg-gradient-to-r from-[#f87171] via-[#fb923c] to-[#facc15] text-[#0a0f1e] hover:opacity-90"
                      >
                        Buy Now
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(p.priceCents || 0) > 0 && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            trackAddToCart({ id: p.id, name: p.name, category: p.category, price: p.priceCents / 100 });
                            addItem(p.id);
                            openCart();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart
                        </Button>
                      )}
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/products/${p.slug}`);
                        }}
                        variant="outline"
                        size="sm"
                        className={(p.priceCents || 0) > 0 ? "" : "col-span-2"}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </MotionLink>
            ))}
          </div>
          </>
          )}
          </>
        )}
      </div>
    </div>
  );
}