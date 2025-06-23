import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, KeyRound, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: { boletoId: number; userId: number; codigo: string; timestamp: string }) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleScan = useCallback(async () => {
    if (!webcamRef.current || !isScanning) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('No se pudo procesar la imagen.');
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const data = JSON.parse(code.data);
          if (data.boletoId && data.userId && data.codigo && data.timestamp) {
            console.log('QR válido parseado:', data);
            setIsScanning(false);
            onScan(data);
          } else {
            setError('QR inválido o incompleto');
          }
        } catch (e) {
          setError('QR inválido');
        }
      }
    } catch (e) {
      setError('Error al procesar la imagen.');
    }
  }, [isScanning, onScan]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(handleScan, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning, handleScan]);

  React.useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-4 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-4">
          <span className="text-lg font-semibold text-primary">Escanear QR</span>
        </div>

        <motion.div
          key="scanner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }}
            className="w-full h-full object-cover"
          />
          {isScanning && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-48 h-48 border-2 border-primary rounded-lg"
              />
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-4 left-0 right-0 text-center"
            >
              <p className="bg-red-100 text-red-700 px-4 py-2 rounded-lg inline-block">
                {error}
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 