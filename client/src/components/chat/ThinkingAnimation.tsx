import React from "react";
import { Sprout } from "lucide-react";
import { motion } from "framer-motion";

export default function ThinkingAnimation() {
  // Animation variants for thinking circles
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2
      }
    },
    end: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const circleVariants = {
    start: {
      scale: 0.6,
      opacity: 0.2
    },
    end: {
      scale: 1,
      opacity: 1
    }
  };
  
  const circleTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  };
  
  return (
    <div className="flex mb-4 font-sans">
      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
        <Sprout className="h-4 w-4" />
      </div>
      
      <div className="ml-3 bg-white p-4 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm max-w-[80%] font-sans">
        <div className="flex flex-col space-y-2">
          <div className="text-xs text-gray-500 mb-1">Generating response...</div>
          <motion.div
            className="flex justify-center space-x-3"
            variants={containerVariants}
            initial="start"
            animate="end"
          >
            <motion.div
              className="h-3 w-3 bg-primary/40 rounded-full"
              variants={circleVariants}
              transition={{...circleTransition, delay: 0}}
            />
            <motion.div
              className="h-3 w-3 bg-primary/60 rounded-full"
              variants={circleVariants}
              transition={{...circleTransition, delay: 0.2}}
            />
            <motion.div
              className="h-3 w-3 bg-primary/80 rounded-full"
              variants={circleVariants}
              transition={{...circleTransition, delay: 0.4}}
            />
            <motion.div
              className="h-3 w-3 bg-primary rounded-full"
              variants={circleVariants}
              transition={{...circleTransition, delay: 0.6}}
            />
          </motion.div>
          <div className="italic text-xs text-gray-400 mt-1">Analyzing agricultural data and preparing insights</div>
        </div>
      </div>
    </div>
  );
}