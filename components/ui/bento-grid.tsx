"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  header?: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -4,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 opacity-0 group-hover/bento:opacity-100 transition duration-200" />
      
      {/* Content */}
      <div className="relative z-10">
        {header}
        <div className="group-hover/bento:translate-x-2 transition duration-200">
          {icon && (
            <div className="mb-4 text-neutral-600 dark:text-neutral-300">
              {icon}
            </div>
          )}
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200 mb-2 mt-2">
            {title}
          </div>
          <div className="font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {description}
          </div>
        </div>
      </div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover/bento:opacity-100 transition duration-200" 
           style={{
             background: 'linear-gradient(90deg, transparent, transparent), linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)',
             backgroundClip: 'padding-box, border-box',
             backgroundOrigin: 'padding-box, border-box',
           }} />
    </motion.div>
  );
};

export const BentoGridDemo = ({
  features,
}: {
  features: Array<{
    title: string;
    description: string;
    icon: ReactNode;
    className?: string;
    header?: ReactNode;
  }>;
}) => {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      {features.map((feature, index) => (
        <BentoGridItem
          key={index}
          title={feature.title}
          description={feature.description}
          icon={feature.icon}
          className={feature.className}
          header={feature.header}
        />
      ))}
    </BentoGrid>
  );
};