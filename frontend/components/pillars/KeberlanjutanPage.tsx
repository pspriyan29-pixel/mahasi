import React, { useState } from 'react';
import { Leaf, Sun, Recycle, Droplets, BatteryCharging, ArrowRight, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function KeberlanjutanPage() {
  const [balconySize, setBalconySize] = useState('');
  const [sunlight, setSunlight] = useState('Sedang (Terang sebagian)');
  const [isGeneratingGarden, setIsGeneratingGarden] = useState(false);
  const [gardenOutput, setGardenOutput] = useState('');

  const handleGenerateGarden = async () => {
    if (!balconySize) return;
    setIsGeneratingGarden(true);
    setGardenOutput('');
    
    try {
      const prompt = `Saya ingin membuat kebun urban di balkon/halaman dengan luas ${balconySize} meter persegi. Tingkat cahaya matahari: ${sunlight}.
Berikan saran jenis tanaman (sayur/herbal/hias) yang cocok, beserta panduan singkat penataannya untuk memaksimalkan ruang (misal vertical garden atau pot gantung).`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'research', (chunk) => {
        setGardenOutput(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setGardenOutput('Error: Gagal membuat rencana kebun.');
    } finally {
      setIsGeneratingGarden(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Leaf size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Pejuang Bumi (Keberlanjutan)</h1>
          <p className="text-bp-medium-gray mt-1">Bangun solusi untuk daur ulang, hemat energi, dan urban farming.</p>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#1D2129] text-white rounded-2xl shadow-bp-shadow-floating p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#374151]">
         <div className="max-w-xl">
            <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30 mb-4 inline-block">Eco-Track AI Active</span>
            <h2 className="text-2xl font-bold mb-2">Jejak Karbon Anda Bulan Ini: Rendah</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Berkat panduan hemat energi AI minggu lalu, Anda berhasil mengurangi konsumsi listrik sebesar 15% dibandingkan bulan sebelumnya.</p>
         </div>
         <div className="flex gap-4">
            <div className="text-center bg-[#0C0D0E] p-4 rounded-xl border border-[#374151]">
               <div className="text-2xl font-bold text-green-400 mb-1">-15%</div>
               <div className="text-xs text-gray-500 font-medium">Listrik</div>
            </div>
            <div className="text-center bg-[#0C0D0E] p-4 rounded-xl border border-[#374151]">
               <div className="text-2xl font-bold text-blue-400 mb-1">20L</div>
               <div className="text-xs text-gray-500 font-medium">Air Dihemat</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Recycle Guide */}
         <div className="bg-white border border-bp-border-gray rounded-2xl shadow-bp-shadow-raised p-6 flex flex-col">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4"><Recycle size={24} /></div>
            <h3 className="font-bold text-lg mb-2">Asisten Daur Ulang</h3>
            <p className="text-sm text-bp-medium-gray mb-6">Scan kemasan produk untuk mengetahui instruksi pemilahan sampah yang tepat di kota Anda.</p>
            <div className="mt-auto">
               <div className="border-2 border-dashed border-bp-border-gray rounded-xl p-6 text-center hover:border-bp-electric-blue cursor-pointer transition-colors bg-bp-light-bg">
                  <CameraPlaceholder />
                  <p className="text-xs font-bold mt-2 text-bp-deep-black">Tap untuk Buka Kamera</p>
               </div>
            </div>
         </div>

         {/* Energy Tips */}
         <div className="bg-white border border-bp-border-gray rounded-2xl shadow-bp-shadow-raised p-6 flex flex-col">
            <div className="w-12 h-12 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4"><Sun size={24} /></div>
            <h3 className="font-bold text-lg mb-2">Optimasi Energi Rumah</h3>
            <p className="text-sm text-bp-medium-gray mb-6">AI menganalisis tagihan listrik Anda dan memberikan strategi pengurangan biaya.</p>
            <div className="mt-auto space-y-3">
               <div className="bg-bp-light-bg rounded-lg p-3 text-sm border border-bp-border-gray flex items-start gap-3">
                  <BatteryCharging size={16} className="text-bp-electric-blue shrink-0 mt-0.5" />
                  <span>Cabut colokan TV & Microwave saat malam. Estimasi hemat: Rp 20.000/bln.</span>
               </div>
               <div className="bg-bp-light-bg rounded-lg p-3 text-sm border border-bp-border-gray flex items-start gap-3">
                  <Droplets size={16} className="text-bp-electric-blue shrink-0 mt-0.5" />
                  <span>Cek indikasi kebocoran pipa di area taman belakang.</span>
               </div>
            </div>
         </div>

         {/* Urban Farming */}
         <div className="bg-white border border-bp-border-gray rounded-2xl shadow-bp-shadow-raised p-6 flex flex-col">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4"><Leaf size={24} /></div>
            <h3 className="font-bold text-lg mb-2">Urban Garden Planner</h3>
            <p className="text-sm text-bp-medium-gray mb-4">Buat rencana kebun balkon berdasarkan arah cahaya matahari dan iklim lokal Anda.</p>
            <div className="mt-auto flex flex-col gap-3">
               <div>
                  <label className="bp-label">Luas Area (M2)</label>
                  <input 
                    type="number" 
                    className="bp-input" 
                    placeholder="Contoh: 4" 
                    value={balconySize}
                    onChange={e => setBalconySize(e.target.value)}
                  />
               </div>
               <div>
                  <label className="bp-label">Sinar Matahari</label>
                  <select 
                    className="bp-input"
                    value={sunlight}
                    onChange={e => setSunlight(e.target.value)}
                  >
                    <option>Sangat Terik (Sepanjang Hari)</option>
                    <option>Sedang (Terang sebagian)</option>
                    <option>Teduh (Jarang kena matahari)</option>
                  </select>
               </div>
               <button 
                  onClick={handleGenerateGarden}
                  disabled={isGeneratingGarden || !balconySize}
                  className="bp-btn bp-btn-primary bg-green-600 hover:bg-green-700 text-white border-none w-full text-xs py-2 gap-2 mt-2"
               >
                  {isGeneratingGarden ? <Loader2 className="animate-spin" size={14} /> : null}
                  Generate Layout Tanaman
               </button>
            </div>
         </div>
      </div>

      {/* Urban Farming AI Result */}
      {(gardenOutput || isGeneratingGarden) && (
         <div className="bg-white border border-bp-border-gray rounded-2xl shadow-bp-shadow-raised p-8 mt-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
               <Leaf size={20} className="text-green-500" /> Rencana Urban Farming AI
            </h3>
            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
               {isGeneratingGarden && !gardenOutput ? (
                  <div className="space-y-4 animate-pulse">
                     <div className="h-4 bg-green-200 rounded w-1/2"></div>
                     <div className="h-4 bg-green-200 rounded w-full"></div>
                     <div className="h-4 bg-green-200 rounded w-3/4"></div>
                  </div>
               ) : (
                  <div className="text-sm text-bp-deep-black leading-relaxed whitespace-pre-wrap">
                     {gardenOutput}
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}

function CameraPlaceholder() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-bp-muted-gray">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}
