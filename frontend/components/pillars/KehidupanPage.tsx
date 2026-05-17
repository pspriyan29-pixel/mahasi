import React, { useState } from 'react';
import { Home, Utensils, ShieldAlert, Wifi, Camera, ArrowRight, MessageCircleWarning, Loader2, CheckCircle2 } from 'lucide-react';
import { streamChat } from '../../lib/openrouter';

export default function KehidupanPage() {
  const [ingredients, setIngredients] = useState('');
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [recipeOutput, setRecipeOutput] = useState('');

  const [hoaxMessage, setHoaxMessage] = useState('AWAS! Jangan minum air es setelah makan karena bisa membekukan lemak di perut dan menyebabkan kanker!! Sebarkan ke orang yang Anda sayangi...');
  const [isCheckingHoax, setIsCheckingHoax] = useState(false);
  const [hoaxOutput, setHoaxOutput] = useState('');

  const handleGenerateRecipe = async () => {
    if (!ingredients) return;
    setIsGeneratingRecipe(true);
    setRecipeOutput('');
    
    try {
      const prompt = `Saya punya bahan-bahan berikut di kulkas: ${ingredients}. 
Berikan 1 saran resep masakan yang praktis dan lezat menggunakan bahan-bahan tersebut. Format dengan nama resep, bahan tambahan opsional, dan langkah-langkah singkat.`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'chat', (chunk) => {
        setRecipeOutput(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setRecipeOutput('Error: Gagal mencari resep.');
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const handleCheckHoax = async () => {
    if (!hoaxMessage) return;
    setIsCheckingHoax(true);
    setHoaxOutput('');
    
    try {
      const prompt = `Lakukan fact-checking pada pesan broadcast berikut. Tentukan apakah ini Fakta, Hoaks, atau Sebagian Benar. Berikan penjelasan medis/ilmiah singkat untuk membantahnya jika itu hoaks.
Pesan: "${hoaxMessage}"`;

      await streamChat([{ role: 'user' as const, content: prompt }], 'research', (chunk) => {
        setHoaxOutput(prev => prev + chunk.content);
      }, undefined, 3, undefined, false);
      
    } catch (error) {
      console.error(error);
      setHoaxOutput('Error: Gagal mengecek fakta.');
    } finally {
      setIsCheckingHoax(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-bp-electric-blue rounded-xl flex items-center justify-center text-white shadow-bp-shadow-raised">
          <Home size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-bp-deep-black">Sang Life Hacker (Kehidupan Sehari-hari)</h1>
          <p className="text-bp-medium-gray mt-1">Selesaikan masalah harian dengan solusi AI instan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Meal Planner */}
        <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><Utensils size={20} className="text-orange-500" /> Smart Meal Planner</h3>
          </div>
          
          <p className="text-sm text-bp-medium-gray mb-4">Tuliskan bahan makanan yang ada di kulkas Anda, AI akan menyusun resep lezat dalam hitungan detik.</p>
          
          <textarea 
            className="bp-textarea mb-4" 
            placeholder="Misal: Telur 3 butir, tomat, sisa nasi semalam, bawang merah..."
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
          />
          
          <button 
            onClick={handleGenerateRecipe}
            disabled={isGeneratingRecipe || !ingredients}
            className="bp-btn bp-btn-primary dark-theme w-full mb-6 flex justify-center gap-2"
          >
            {isGeneratingRecipe ? <Loader2 className="animate-spin" size={16} /> : null}
            Cari Resep
          </button>
          
          <div className="space-y-4 flex-1">
             {(recipeOutput || isGeneratingRecipe) && (
               <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg h-full overflow-y-auto">
                  {isGeneratingRecipe && !recipeOutput ? (
                     <div className="space-y-2 animate-pulse">
                        <div className="h-3 bg-orange-200 rounded w-full"></div>
                        <div className="h-3 bg-orange-200 rounded w-full"></div>
                        <div className="h-3 bg-orange-200 rounded w-3/4"></div>
                     </div>
                  ) : (
                     <div className="text-sm text-bp-deep-black leading-relaxed whitespace-pre-wrap">
                        {recipeOutput}
                     </div>
                  )}
               </div>
             )}
          </div>
        </div>

        {/* Hoax Filter */}
        <div className="bg-white border border-bp-border-gray rounded-xl shadow-bp-shadow-raised p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert size={20} className="text-red-500" /> Family Chat Filter</h3>
          </div>
          <p className="text-sm text-bp-medium-gray mb-4">Paste pesan broadcast dari grup WhatsApp keluarga untuk mengecek kebenarannya secara otomatis.</p>
          
          <textarea 
            className="bp-textarea mb-4" 
            placeholder="Paste pesan broadcast di sini..." 
            value={hoaxMessage}
            onChange={e => setHoaxMessage(e.target.value)}
          />
          
          <button 
            onClick={handleCheckHoax}
            disabled={isCheckingHoax || !hoaxMessage}
            className="bp-btn bp-btn-primary dark-theme w-full mb-6 flex justify-center gap-2"
          >
            {isCheckingHoax ? <Loader2 className="animate-spin" size={16} /> : null}
            Cek Fakta (Fact-Check)
          </button>
          
          {(hoaxOutput || isCheckingHoax) && (
            <div className={`p-4 rounded-lg flex gap-3 ${hoaxOutput.toLowerCase().includes('hoaks') || hoaxOutput.toLowerCase().includes('salah') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
               {hoaxOutput.toLowerCase().includes('hoaks') || hoaxOutput.toLowerCase().includes('salah') ? (
                 <MessageCircleWarning size={20} className="text-red-500 shrink-0 mt-0.5" />
               ) : (
                 <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
               )}
               
               <div className="w-full">
                 {isCheckingHoax && !hoaxOutput ? (
                   <div className="space-y-2 animate-pulse w-full mt-1">
                      <div className="h-3 bg-red-200 rounded w-full"></div>
                      <div className="h-3 bg-red-200 rounded w-full"></div>
                      <div className="h-3 bg-red-200 rounded w-3/4"></div>
                   </div>
                 ) : (
                   <div className="text-sm leading-relaxed whitespace-pre-wrap text-bp-deep-black">
                     {hoaxOutput}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        {/* Smart Home Planner */}
        <div className="bg-bp-surface-deep-dark text-white rounded-xl shadow-bp-shadow-raised p-6 md:col-span-2 overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <Wifi size={200} />
          </div>
          <h3 className="font-bold text-lg mb-2 relative z-10">Smart Home Routine Automation</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-lg relative z-10">Hubungkan perangkat IoT Anda dan biarkan AI menyusun rutinitas hemat energi dan kenyamanan otomatis berdasarkan kebiasaan Anda.</p>
          <div className="flex items-center gap-4 relative z-10">
            <button className="bp-btn bg-white text-black hover:bg-gray-200 border-none">Hubungkan Google Home</button>
            <button className="bp-btn bg-transparent border border-gray-600 text-white hover:bg-gray-800">Hubungkan Alexa</button>
          </div>
        </div>
      </div>
    </div>
  );
}
