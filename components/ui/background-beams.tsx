"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { ReactNode } from "react";

export const BackgroundBeams = ({ 
  className,
  children 
}: { 
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated Beams */}
      <div className="absolute inset-0">
        {/* Beam 1 */}
        <motion.div
          className="absolute h-[2px] w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: 0,
          }}
          style={{ top: "20%" }}
        />
        
        {/* Beam 2 */}
        <motion.div
          className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-30"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 2,
          }}
          style={{ top: "60%" }}
        />
        
        {/* Beam 3 */}
        <motion.div
          className="absolute h-[1.5px] w-full bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-25"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 4,
          }}
          style={{ top: "80%" }}
        />
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const FloatingElements = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Floating Orb 1 */}
      <motion.div
        className="absolute w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: "10%",
          left: "10%",
        }}
      />
      
      {/* Floating Orb 2 */}
      <motion.div
        className="absolute w-24 h-24 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: "60%",
          right: "15%",
        }}
      />
      
      {/* Floating Orb 3 */}
      <motion.div
        className="absolute w-20 h-20 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-full blur-xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          bottom: "20%",
          left: "20%",
        }}
      />
    </div>
  );
};