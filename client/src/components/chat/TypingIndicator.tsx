import { Sprout, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <div className="flex mb-4">
      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
        <Sprout className="h-4 w-4" />
      </div>
      
      <div className="ml-3 bg-white p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm max-w-[80%]">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="mr-2 text-xs text-gray-500">Arina is typing</div>
          <div className="flex space-x-1">
            <motion.div 
              className="h-2 w-2 bg-primary/60 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", delay: 0 }}
            />
            <motion.div 
              className="h-2 w-2 bg-primary/70 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", delay: 0.2 }}
            />
            <motion.div 
              className="h-2 w-2 bg-primary/80 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "loop", delay: 0.4 }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}