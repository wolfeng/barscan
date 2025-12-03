import React from 'react';
import { ScanResult } from '../types';
import { Barcode, ExternalLink, Package, Loader2 } from 'lucide-react';

interface ScanHistoryProps {
  history: ScanResult[];
  onSelect: (scan: ScanResult) => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Barcode className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No scans yet</p>
        <p className="text-sm">Tap the scan button to start</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Recent Scans</h3>
      {history.map((scan, index) => (
        <div 
          key={`${scan.decodedText}-${scan.timestamp}`}
          onClick={() => onSelect(scan)}
          className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4 active:scale-95 transition-transform cursor-pointer"
        >
          <div className="bg-indigo-50 p-3 rounded-lg flex-shrink-0">
             <Barcode className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-gray-900 truncate">
                {scan.productInfo ? scan.productInfo.name : scan.decodedText}
              </h4>
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border">
                {scan.resultFormat}
              </span>
            </div>
            
            {scan.loading ? (
                <div className="flex items-center gap-2 mt-1 text-indigo-600 text-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Identifying...</span>
                </div>
            ) : (
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {scan.productInfo?.category || "Unknown Category"}
                </p>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
              {new Date(scan.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScanHistory;
