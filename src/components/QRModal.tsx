import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    qrCode: string;
    codigo: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, title, qrCode, codigo }) => {
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
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
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
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <span className="text-sm text-gray-500">Código de verificación:</span>
                            <span className="text-2xl font-bold text-green-600 tracking-wider">
                                {codigo}
                            </span>
                        </motion.div>
                    </div>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center text-sm text-gray-500 mt-4"
                    >
                        Muestra este código QR y el código de verificación al chofer para validar tu boleto
                    </motion.p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}; 