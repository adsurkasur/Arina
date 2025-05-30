import React from "react";
import { motion } from "framer-motion";
import { Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <div className="flex mb-4 font-sans">
      <motion.div
        className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-lg"
        initial={{ scale: 0.8, opacity: 0.7 }}
        animate={{ scale: [0.8, 1.1, 0.95, 1], opacity: [0.7, 1, 0.9, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop" }}
      >
        <Sprout className="h-4 w-4" />
      </motion.div>
      <motion.div
        className="ml-3 bg-white p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-md max-w-[80%] font-sans"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <motion.div
          className="flex items-center gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0.5 },
            visible: {
              opacity: 1,
              transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              },
            },
          }}
        >
          <div className="mr-2 text-xs text-gray-500">{t("chat.typing")}</div>
          <motion.span
            className="flex gap-1"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <motion.span
              className="block w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0,
              }}
            />
            <motion.span
              className="block w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.2,
              }}
            />
            <motion.span
              className="block w-2 h-2 bg-gray-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.4,
              }}
            />
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  );
}