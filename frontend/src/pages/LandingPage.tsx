import "@fontsource-variable/geist"
import { MotionConfig } from "motion/react"
import { LandingNav } from "../components/landing/LandingNav"
import { LandingHero } from "../components/landing/LandingHero"
import { RankDemo } from "../components/landing/RankDemo"
import { FilmRail } from "../components/landing/FilmRail"
import { HowItWorks } from "../components/landing/HowItWorks"
import { ReviewInterlude } from "../components/landing/ReviewInterlude"
import { ClosingCta } from "../components/landing/ClosingCta"

function LandingPage() {
    return (
        // reducedMotion="user" turns transform animations off when the OS asks for reduced motion.
        <MotionConfig reducedMotion="user">
            <div className="min-h-[100dvh] bg-night font-display text-paper antialiased [color-scheme:dark]">
                <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-paper focus:px-4 focus:py-2 focus:text-sm focus:text-night"
                >
                    Skip to content
                </a>
                <LandingNav />
                <main id="main">
                    <LandingHero />
                    <RankDemo />
                    <FilmRail />
                    <HowItWorks />
                    <ReviewInterlude />
                    <ClosingCta />
                </main>
            </div>
        </MotionConfig>
    );
}

export default LandingPage;
