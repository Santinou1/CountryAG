import React from 'react';
import { X } from 'lucide-react';

interface QRModalProps {
  qrData: string;
  onClose: () => void;
  title: string;
}

export const QRModal: React.FC<QRModalProps> = ({ qrData, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center">
          <img 
            src={qrData} 
            alt="Código QR" 
            className="w-64 h-64 object-contain"
          />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Muestra este código QR al chofer para validar tu boleto
        </p>
      </div>
    </div>
  );
}; 