"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode, useState } from "react";

interface HoverEffectProps {
  items: Array<{
    title: string;
    description: string;
    icon: ReactNode;
    image?: string;
    link?: string;
  }>;
  className?: string;
}

export const HoverEffect = ({ items, className }: HoverEffectProps) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item?.link || idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <motion.div
            className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
            layoutId={hoveredIndex === idx ? "hoverBackground" : undefined}
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: hoveredIndex === idx ? 1 : 0,
              scale: hoveredIndex === idx ? 1 : 1,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          />
          
          <motion.div 
            className="rounded-2xl h-full w-full p-6 overflow-hidden bg-white/80 dark:bg-black/80 border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20 backdrop-blur-sm"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Image Header */}
            {item.image && (
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    {item.icon}
                  </div>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="relative z-50">
              {!item.image && (
                <div className="mb-4 text-neutral-500 dark:text-neutral-300">
                  {item.icon}
                </div>
              )}
              
              <h3 className="font-bold text-xl text-neutral-700 dark:text-neutral-200 mb-3">
                {item.title}
              </h3>
              
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
            
            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "linear-gradient(45deg, transparent, transparent)",
              }}
              animate={{
                background: hoveredIndex === idx 
                  ? "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1), rgba(59, 130, 246, 0.1))"
                  : "linear-gradient(45deg, transparent, transparent)",
              }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Glow Effect */}
            <motion.div
              className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300"
              animate={{
                opacity: hoveredIndex === idx ? 0.3 : 0,
              }}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
};

// Enhanced Feature Card Component
export const EnhancedFeatureCard = ({
  icon,
  title,
  description,
  image,
  className,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  image?: string;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn(
        "relative group cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-300" />
      
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 h-full border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),transparent)] opacity-0 group-hover:opacity-100 transition duration-300" />
        
        {/* Image */}
        {image && (
          <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}
        
        {/* Icon */}
        <motion.div
          className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
        
        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition duration-300">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Hover Arrow */}
        <motion.div
          className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
          initial={{ x: -10, opacity: 0 }}
          animate={{ 
            x: isHovered ? 0 : -10, 
            opacity: isHovered ? 1 : 0 
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
        </motion.div>
      </div>
    </motion.div>
  );
};