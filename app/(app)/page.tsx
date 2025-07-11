import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Settings, 
  Clock, 
  Video, 
  PlayCircle, 
  Users, 
  Star,
  Calendar,
  Headphones,
  Baby,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Music
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find Your Perfect Practice | Dzen Yoga',
  description:
    'Discover yoga teachers you will love. Customize your practice with any duration, style and length. Connect deeper through webinars and private classes. Create playlists for the whole family.'
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] overflow-hidden" style={{ background: `linear-gradient(135deg, var(--color-zen-5), var(--color-zen-4), var(--color-zen-3))` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30" />
        <div className="relative container mx-auto px-4 py-20 flex flex-col justify-center min-h-[90vh]">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              ✨ New: AI-Powered Practice Recommendations
            </Badge>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-8 drop-shadow-2xl">
              Find Your Perfect
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent block">
                Yoga Practice
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover teachers you'll love, customize every aspect of your practice, and connect deeper with personalized guidance
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-4 zen-gradient hover:zen-gradient-hover text-white transition-all duration-300">
                <Link href="/sign-up">Start Your Journey Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 zen-gradient border-0 text-white hover:zen-gradient-hover transition-all duration-300">
                <Link href="/browse">Explore Classes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why You'll Love Dzen Yoga</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every feature designed to make your practice perfect for you
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={<Heart className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
              title="Teachers You Will Love"
              description="Handpicked instructors with unique teaching styles, from gentle beginners to advanced masters. Find your perfect match."
              image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80"
            />
            <FeatureCard
              icon={<Settings className="size-12" style={{ color: 'var(--color-zen-4)' }} />}
              title="Customize Your Practice"
              description="Filter by mood, energy level, focus areas, and personal goals. Your practice, perfectly tailored."
              image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80"
            />
            <FeatureCard
              icon={<Clock className="size-12" style={{ color: 'var(--color-zen-4)' }} />}
              title="Any Duration & Style"
              description="From 5-minute breathing exercises to 90-minute deep flows. Vinyasa, Yin, Power, Restorative - it's all here."
              image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80"
            />
            <FeatureCard
              icon={<Video className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
              title="Connect Deeper"
              description="Join live webinars, book private sessions, and get personalized feedback from your favorite teachers."
              image="https://images.unsplash.com/photo-1593810450967-f9c42742e326?auto=format&fit=crop&w=500&q=80"
            />
            <FeatureCard
              icon={<Music className="size-12" style={{ color: 'var(--color-zen-4)' }} />}
              title="Playlists Like Spotify"
              description="Create custom playlists, save favorites, track recently played. Your yoga library, organized your way."
              image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80"
            />
            <FeatureCard
              icon={<Users className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
              title="For The Whole Family"
              description="Kids yoga, prenatal classes, senior-friendly practices. Something special for every family member."
              image="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=500&q=80"
            />
          </div>
        </div>
      </section>

      {/* Playlist Features */}
      <section className="py-24" style={{ background: `linear-gradient(135deg, rgb(199, 214, 212, 0.3), rgb(159, 178, 176, 0.3))` }}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
                <Headphones className="w-4 h-4 mr-2" />
                Playlist Features
              </Badge>
              <h2 className="text-4xl font-bold mb-6">Your Yoga, Your Way</h2>
              <p className="text-xl text-gray-600 mb-8">
                Organize your practice like your favorite music streaming app. Smart playlists that adapt to your schedule and mood.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg">Favorites collection for quick access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg">Recently played history</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg">Custom playlists for different moods</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg">Smart recommendations based on practice</span>
                </div>
              </div>
              
              <Button asChild className="zen-gradient hover:zen-gradient-hover text-white transition-all duration-300">
                <Link href="/my_practice">
                  Explore My Practice <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80"
                  alt="Yoga playlist interface"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">Morning Flow</span>
                </div>
                <p className="text-sm text-gray-600">5 classes • 45 min total</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Deeper Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80"
                  alt="Live yoga webinar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <Badge className="mb-4 bg-red-100 text-red-700 border-red-200">
                <Video className="w-4 h-4 mr-2" />
                Live Connection
              </Badge>
              <h2 className="text-4xl font-bold mb-6">Connect Deeper with Teachers</h2>
              <p className="text-xl text-gray-600 mb-8">
                Go beyond recorded classes. Join live webinars, book personal sessions, and receive individual guidance from world-class instructors.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Live Webinars</h3>
                  <p className="text-sm text-gray-600">Join interactive sessions with expert teachers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <Star className="w-8 h-8 text-yellow-500 mb-3" />
                  <h3 className="font-semibold mb-2">Private Classes</h3>
                  <p className="text-sm text-gray-600">One-on-one sessions tailored just for you</p>
                </div>
              </div>
              
              <Button asChild className="zen-gradient hover:zen-gradient-hover text-white transition-all duration-300">
                <Link href="/teachers">
                  Meet Our Teachers <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Family Section */}
      <section className="py-24" style={{ background: `linear-gradient(135deg, rgb(232, 232, 232, 0.5), rgb(199, 214, 212, 0.5))` }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              <Baby className="w-4 h-4 mr-2" />
              Family Wellness
            </Badge>
            <h2 className="text-4xl font-bold mb-6">Yoga for Every Family Member</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From toddler yoga to senior-friendly classes, we have something special for everyone in your family
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative">
                <Image
                  src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80"
                  alt="Kids yoga"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Kids & Teens</h3>
                <p className="text-gray-600 mb-4">Fun, engaging yoga that builds confidence and flexibility for young minds and bodies</p>
                <Button variant="outline" size="sm">
                  Explore Kids Classes
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative">
                <Image
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80"
                  alt="Prenatal yoga"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Prenatal & Postnatal</h3>
                <p className="text-gray-600 mb-4">Safe, nurturing practices for expecting and new mothers</p>
                <Button variant="outline" size="sm">
                  View Prenatal Classes
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] relative">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80"
                  alt="Senior yoga"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Senior Friendly</h3>
                <p className="text-gray-600 mb-4">Gentle, accessible practices designed for mature bodies and active aging</p>
                <Button variant="outline" size="sm">
                  Senior Programs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-white" style={{ background: `linear-gradient(135deg, var(--color-zen-5), var(--color-zen-4))` }}>
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Practice?</h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands who have discovered their perfect yoga practice. Start your free trial today and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-4 bg-white hover:bg-gray-100" style={{ color: 'var(--color-zen-5)' }}>
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 zen-gradient border-0 text-white hover:zen-gradient-hover transition-all duration-300">
              <Link href="/browse">Browse All Classes</Link>
            </Button>
          </div>
          
          <p className="mt-8 text-sm opacity-75">No credit card required • Cancel anytime • 14-day free trial</p>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  image
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
      <div className="aspect-[4/3] relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 mb-3">
            {icon}
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
} 