import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeDashboard from "@/components/HomeDashboard";
import WinnersCircle from "@/components/WinnersCircle";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <WinnersCircle />
      <HomeDashboard />
    </main>
  );
}