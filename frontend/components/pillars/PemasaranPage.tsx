import React, { useState } from 'react';
import { Megaphone, LayoutTemplate, PenTool, Hash, Copy, Smartphone, Globe, MessageCircle, Loader2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function PemasaranPage() {
  const [product, setProduct] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Kasual & Fun');
  const [audience, setAudience] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    if (!product) return;
    setIsProcessing(true);
    setOutput('');
    
    try {
      const prompt = `Buatkan copy pemasaran / caption media sosial untuk platform ${platform}.
Produk/Jasa: ${product}
Target Audiens: ${audience || 'Umum'}
Tone Voice: ${tone}

Berikan langsung captionnya, termasuk emoji dan hashtag yang relevan. Jangan berikan pengantar atau tag XML. Gunakan format yang sesuai dengan kebiasaan platform ${platform}.`;

      const messages = [{ role: 'user' as const, content: prompt }];
      
      let fullOutput = '';
      await streamChat(messages, 'chat', (chunk) => {
        fullOutput += chunk.content;
        setOutput(fullOutput);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setOutput('Error: Gagal membuat campaign marketing.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Megaphone size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Jenius Konten (Pemasaran)</h1>
          <p className="text-bp-medium-gray mt-1">Hasilkan copy kreatif, ide kampanye, dan deskripsi produk viral.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised p-6 flex flex-col gap-6">
          <h3 className="font-bold text-lg mb-2">Campaign Generator</h3>
          
          <div>
            <label className="bp-label">Deskripsi Produk/Jasa</label>
            <textarea 
              className="bp-textarea"
              placeholder="Jelaskan produk Anda. Misal: Sepatu lari ramah lingkungan dari daur ulang botol plastik..."
              value={product}
              onChange={e => setProduct(e.target.value)}
            />
          </div>

          <div>
            <label className="bp-label">Pilih Platform</label>
            <div className="flex gap-4">
              {[
                { name: 'Instagram', icon: <Smartphone size={18} /> },
                { name: 'Twitter', icon: <MessageCircle size={18} /> },
                { name: 'LinkedIn', icon: <Globe size={18} /> }
              ].map(p => (
                <button 
                  key={p.name}
                  onClick={() => setPlatform(p.name)}
                  className={`flex-1 py-3 flex flex-col items-center gap-2 rounded-lg border transition-colors ${platform === p.name ? 'border-bp-electric-blue bg-blue-50 text-bp-electric-blue' : 'border-bp-border-gray hover:bg-bp-light-bg'}`}
                >
                  {p.icon}
                  <span className="text-xs font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="bp-label">Tone Voice</label>
              <select className="bp-input" value={tone} onChange={e => setTone(e.target.value)}>
                <option>Kasual & Fun</option>
                <option>Profesional & B2B</option>
                <option>Inspiratif</option>
                <option>Provokatif / FOMO</option>
              </select>
            </div>
            <div>
              <label className="bp-label">Target Audiens</label>
              <input type="text" className="bp-input" placeholder="Gen Z, Karyawan..." value={audience} onChange={e => setAudience(e.target.value)} />
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isProcessing || !product}
            className="bp-btn bp-btn-primary dark-theme w-full justify-center gap-2 mt-auto"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <PenTool size={16} />} 
            {isProcessing ? 'Meracik Kata...' : 'Generate Konten'}
          </button>
        </div>

        {/* Output Preview */}
        <div className="bg-bp-light-bg border border-bp-border-gray rounded-xl shadow-bp-shadow-raised p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2">Hasil Konten {isProcessing && <Loader2 className="animate-spin text-bp-electric-blue" size={16} />}</h3>
            <div className="flex gap-2">
              <button className="bp-btn bp-btn-ghost text-xs p-2 h-auto" onClick={() => navigator.clipboard.writeText(output)} disabled={!output}><Copy size={16} /></button>
            </div>
          </div>

          <div className="bg-white border border-bp-border-gray rounded-xl overflow-hidden max-w-sm mx-auto shadow-sm">
            {/* Mock IG Post */}
            {platform === 'Instagram' && (output || isProcessing || product) ? (
              <div>
                <div className="p-3 border-b border-bp-border-gray flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-500"></div>
                  <div className="font-bold text-sm">neurova.brand</div>
                </div>
                <div className="w-full aspect-square bg-bp-soft-gray flex flex-col items-center justify-center text-bp-muted-gray p-8 text-center border-b border-bp-border-gray relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-bp-electric-blue/10 to-transparent"></div>
                  <Megaphone size={48} className="mb-4 text-bp-electric-blue opacity-50" />
                  <p className="font-bold text-bp-deep-black z-10 text-lg">Visual Konten AI</p>
                  <p className="text-xs mt-2 z-10">[Ruang Untuk Gambar Produk]</p>
                </div>
                <div className="p-4 text-sm">
                  <p className="font-bold mb-1">neurova.brand</p>
                  <div className="mb-3 leading-relaxed whitespace-pre-wrap">
                    {isProcessing && !output ? (
                      <div className="space-y-2 animate-pulse mt-2">
                         <div className="h-3 bg-bp-border-gray rounded w-full"></div>
                         <div className="h-3 bg-bp-border-gray rounded w-full"></div>
                         <div className="h-3 bg-bp-border-gray rounded w-3/4"></div>
                      </div>
                    ) : output ? (
                      output
                    ) : (
                      <span className="text-bp-muted-gray italic">Klik generate untuk melihat hasil copywriting...</span>
                    )}
                  </div>
                </div>
              </div>
            ) : platform !== 'Instagram' && (output || isProcessing || product) ? (
              <div className="p-4">
                 <div className="flex items-center gap-3 mb-4 border-b border-bp-border-gray pb-3">
                    {platform === 'Twitter' ? <MessageCircle size={24} className="text-blue-400" /> : <Globe size={24} className="text-blue-700" />}
                    <div className="font-bold text-sm">{platform} Post</div>
                 </div>
                 <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {isProcessing && !output ? (
                      <div className="space-y-2 animate-pulse mt-2">
                         <div className="h-3 bg-bp-border-gray rounded w-full"></div>
                         <div className="h-3 bg-bp-border-gray rounded w-full"></div>
                         <div className="h-3 bg-bp-border-gray rounded w-3/4"></div>
                      </div>
                    ) : output ? (
                      output
                    ) : (
                      <span className="text-bp-muted-gray italic">Klik generate untuk melihat hasil copywriting...</span>
                    )}
                 </div>
              </div>
            ) : (
              <div className="p-8 text-center text-bp-muted-gray flex flex-col items-center justify-center h-64">
                <Hash size={48} className="mb-4 opacity-20" />
                <p>Klik Generate untuk melihat preview mockup {platform}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
