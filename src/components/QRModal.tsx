import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    qrCode: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, title, qrCode }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-primary">{title}</h3>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="text-gray-500 hover:text-secondary transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            src={qrCode} 
                            alt="Código QR" 
                            className="w-64 h-64 object-contain"
                        />
                    </div>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-sm text-gray-500 mt-4"
                    >
                        Muestra este código QR al chofer para validar tu boleto
                    </motion.p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}; 