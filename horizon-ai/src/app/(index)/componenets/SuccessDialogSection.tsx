import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ open, onOpenChange, email }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring",
              damping: 20,
              stiffness: 300
            }}
            className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl my-8"
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
              {/* Close Button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>

              <div className="px-8 pt-20 pb-10 sm:px-10">
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className="mb-8"
                >
                  <div className="h-24 w-24 sm:h-28 sm:w-28 bg-[#146C94] rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Check className="h-12 w-12 sm:h-14 sm:w-14 text-white" strokeWidth={3} />
                  </div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#146C94] tracking-tight">
                    Request Received!
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
                    We&apos;ll match you with a qualified therapist and send you booking details soon.
                  </p>

                  {/* Email Badge */}
                  <div className="flex justify-center mt-6">
                    <div className="bg-gray-50 px-6 py-3 rounded-xl inline-flex items-center shadow-sm border border-gray-100">
                      <span className="text-gray-600 font-mono text-sm sm:text-base">{email}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-6 text-sm sm:text-base text-gray-500">
                    <p>
                      Check your email for next steps and appointment options. Your mental health journey begins here.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessDialog;