import { Link } from "react-router-dom";
import { Badge } from "@/presentation/components/atoms/badge";
import { Button } from "@/presentation/components/atoms/button";
import { ArrowRight, Lock, Sparkles, CheckSquare } from "lucide-react";

interface StoreProductCardProps {
  product: any;
  lang: string;
  t: any;
  hasPreviousAttempt: boolean;
}

export const StoreProductCard = ({ product, lang, t, hasPreviousAttempt }: StoreProductCardProps) => {
  const d = t.dashboard;

  return (
    <div
      key={product.slug}
      className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:shadow-md group flex flex-col h-full"
    >
      {/* Top gradient bar */}
      <div
        className={`h-1.5 w-full shrink-0 bg-gradient-to-r ${product.gradientFrom} ${product.gradientTo}`}
      />

      <div className="p-4 space-y-5 flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="relative">
              {hasPreviousAttempt && (
                <Badge className="absolute -top-2 -right-1 z-10 bg-amber-500 text-white border-none text-[8px] font-bold px-1 py-0 h-4 uppercase">
                  {lang === "pt" ? "2ª Tentativa" : "2nd Attempt"}
                </Badge>
              )}
              <div
                className={`h-11 w-11 rounded-md ${product.color} text-white flex items-center justify-center shadow-sm`}
              >
                {product.icon}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                {lang === "pt" ? product.titlePt : product.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === "pt" ? product.subtitlePt : product.subtitleEn}
              </p>
            </div>
          </div>
          <Badge
            className={`shrink-0 ${
              product.available
                ? "bg-accent/10 text-accent border-accent/20"
                : "bg-muted text-muted-foreground"
            }`}
            variant="outline"
          >
            {product.available && (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {product.badgeLabel}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {lang === "pt" ? product.descPt : product.descEn}
        </p>

        <ul className="space-y-2 flex-grow">
          {product.features.map((f: any, i: number) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-4 w-4 text-accent shrink-0" />
              <span className="text-foreground">
                {lang === "pt" ? f.pt : f.en}
              </span>
            </li>
          ))}
        </ul>

        {product.available ? (
          <Link to={product.checkoutUrl} className="mt-auto block">
            <Button className="w-full bg-primary font-bold h-11 rounded-md gap-2 hover:bg-primary/90 shadow-sm">
              {d.getStarted[lang]}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button
            disabled
            className="w-full h-11 rounded-md gap-2 opacity-60 cursor-not-allowed mt-auto shrink-0"
          >
            <Lock className="h-4 w-4" />
            {d.comingSoon[lang]}
          </Button>
        )}
      </div>
    </div>
  );
};
