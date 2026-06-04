/* Archivo: src\components\sections\PricingCard.tsx
    Descripción: Tarjeta de plan (molécula presentacional) usada por la sección de Precios. */

import { Check, X } from "lucide-react";
import type { Plan, PlanFeature, PlanTone } from "@/config/landing";

const TONE: Record<PlanTone, {
  card: string;
  pill: string;
  price: string;
  cta: string;
  divider: string;
}> = {
  neutral: {
    card: "bg-base-100 border border-base-300",
    pill: "bg-base-200 text-base-content/60",
    price: "text-base-content",
    cta: "btn-outline btn-primary",
    divider: "border-base-200",
  },
  primary: {
    card: "bg-primary text-primary-content border border-primary",
    pill: "bg-primary-content/20 text-primary-content",
    price: "text-primary-content",
    cta: "bg-white/90 text-primary-content hover:bg-white border-none",
    divider: "border-primary-content/20",
  },
  dark: {
    card: "bg-base-content text-base-100 border border-base-content",
    pill: "bg-base-100/15 text-base-100",
    price: "text-base-100",
    cta: "bg-base-100 text-base-content hover:bg-base-100/90 border-none",
    divider: "border-base-100/20",
  },
};

function PlanFeatureItem({ feature, tone }: { feature: PlanFeature; tone: PlanTone }) {
  const isHighContrast = tone === "primary" || tone === "dark";
  return (
    <li className={`flex items-start gap-2.5 ${feature.included ? "" : "opacity-40"}`}>
      {feature.included ? (
        <span className={`mt-0.5 flex-shrink-0 rounded-full p-0.5 ${isHighContrast ? "bg-white/20" : "bg-success/15"}`}>
          <Check className={`size-3 ${isHighContrast ? "text-white" : "text-success"}`} strokeWidth={3} aria-hidden />
        </span>
      ) : (
        <span className="mt-0.5 flex-shrink-0 rounded-full p-0.5 bg-base-content/10">
          <X className="size-3 text-base-content/40" strokeWidth={3} aria-hidden />
        </span>
      )}
      <div>
        <span className={`text-sm font-medium leading-snug ${isHighContrast ? "text-inherit" : "text-base-content"}`}>
          {feature.title}
        </span>
        {feature.hint && (
          <div className={`text-xs mt-0.5 leading-snug ${isHighContrast ? "opacity-60" : "text-base-content/50"}`}>
            {feature.hint}
          </div>
        )}
      </div>
    </li>
  );
}

export interface PricingCardProps {
  plan: Plan;
  price: number;
  period: string;
}

export default function PricingCard({ plan, price, period }: PricingCardProps) {
  const t = TONE[plan.tone];
  const isHighContrast = plan.tone === "primary" || plan.tone === "dark";
  const priceLabel = price === 0 ? "Gratis" : `${price} €`;

  return (
    <div
      className={`relative w-full max-w-sm rounded-2xl shadow-xl ${t.card} ${
        plan.highlight ? "lg:scale-[1.04] lg:-translate-y-1 z-10 shadow-2xl" : ""
      } transition-transform overflow-hidden`}
    >

      <div className="flex flex-col gap-6 p-7">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${t.pill}`}>
            {plan.badge}
          </span>
          {plan.tagline && (
            <span className={`text-xs font-medium opacity-60 ${isHighContrast ? "text-inherit" : "text-base-content"}`}>
              {plan.tagline}
            </span>
          )}
        </div>

        {/* Precio */}
        <div>
          <div className={`text-5xl font-extrabold tracking-tight ${t.price}`}>
            {priceLabel}
          </div>
          {price > 0 && (
            <div className={`mt-1 text-sm ${isHighContrast ? "opacity-60" : "text-base-content/50"}`}>
              por persona{period}
            </div>
          )}
          {price === 0 && (
            <div className={`mt-1 text-sm ${isHighContrast ? "opacity-60" : "text-base-content/50"}`}>
              sin tarjeta de crédito
            </div>
          )}
        </div>

        {/* Divisor */}
        <hr className={`border-t ${t.divider}`} />

        {/* Features */}
        <ul className="flex flex-col gap-3">
          {plan.features.map((feature) => (
            <PlanFeatureItem key={feature.title} feature={feature} tone={plan.tone} />
          ))}
        </ul>

        {/* CTA */}
        <button className={`btn btn-block rounded-xl font-bold ${t.cta}`}>
          {plan.cta}
        </button>
      </div>
    </div>
  );
}
