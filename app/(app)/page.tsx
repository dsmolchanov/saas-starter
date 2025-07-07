import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Film, CalendarClock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find Your Flow | Dzen Yoga',
  description:
    'Stream on-demand yoga, fitness and mindfulness classes from world-class instructors. Start your free trial today.'
};

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
        <div className="absolute inset-0 -z-10 opacity-40 bg-[url('https://images.unsplash.com/photo-1518609571701-94061b88d1db?auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center" />
        <div className="container mx-auto px-4 py-32 flex flex-col items-center text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-xl">
            Yoga, Fitness & Mindfulness — Anytime, Anywhere
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-prose">
            Unlimited access to thousands of classes taught by world-class instructors. Practice in your living room, hotel or on the go.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="border-white/40 text-white hover:bg-white/10">
              <Link href="/browse">Browse Classes</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Practice with Dzen Yoga?</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <FeatureCard
            icon={<Users className="size-10 text-primary" />}
            title="World-Class Instructors"
            description="Learn from the best teachers in yoga, fitness and mindfulness."
          />
          <FeatureCard
            icon={<Film className="size-10 text-primary" />}
            title="Thousands of Classes"
            description="From 10-minute quick practices to full-length workshops — new content every week."
          />
          <FeatureCard
            icon={<CalendarClock className="size-10 text-primary" />}
            title="Practice on Your Schedule"
            description="Stream on demand on any device — practice whenever and wherever you are."
          />
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center bg-secondary rounded-full w-20 h-20 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
} 