import React from 'react';
import { ScanResult } from '../types';
import { X, Copy, Tag, Info, DollarSign, Loader2 } from 'lucide-react';

interface DetailModalProps {
  scan: ScanResult | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ scan, onClose }) => {
  if (!scan) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(scan.decodedText);
    // Could add a toast here
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 relative pointer-events-auto transform transition-transform duration-300 ease-out shadow-2xl max-h-[85vh] overflow-y-auto">
        
        {/* Handle bar for mobile drag feeling */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
                {scan.loading ? "Analyzing..." : (scan.productInfo?.name || "Scanned Item")}
            </h2>
             <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mt-2">
                {scan.resultFormat} • {scan.decodedText}
                <button onClick={handleCopy} className="ml-2 hover:text-indigo-600">
                    <Copy className="w-3 h-3" />
                </button>
            </span>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {scan.loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Asking Gemini about this product...</p>
            </div>
        ) : scan.productInfo ? (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                            <Tag className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Category</span>
                        </div>
                        <p className="font-medium text-gray-900">{scan.productInfo.category}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Est. Price</span>
                        </div>
                        <p className="font-medium text-gray-900">{scan.productInfo.estimatedPrice || "N/A"}</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Info className="w-4 h-4" />
                        <span className="text-sm font-semibold uppercase">Description</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl text-sm">
                        {scan.productInfo.description}
                    </p>
                </div>
            </div>
        ) : (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800">
                <p>Could not retrieve product details. This might be an internal barcode or not listed publicly.</p>
            </div>
        )}

        <div className="mt-8 pt-4 border-t flex gap-3">
             <button 
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
             >
                Close
             </button>
             <a 
                href={`https://www.google.com/search?q=${scan.decodedText}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
             >
                Google It
             </a>
        </div>

      </div>
    </div>
  );
};

export default DetailModal;