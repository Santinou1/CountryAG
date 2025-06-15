import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, KeyRound, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: { boletoId: number; type: 'ida' | 'vuelta'; codigo: string }) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const handleScan = useCallback(async () => {
    if (!webcamRef.current || !isScanning) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        try {
          const data = JSON.parse(code.data);
          if (data.boletoId && data.type && data.codigo) {
            setIsScanning(false);
            onScan(data);
          }
        } catch (e) {
          setError('QR inválido');
        }
      }
    } catch (e) {
      console.error('Error al escanear:', e);
    }
  }, [isScanning, onScan]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning && !isManualMode) {
      interval = setInterval(handleScan, 100);
    }
    return () => clearInterval(interval);
  }, [isScanning, isManualMode, handleScan]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.length === 4) {
      // Aquí asumimos que es un código de ida por defecto
      // Podrías agregar un selector para elegir entre ida/vuelta
      onScan({
        boletoId: 0, // Esto se actualizará en el backend
        type: 'ida',
        codigo: manualCode
      });
    } else {
      setError('El código debe tener 4 dígitos');
    }
  };

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

        <div className="flex justify-between mb-4">
          <button
            onClick={() => {
              setIsManualMode(false);
              setError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              !isManualMode ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Camera className="w-5 h-5" />
            Escanear QR
          </button>
          <button
            onClick={() => {
              setIsManualMode(true);
              setError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isManualMode ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <KeyRound className="w-5 h-5" />
            Ingresar Código
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isManualMode ? (
            <motion.form
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleManualSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrese el código de 4 dígitos
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value.replace(/[^0-9]/g, ''));
                    setError(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1234"
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm"
                >
                  {error}
                </motion.p>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Validar Código
              </button>
            </motion.form>
          ) : (
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
                    className="w-48 h-48 border-2 border-blue-500 rounded-lg"
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
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}; 