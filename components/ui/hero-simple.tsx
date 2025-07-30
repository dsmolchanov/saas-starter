"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroSimpleProps {
  title: string;
  subtitle: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonHref: string;
}

export function HeroSimple({
  title,
  subtitle,
  description,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonHref,
  secondaryButtonHref,
}: HeroSimpleProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-zen-mint to-zen-dodger">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 zen-gradient rounded-full blur-xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-zen-dodger rounded-full blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-8 text-white">
          {title}
          <span className="text-zen-anakiwa block">
            {subtitle}
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Button
            asChild
            size="lg"
            className="text-lg px-8 py-4 zen-gradient hover:zen-gradient-hover transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            <Link href={primaryButtonHref}>
              {primaryButtonText}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-lg px-8 py-4 border-2 border-zen-anakiwa text-zen-anakiwa hover:bg-zen-anakiwa hover:bg-opacity-10 hover:text-zen-mint backdrop-blur-sm transform hover:scale-105 transition-all duration-300"
          >
            <Link href={secondaryButtonHref}>
              {secondaryButtonText}
            </Link>
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}