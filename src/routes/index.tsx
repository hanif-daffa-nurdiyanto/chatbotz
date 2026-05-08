import { createFileRoute } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { Hero } from '../components/Hero'
import { Features } from '../components/Features'
import { HowItWorks } from '../components/HowItWorks'
import { DemoSection } from '../components/DemoSection'
import { Pricing } from '../components/Pricing'
import { Testimonials, Footer } from '../components/FooterTestimonials'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DemoSection />
        <Pricing />
        <Testimonials />
      </main>
      <Footer />
    </>
  )
}
