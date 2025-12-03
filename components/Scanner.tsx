import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { SUPPORTED_FORMATS } from '../constants';
import { ScanResult } from '../types';
import { X, Camera, RefreshCw } from 'lucide-react';

interface ScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const regionId = "reader";

    const startScanner = async () => {
      try {
        // Request camera permissions explicitly first to handle UI state better
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode(regionId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 300, height: 150 }, // Wider box for barcodes
          aspectRatio: 1.0,
          formatsToSupport: SUPPORTED_FORMATS, // Only barcodes
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
             // Stop scanning on success to prevent multiple triggers
            if (scannerRef.current?.isScanning) {
                scannerRef.current.pause(); 
            }
            onScanSuccess(decodedText, decodedResult);
          },
          (errorMessage) => {
            // parse error, ignore for UI noise
            // console.log(errorMessage);
          }
        );
        
        if(isMounted) setIsInitializing(false);

      } catch (err) {
        if (isMounted) {
          console.error("Error starting scanner", err);
          setError("Could not access camera. Please ensure permissions are granted.");
          setIsInitializing(false);
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
        }).catch(err => console.error("Failed to stop scanner", err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Header controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Camera className="w-5 h-5" /> Scan Barcode
        </h2>
        <button 
          onClick={onClose}
          className="bg-white/20 p-2 rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="w-full max-w-md px-4 relative">
        <div 
          id="reader" 
          className="w-full overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl bg-black"
        ></div>
        
        {/* Loading Overlay */}
        {isInitializing && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
            <RefreshCw className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-medium">Starting Camera...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/90 z-30 p-6 text-center">
             <div className="bg-red-500/20 p-4 rounded-full mb-4">
                <Camera className="w-8 h-8 text-red-500" />
             </div>
            <p className="mb-4">{error}</p>
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium"
            >
                Close
            </button>
          </div>
        )}

        {/* Visual Guide Overlay (Only visible when running) */}
        {!isInitializing && !error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[300px] h-[150px] border-2 border-red-500 rounded-lg relative opacity-50 shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
               <p className="absolute -bottom-8 left-0 right-0 text-center text-white text-sm font-medium shadow-black drop-shadow-md">
                 Align barcode within frame
               </p>
            </div>
          </div>
        )}
      </div>

       <div className="absolute bottom-10 left-0 right-0 p-4 text-center">
          <p className="text-white/60 text-xs">
              Supports UPC, EAN, Code 128, etc. (No QR Codes)
          </p>
       </div>
    </div>
  );
};

export default Scanner;
