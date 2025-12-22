import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SuccessAnimation({ 
  show, 
  onClose, 
  title = 'Muvaffaqiyatli!', 
  message = 'Ma\'lumotlar saqlandi',
  autoClose = true,
  autoCloseDelay = 3000 
}: SuccessAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const particles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        delay: Math.random() * 0.3,
        color: ['#042d62', '#0369a1', '#0ea5e9', '#22d3ee', '#fbbf24'][Math.floor(Math.random() * 5)],
      }));
      setConfetti(particles);

      // Auto close
      if (autoClose) {
        const timer = setTimeout(onClose, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 300 
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              {/* Confetti */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {confetti.map((particle) => (
                  <motion.div
                    key={particle.id}
                    initial={{ 
                      y: -20, 
                      x: '50%',
                      opacity: 1,
                      scale: 1,
                      rotate: 0
                    }}
                    animate={{ 
                      y: 400, 
                      x: `calc(50% + ${particle.x}px)`,
                      opacity: 0,
                      scale: 0.5,
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2,
                      delay: particle.delay,
                      ease: "easeIn"
                    }}
                    className="absolute top-0 w-3 h-3 rounded-full"
                    style={{ backgroundColor: particle.color }}
                  />
                ))}
              </div>

              {/* Sparkle effects */}
              <motion.div
                className="absolute top-10 left-10"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>

              <motion.div
                className="absolute bottom-10 right-10"
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [360, 180, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-5 h-5 text-blue-400" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    damping: 10, 
                    stiffness: 200,
                    delay: 0.1 
                  }}
                  className="mb-6 flex justify-center"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.3,
                      times: [0, 0.2, 0.4, 0.6, 1]
                    }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                    <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl text-slate-900 mb-2"
                >
                  {title}
                </motion.h2>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-600 mb-6"
                >
                  {message}
                </motion.p>

                {/* Progress bar (if auto close) */}
                {autoClose && (
                  <motion.div
                    className="w-full h-1 bg-slate-200 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#042d62] to-[#0369a1]"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ 
                        duration: autoCloseDelay / 1000,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
