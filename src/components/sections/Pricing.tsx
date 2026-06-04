/* Archivo: src\components\sections\Pricing.tsx
    Descripción: Sección de precios. Organismo que compone PricingCard a partir de PLANS
    (config/landing) y permite alternar facturación mensual/anual. */

"use client";

import { useState } from "react";
import { PLANS } from "@/config/landing";
import PricingCard from "./PricingCard";

type Billing = "monthly" | "annual";

// Al pagar anualmente se cobran 10 meses (2 meses gratis). El precio mostrado sigue
// siendo mensual para facilitar la comparación entre ciclos.
const ANNUAL_MONTHS_CHARGED = 10;

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  const priceFor = (monthly: number) =>
    billing === "monthly" ? monthly : Math.round((monthly * ANNUAL_MONTHS_CHARGED) / 12);

  return (
    <section id="pricing" className="py-24 bg-base-100 px-4">
      <div className="mx-auto w-full max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-base-content">
            Planes que crecen contigo
          </h2>
          <p className="mt-4 text-lg text-base-content/70">
            Empieza gratis y amplía cuando tu aula lo necesite. Sin permanencia.
          </p>

          {/* Toggle de facturación */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-base-200 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`btn btn-sm rounded-full border-none ${
                billing === "monthly" ? "btn-primary" : "btn-ghost"
              }`}
              aria-pressed={billing === "monthly"}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`btn btn-sm rounded-full border-none gap-2 ${
                billing === "annual" ? "btn-primary" : "btn-ghost"
              }`}
              aria-pressed={billing === "annual"}
            >
              Anual
              <span className="badge badge-success badge-sm text-success-content font-bold">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} price={priceFor(plan.monthly)} period="/mes" />
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-base-content/50">
          Precios en euros, IVA no incluido. El plan anual factura {ANNUAL_MONTHS_CHARGED} meses por
          adelantado.
        </p>
      </div>
    </section>
  );
}
