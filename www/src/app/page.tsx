import { FeatureSection } from "@/components/landing/feature-section"
import { Footer } from "@/components/landing/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { LamboSection } from "@/components/landing/lambo-section"
import { Navbar } from "@/components/landing/navbar"
import { StarsSection } from "@/components/stars-section"

export default function Page() {
  return (
    <main className="min-h-screen bg-zinc-900">
      <Navbar />
      <HeroSection />
      <StarsSection />
      <FeatureSection />
      <LamboSection />
      <Footer />
    </main>
  )
}
