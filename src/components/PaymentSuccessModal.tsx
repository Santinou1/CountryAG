import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, X } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative mx-4"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-transform hover:rotate-90"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              >
                <CheckCircle className="w-16 h-16 text-primary" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-primary">¡Pago exitoso!</h2>
              
              <p className="text-secondary">
                Has adquirido tu <span className="font-semibold">Boleto Diario San Sebastian</span>.
              </p>

              <div className="bg-blue-50 border border-accent rounded-xl p-4 text-left w-full mt-4">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="w-8 h-8 text-primary flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-primary">Detalles de uso</h3>
                </div>
                <ul className="space-y-2 text-secondary text-sm list-disc list-inside">
                  <li>Tu boleto se activará con el primer escaneo del código QR.</li>
                  <li>Una vez activado, será válido por 24 horas.</li>
                  <li>Puedes usarlo de forma ilimitada durante su vigencia.</li>
                </ul>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-4 px-6 py-3 bg-primary text-white rounded-lg text-lg font-semibold shadow-md hover:bg-secondary transition-all duration-300"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 