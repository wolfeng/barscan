import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import ScanHistory from './components/ScanHistory';
import DetailModal from './components/DetailModal';
import { ScanResult } from './types';
import { identifyProduct } from './services/geminiService';
import { ScanLine, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('barscan_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem('barscan_history', JSON.stringify(history));
  }, [history]);

  const handleScanSuccess = async (decodedText: string, decodedResult: any) => {
    setIsScanning(false);
    
    // Play a beep sound
    const audio = new Audio('https://freetestdata.com/wp-content/uploads/2021/09/Free_Test_Data_100KB_MP3.mp3'); // Fallback placeholder sound, or system beep logic
    // Actually, let's use a simple oscillator beep for reliability
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1000;
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => osc.stop(), 100);
    } catch(e) {
        // ignore audio errors
    }

    const newScan: ScanResult = {
      decodedText,
      resultFormat: decodedResult?.result?.format?.formatName || 'UNKNOWN',
      timestamp: Date.now(),
      loading: true
    };

    // Add to history immediately
    setHistory(prev => [newScan, ...prev]);
    setSelectedScan(newScan); // Open modal immediately

    // Perform AI lookup
    const productInfo = await identifyProduct(decodedText, newScan.resultFormat);

    // Update the record with AI info
    setHistory(prev => prev.map(item => 
        (item.timestamp === newScan.timestamp) 
        ? { ...item, productInfo, loading: false } 
        : item
    ));
    
    // Update the open modal if it's the same item
    setSelectedScan(prev => 
        (prev && prev.timestamp === newScan.timestamp)
        ? { ...prev, productInfo, loading: false }
        : prev
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <ScanLine className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">BarScan AI</h1>
        </div>
        <div className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded-full">
           v1.0
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <ScanHistory history={history} onSelect={setSelectedScan} />
      </main>

      {/* Floating Action Button (FAB) for Scanning */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={() => setIsScanning(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          <ScanLine className="w-8 h-8" />
          {/* Pulse effect */}
          <span className="absolute inset-0 rounded-full bg-indigo-600 opacity-20 group-hover:animate-ping"></span>
        </button>
      </div>

      {/* Scanner Overlay */}
      {isScanning && (
        <Scanner 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setIsScanning(false)} 
        />
      )}

      {/* Details Modal */}
      {selectedScan && (
        <DetailModal 
          scan={selectedScan} 
          onClose={() => setSelectedScan(null)} 
        />
      )}
    </div>
  );
};

export default App;
