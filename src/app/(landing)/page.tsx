import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import CustomersTableCard from "@/components/sections/FeaturesCard";

export default function Home() {
  return (
    <main className="flex-1 bg-base-100 h-full">
      <Hero />
      <Features />
      <Pricing />
    </main>
  );
}
