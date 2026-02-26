import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string | null;
}

const VideoModal: React.FC<Props> = ({ isOpen, onClose, videoUrl }) => {
  const src = videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-black relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-red-500 z-10 bg-black/50 rounded-full p-1"
            >
              <X size={32} />
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <iframe
                width="100%"
                height="100%"
                src={src}
                title="Nizami Introduction"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
