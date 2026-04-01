import { Link } from "react-router-dom";
import { Badge } from "@/presentation/components/atoms/badge";
import { Button } from "@/presentation/components/atoms/button";
import { ArrowRight, Lock, Sparkles, CheckSquare, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StoreProductCardProps {
  product: any;
  lang: string;
  t: any;
  hasPreviousAttempt: boolean;
}

export const StoreProductCard = ({ product, lang, t, hasPreviousAttempt }: StoreProductCardProps) => {
  const d = t?.dashboard;

  if (!d) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/10 backdrop-blur-sm shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-all group flex flex-col h-full"
    >
      <div
        className={cn(
          "h-1.5 w-full shrink-0 bg-gradient-to-r",
          product.gradientFrom,
          product.gradientTo
        )}
      />

      <div className="p-7 space-y-6 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {hasPreviousAttempt && (
                <div className="absolute -top-3 -right-2 z-10">
                  <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-1 h-auto uppercase tracking-tighter shadow-lg rounded-full">
                    {lang === "pt" ? "2ª TENTATIVA" : "2nd ATTEMPT"}
                  </Badge>
                </div>
              )}
              <div
                className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg text-white transform group-hover:rotate-6 transition-all duration-300",
                  product.color
                )}
              >
                {product.icon && <span className="[&_svg]:w-6 [&_svg]:h-6">{product.icon}</span>}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-black text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                {lang === "pt" ? product.titlePt : product.titleEn}
              </h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                {lang === "pt" ? product.subtitlePt : product.subtitleEn}
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "shrink-0 rounded-full h-6 px-2.5 font-black text-[8px] uppercase tracking-widest border transition-colors",
              product.available
                ? "bg-accent/5 text-accent border-accent/10"
                : "bg-muted/50 text-muted-foreground border-transparent"
            )}
            variant="outline"
          >
            {product.available ? (
              <Zap className="h-2.5 w-2.5 mr-1.5 fill-accent" />
            ) : (
              <Lock className="h-2.5 w-2.5 mr-1.5" />
            )}
            {product.badgeLabel}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed font-medium line-clamp-2">
          {lang === "pt" ? product.descPt : product.descEn}
        </p>

        <div className="space-y-3 flex-grow bg-slate-500/5 p-5 rounded-2xl border border-border/40 group-hover:bg-slate-500/10 transition-colors">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 opacity-60">
            <Sparkles className="h-2.5 w-2.5 text-primary" /> {lang === 'pt' ? 'Recursos inclusos' : 'Features included'}
          </p>
          <ul className="grid gap-3">
            {product.features.map((f: any, i: number) => (
              <li key={i} className="flex items-center gap-3 group/item">
                <div className="h-6 w-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 shadow-sm">
                  <CheckSquare className="h-3 w-3 text-accent" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80 transition-colors">
                  {lang === 'pt' ? f.pt : f.en}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-1">
          {product.available ? (
            <Link to={product.checkoutUrl} className="block group/link">
              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 gap-3 relative overflow-hidden transition-all active:scale-[0.98]">
                {d.getStarted}
                <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="w-full h-12 rounded-xl gap-2 bg-muted/50 text-muted-foreground/40 border border-border/20 font-black uppercase text-[9px] tracking-widest"
            >
              <Lock className="h-3.5 w-3.5" />
              {d.comingSoon}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
