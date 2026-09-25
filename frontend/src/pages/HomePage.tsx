import { TopNav } from '../components/home/TopNav';
import { HeroSection } from '../components/home/HeroSection';
import { RecentlyReviewed } from '../components/home/RecentlyReviewed';
import { TopReviewers } from '../components/home/TopReviewers';
import { trendingMovie, recentlyReviewed, topReviewers } from '../lib/homeData';

function HomePage() {
    return (
        <div className="dark relative min-h-screen bg-background text-foreground">
            {/* Ambient neon glows */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 size-96 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute right-0 top-1/3 size-96 rounded-full bg-fuchsia-500/5 blur-[120px]" />
            </div>

            <div className="relative flex min-h-screen flex-col">
                <TopNav />

                <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="flex min-w-0 flex-col gap-8">
                            <HeroSection movie={trendingMovie} />
                            <RecentlyReviewed movies={recentlyReviewed} />
                        </div>

                        <div className="flex flex-col gap-6">
                            <TopReviewers reviewers={topReviewers} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default HomePage;
