"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface EnhancedCardSimpleProps {
  icon: ReactNode;
  title: string;
  description: string;
  image?: string;
  className?: string;
}

export function EnhancedCardSimple({
  icon,
  title,
  description,
  image,
  className,
}: EnhancedCardSimpleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative group cursor-pointer transform hover:-translate-y-2 transition-all duration-300",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 zen-gradient rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300" />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 h-full border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-zen-fog/50 to-zen-anakiwa/50 opacity-0 group-hover:opacity-100 transition duration-300" />
        
        {/* Image */}
        {image && (
          <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        
        {/* Icon */}
        <div className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 transform transition-transform duration-200 ${isHovered ? 'scale-110 rotate-3' : ''}`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-zen-dodger dark:group-hover:text-zen-anakiwa transition duration-300">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Hover Arrow */}
        <div className={`absolute bottom-4 right-4 transition-all duration-200 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          <div className="w-8 h-8 zen-gradient rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}