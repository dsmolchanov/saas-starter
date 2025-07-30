"use client";

import { HeroEnhanced } from "@/components/ui/hero-enhanced";
import { BentoGridDemo } from "@/components/ui/bento-grid";
import { BackgroundBeams, FloatingElements } from "@/components/ui/background-beams";
import { HoverEffect, EnhancedFeatureCard } from "@/components/ui/card-hover-effect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";

interface EnhancedHomepageSectionsProps {
  translations: any;
  messages: any;
}

export function EnhancedHomepageSections({ translations: t, messages }: EnhancedHomepageSectionsProps) {
  // Feature data for Bento Grid
  const bentoFeatures = [
    {
      title: t.findTeachers,
      description: t.findTeachersDesc,
      icon: <Heart className="h-6 w-6 text-purple-500" />,
      className: "md:col-span-2",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="p-4 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-12 h-12 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.customizeEverything,
      description: t.customizeDesc,
      icon: <Settings className="h-6 w-6 text-blue-500" />,
      className: "md:col-span-1",
    },
    {
      title: t.perfectTiming,
      description: t.perfectTimingDesc,
      icon: <Clock className="h-6 w-6 text-green-500" />,
      className: "md:col-span-1",
    },
    {
      title: t.crystalClear,
      description: t.crystalClearDesc,
      icon: <Video className="h-6 w-6 text-red-500" />,
      className: "md:col-span-2",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20">
          <motion.div 
            className="flex items-center justify-center w-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Video className="h-8 w-8 text-red-500" />
          </motion.div>
        </div>
      ),
    },
  ];

  // Hover effect items
  const hoverItems = [
    {
      title: t.smartPlaylists,
      description: t.smartPlaylistsDesc,
      icon: <PlayCircle className="h-6 w-6 text-purple-500" />,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: t.forFamily,
      description: t.forFamilyDesc,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=500&q=80",
    },
    {
      title: t.liveWebinars,
      description: t.liveWebinarsDesc,
      icon: <Star className="h-6 w-6 text-yellow-500" />,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80",
    },
  ];

  return (
    <div>
      {/* Enhanced Hero Section */}
      <HeroEnhanced
        title={t.title}
        subtitle={t.subtitle}
        description={t.description}
        primaryButtonText={messages.common?.signUp || t.startTrial}
        secondaryButtonText={messages.navigation?.browse || t.browseClasses}
        primaryButtonHref="/sign-up"
        secondaryButtonHref="/browse"
      />

      {/* Enhanced Features Section with Bento Grid */}
      <section className="py-24 relative">
        <BackgroundBeams>
          <FloatingElements />
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
                <Sparkles className="w-4 h-4 mr-2" />
                Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.whyLove}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.whyDescription}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <BentoGridDemo features={bentoFeatures} />
            </motion.div>
          </div>
        </BackgroundBeams>
      </section>

      {/* Enhanced Playlist Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                <Headphones className="w-4 h-4 mr-2" />
                Smart Features
              </Badge>
              
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t.yourWay}
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                {t.yourWayDesc}
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  t.favoritesCollection,
                  t.recentlyPlayed,
                  t.customPlaylists,
                  t.smartRecommendations,
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300"
                >
                  <Link href="/my_practice">
                    {messages.navigation?.myPractice || t.exploreMyPractice} 
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-100 to-pink-100">
                <div className="p-8 h-full flex flex-col justify-center items-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-center"
                  >
                    <PlayCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-purple-800 mb-2">My Practice</h3>
                    <p className="text-purple-600">Personalized yoga journey</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Cards with Hover Effects */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
              <Star className="w-4 h-4 mr-2" />
              Premium Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Advanced Yoga Experience
            </h2>
          </motion.div>
          
          <HoverEffect items={hoverItems} className="gap-8" />
        </div>
      </section>
    </div>
  );
}