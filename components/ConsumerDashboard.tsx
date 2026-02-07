
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, FoodSource, UserRole } from '../types';
import { 
  Search, Mic, Scan, LayoutGrid, Bookmark, CookingPot, 
  Map as MapIcon, Star, Info, X, MapPin, Check, Truck, Clock, 
  ChevronRight, RefreshCw, Save, ArrowLeft, Heart, Zap,
  Gift, Users, ShoppingBag, ArrowRight, Sparkles, Box, Calendar, Send, Bell, ExternalLink, DollarSign, Camera
} from 'lucide-react';
import { getAIResponse, analyzeFridgeImage, getAlternative, GroundingChunk } from '../services/geminiService';
import WatercolorDecoration from './WatercolorDecoration';
import VoiceAgent from './VoiceAgent';

const RECIPE_PHOTOS = {
  "One-Pot Chickpea Curry": "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=400",
  "Black Bean Tacos": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=400",
  "Veggie Pasta Primavera": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=400",
  "Egg Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400",
  "Sweet Potato and Kale Hash": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400"
};

// Generic food photo for AI-generated recipes
const DEFAULT_FOOD_PHOTO = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400";

const CameraModal: React.FC<{ onClose: () => void; onCapture: (base64: string) => void }> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        alert("Please enable camera access to scan your fridge.");
        onClose();
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const data = canvasRef.current.toDataURL('image/jpeg');
      onCapture(data.split(',')[1]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center p-4">
      <button onClick={onClose} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full">
        <X className="w-8 h-8" />
      </button>
      <div className="relative w-full max-w-lg aspect-[3/4] bg-gray-800 rounded-3xl overflow-hidden border-4 border-white/20">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full border-2 border-dashed border-white/40 rounded-xl" />
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center gap-4">
        <button 
          onClick={capture}
          disabled={!isReady}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform disabled:opacity-50"
        >
          <div className="w-16 h-16 border-4 border-black rounded-full" />
        </button>
        <p className="text-white font-bold uppercase tracking-widest text-xs">Snap your open fridge</p>
      </div>
    </div>
  );
};

const GiftBoxModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ to: '', date: '', isEmpty: false, budget: 15 });

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-full max-w-lg p-8 animate-in zoom-in-95 relative overflow-hidden">
        <WatercolorDecoration type="strawberries" className="-top-10 -right-10 w-40 h-40 opacity-40" />
        
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-3xl font-serif font-bold text-green-900">Gift a Fresh Box</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        {step === 1 && (
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-green-900 mb-2">Who is the box for?</label>
              <input 
                type="text" 
                className="w-full p-4 border rounded-2xl outline-none focus:border-green-700 transition-colors" 
                placeholder="Name or recipient ID"
                onChange={e => setData({...data, to: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-green-900 mb-2">When do you want to deliver it?</label>
              <input 
                type="date" 
                className="w-full p-4 border rounded-2xl outline-none focus:border-green-700 transition-colors" 
                onChange={e => setData({...data, date: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-lime-50 rounded-2xl cursor-pointer hover:bg-lime-100 transition-colors" onClick={() => setData({...data, isEmpty: !data.isEmpty})}>
              <input type="checkbox" checked={data.isEmpty} onChange={() => {}} className="w-5 h-5 pointer-events-none" />
              <div className="text-sm">
                <p className="font-bold text-green-900">Send an "Empty" box</p>
                <p className="text-xs text-green-700">The recipient will fill it out themselves given your budget.</p>
              </div>
            </div>
            <button 
              onClick={() => setStep(2)}
              disabled={!data.to || !data.date}
              className="w-full bg-[#1a2e05] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-900 transition-colors disabled:opacity-50"
            >
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6 animate-in slide-in-from-right duration-300 relative z-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-700" />
            </div>
            <h3 className="text-2xl font-bold text-green-900">Ready to Send!</h3>
            <p className="text-gray-500 leading-relaxed">Your ${data.budget} box for <span className="font-bold text-green-900">{data.to}</span> is scheduled for delivery on <span className="font-bold text-green-900">{data.date}</span>.</p>
            <button onClick={onClose} className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-colors shadow-lg">Confirm & Pay</button>
            <button onClick={() => setStep(1)} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-green-700 transition-colors">Go Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

const ConsumerDashboard: React.FC<{ profile: UserProfile, onUpdateProfile: (p: UserProfile) => void }> = ({ profile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [query, setQuery] = useState('');
  const [searchBudget, setSearchBudget] = useState('20');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<GroundingChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState<any[]>([]);
  const [scanItems, setScanItems] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'meals' && suggestedMeals.length === 0) fetchPersonalizedMeals();
  }, [activeTab]);

  const fetchPersonalizedMeals = async () => {
    setIsSearching(true);
    try {
      const prompt = `Based on these health goals: ${profile.healthGoals.join(',')}, and dietary restrictions:${profile.dietaryRestrictions.join(', ') || 'none'}, suggest 5 budget-friendly recipes (under $2 per serving).

      For each recipe, provide:
      - Recipe name (creative and appetizing)
      - Cooking time (realistic, 10-35 minutes)
      - Cost per serving (be specific, e.g. $1.20)
      - One health goal it addresses

      Return ONLY a JSON array with no markdown, code blocks, or explanations:
      [
        {
        "title" : "Recipe Name",
        "time" : "XX min",
        "goal": "health goal", 
        "cost" : "$X.XX/serve"
      }
      ]`;

      const response = await getAIResponse(prompt, profile, false, false);
      // Parse the AI response 
      let aiText = response.text;

      // Remove markdown code blocks if present 
      aiText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g,'').trim();

      // Try to parse JSON

      try {
        const parsedMeals = JSON.parse(aiText);

        // VAlidate it's an array with at least 1 meal

        if (Array.isArray(parsedMeals) && parsedMeals.length > 0 ){
          setSuggestedMeals(parsedMeals);
        }
        else{
          // Fallback if  parsing fails
          console.warn('AI response is invalid, using defaults');
          setDefaultMeals();
        }
      }
      catch (parseError)
      {
        console.error('Failed to parse AI meals:', parseError, 'Raw text:', aiText);
        setDefaultMeals();
      }
    }
    catch (err){
      console.error('Error fetching meals:',err);
      setDefaultMeals();
    }
    finally{
      // Stop searching for meals because there aren't any to search
      setIsSearching(false);
    }
  };

  // Helper function for fallback meals
  const setDefaultMeals = () => {
    setSuggestedMeals([
      {title: "One-Pot Chickpea Curry", time:"25 min", goal: "Budget friendly", cost:"$1.30/serve"},
      {title: "Black Bean Tacos", time: "15 min", goal: "Quick meal", cost: "$0.95/serve"},
      {title: "Veggie Pasta Primavera", time: "20 min", goal: "Eat healthier", cost: "$1.50/serve"},
      {title: "Egg Fried Rice", time: "18 min", goal: "Use leftovers", cost: "$1.10/serve"},
      { title: "Sweet Potato and Kale Hash", time: "22 min", goal: "Heart healthy", cost: "$1.40/serve" }
      ]);
  };

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const q = customQuery || query;
    if (!q) return;
    setIsSearching(true);
    setAiAnalysis(null);
    setGroundingLinks([]);
    
    try {
      const response = await getAIResponse(q, profile, true, false, `$${searchBudget}`);
      setAiAnalysis(response.text);
      setGroundingLinks(response.grounding);
      setActiveTab('search');
    } catch (err) { 
      console.error(err);
      setAiAnalysis("Sorry, I encountered an error while searching. Please try again.");
    } finally { 
      setIsSearching(false); 
    }
  };

  const handleCapture = async (base64: string) => {
    setShowCamera(false);
    setIsSearching(true);
    try {
        const items = await analyzeFridgeImage(
          base64, 
          profile, 
          (fridgeItems) =>{
            const updatedProfile = {
              ...profile, 
              fridgeContents: fridgeItems, 
              lastFridgeScan: new Date().toISOString()
            };
            onUpdateProfile(updatedProfile);
            localStorage.setItem('nurtur_profile', JSON.stringify(updatedProfile));
          }
        );

        setScanItems(items);
        setActiveTab('scan');
    }
    catch (err) {
      console.error(err);
      setAiAnalysis("Could not analyze image. Try a clearer shot.");
      setActiveTab('search');
    } finally {
      setIsSearching(false);
    }
  }; 

  const handleTriggerScanFromVoice = (itemQuery?: string) => {
    setShowVoiceAgent(false);
    setShowCamera(true);
    if (itemQuery) setQuery(itemQuery);
  };

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#fcfdfa] pb-24 relative overflow-x-hidden font-sans">
      {showVoiceAgent && (
        <VoiceAgent 
          location={profile.location || ''} 
          onClose={() => setShowVoiceAgent(false)} 
          onTriggerScan={handleTriggerScanFromVoice}
        />
      )}
      {showGiftModal && <GiftBoxModal onClose={() => setShowGiftModal(false)} />}
      {showCamera && <CameraModal onClose={() => setShowCamera(false)} onCapture={handleCapture} />}
      
      <header className="p-6 flex justify-between items-center bg-white/60 backdrop-blur-xl sticky top-0 z-[100] border-b border-gray-100">
        <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-serif font-bold text-green-900 leading-tight">nurtur</h1>
              <p className="text-[10px] uppercase tracking-widest text-green-700 font-bold">YOUR NUMBER 1 FOOD SOURCING AGENT</p>
            </div>
            {profile.role === UserRole.CONSUMER && (
                <div className="hidden sm:flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                    <Bell className="w-3 h-3 text-amber-600 animate-bounce" />
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter">Harvest Update: {profile.location || 'Local'} co-op restocked</span>
                </div>
            )}
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-green-900">{profile.name}</p>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 justify-end">
                    <MapPin className="w-3 h-3" />
                    <span>{profile.location}</span>
                </div>
            </div>
            <div className="relative group cursor-pointer" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                <div className="w-12 h-12 rounded-full bg-lime-400 flex items-center justify-center text-green-900 font-bold border-2 border-white shadow-sm text-lg transition-transform group-hover:scale-105">
                    {initials}
                </div>
                {profile.role === UserRole.FARMER && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <svg viewBox="0 0 40 20" className="w-10 h-5 fill-amber-800">
                      <path d="M5 15 Q 20 5, 35 15 L 35 18 L 5 18 Z" />
                      <rect x="15" y="10" width="10" height="5" />
                    </svg>
                  </div>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 relative z-10">
        {/* SCAN RESULTS */}
        {activeTab === 'scan' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex items-center justify-between">
                <h2 className="text-3xl font-serif font-bold text-green-900">Fridge Scan Results</h2>
                <button onClick={() => setActiveTab('search')} className="text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full">Back to Search</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {scanItems.length > 0 ? scanItems.map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl capitalize">{item.item}</h3>
                            {item.aligns ? <Sparkles className="text-lime-500" /> : <Info className="text-orange-400" />}
                        </div>
                        <p className="text-sm text-gray-500 mb-4">{item.reason}</p>
                    </div>
                    <button onClick={() => { setQuery(item.item); handleSearch(undefined, item.item); }} className="text-xs font-bold text-green-700 underline text-left">Find local source</button>
                  </div>
                )) : (
                  <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">No items detected. Try another scan.</p>
                  </div>
                )}
             </div>
          </div>
        )}

        {/* COMMUNITY */}
        {activeTab === 'community' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <WatercolorDecoration type="blueberries" className="-top-20 -left-20 w-80 h-80 opacity-60 rotate-12" />
            
            <section className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-serif font-bold text-green-900">Budget Bin</h2>
                <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <MapPin className="w-3 h-3" /> Area: {profile.location}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Surplus Organic Apples", price: "$0.30/lb", source: "Valley Orchard", tags: ["Organic"] },
                  { name: "Local Harvest Greens", price: "$1.00/bunch", source: "Green Co-op", tags: ["Fresh"] }
                ].map((item, i) => (
                  <div key={i} className="bg-white/90 backdrop-blur p-6 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-lg transition-all group">
                    <div>
                      <div className="flex gap-2 mb-2">
                        {item.tags.map(t => <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 bg-green-100 rounded uppercase text-green-700">{t}</span>)}
                      </div>
                      <p className="font-bold text-green-900 text-lg">{item.name}</p>
                      <p className="text-xs text-gray-400 font-medium">Harvested by {item.source}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">{item.price}</p>
                      <button className="text-xs font-bold text-green-900 underline group-hover:text-green-600">Claim</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="bg-[#1a2e05] p-10 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <Gift className="w-24 h-24 text-lime-400 relative z-10" />
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-3xl font-serif font-bold mb-3">Gift a Fresh Box</h3>
                  <p className="opacity-80 mb-8 leading-relaxed max-w-lg font-medium">Send credits or produce to a local family. You set the amount, they choose the food.</p>
                  <button onClick={() => setShowGiftModal(true)} className="bg-lime-400 text-green-900 px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-black/20">Start Gifting</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* MEALS */}
        {activeTab === 'meals' && (
          <div className="animate-in fade-in duration-500">
            <WatercolorDecoration type="rosemary" className="-top-20 -right-20 w-96 h-96 opacity-60" />
            <h2 className="text-3xl font-serif font-bold text-green-900 mb-8">Personalized Meal Ideas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {suggestedMeals.map((meal, idx) => (
                <div key={idx} className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="h-48 relative overflow-hidden">
                    <img 
                        src={RECIPE_PHOTOS[meal.title as keyof typeof RECIPE_PHOTOS] || DEFAULT_FOOD_PHOTO} 
                        alt={meal.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-bold uppercase">{meal.goal}</div>
                    </div>
                    <div className="p-6">
                    <h4 className="text-xl font-bold text-green-900 mb-3">{meal.title}</h4>
                    <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {meal.time}</div>
                        <div className="px-2 py-1 bg-green-50 text-green-700 rounded-lg font-bold">{meal.cost}</div>
                    </div>
                    <button className="w-full mt-6 py-4 bg-[#1a2e05] text-white rounded-2xl font-bold hover:bg-green-800 transition-colors">Full Recipe</button>
                    </div>
                </div>
                ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        {activeTab === 'search' && (
          <div className="flex flex-col items-center py-8 text-center relative min-h-[70vh]">
            <WatercolorDecoration type="artichoke" className="top-0 left-0 w-64 h-64 opacity-60" />
            <WatercolorDecoration type="lemon" className="bottom-0 right-0 w-64 h-64 opacity-60" />
            
            <div className={`transition-all duration-700 ${aiAnalysis || isSearching ? 'scale-90 mb-8' : 'mb-16 mt-12'}`}>
                <h1 className="text-6xl font-serif font-bold text-green-900 mb-6 tracking-tight">What do you need?</h1>
                {!aiAnalysis && !isSearching && <p className="text-gray-600 font-medium max-w-md mx-auto">Locating local farmers and affordable stores near <span className="text-green-700 font-bold">{profile.location}</span>.</p>}
            </div>

            <div className="w-full max-w-2xl space-y-4 relative z-20">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-green-800"><Search className="w-7 h-7" /></div>
                <input 
                  type="text" value={query} onChange={e => setQuery(e.target.value)}
                  placeholder={`Search for affordable food...`} 
                  className="w-full py-7 pl-16 pr-20 bg-white border-2 border-gray-100 rounded-[32px] shadow-2xl text-xl outline-none focus:border-green-700 transition-all placeholder:text-gray-300"
                />
                <button 
                  type="button" 
                  onClick={() => setShowVoiceAgent(true)} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition-all group"
                >
                  <Mic className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </button>
              </form>

              {/* BUDGET PICKER */}
              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[28px] border border-gray-100 shadow-lg flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-2 duration-500 delay-300">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-white">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-green-900">Set Max Budget:</span>
                  </div>
                  <div className="flex-1 w-full flex items-center gap-4">
                    <input 
                      type="range" min="5" max="100" step="5"
                      value={searchBudget}
                      onChange={(e) => setSearchBudget(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-700"
                    />
                    <span className="text-2xl font-black text-green-700 whitespace-nowrap">${searchBudget}</span>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">AI will prioritize results within this limit</p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-3 relative z-20">
                {['Apples', 'EBT Stores', 'Fresh Kale', 'Local Milk', 'Farmers Markets'].map(tag => (
                    <button key={tag} onClick={() => { setQuery(tag); handleSearch(undefined, tag); }} className="px-5 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-500 hover:border-green-300 hover:text-green-700 transition-all">
                        {tag}
                    </button>
                ))}
            </div>

            {isSearching && (
                <div className="mt-16 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                    <RefreshCw className="w-10 h-10 text-green-700 animate-spin" />
                    <p className="text-green-900 font-bold uppercase tracking-[0.2em] text-xs">Consulting network...</p>
                </div>
            )}

            {aiAnalysis && !isSearching && (
                <div className="mt-12 w-full max-w-3xl text-left bg-white/80 backdrop-blur p-10 rounded-[40px] border border-gray-100 shadow-xl animate-in slide-in-from-bottom-8 duration-700">
                    <div className="prose prose-green max-w-none text-green-950 leading-relaxed whitespace-pre-wrap font-medium font-sans">
                        {aiAnalysis}
                    </div>
                    
                    {groundingLinks.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Verified Sources & Stores</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {groundingLinks.map((link, i) => link.web && (
                                    <a key={i} href={link.web.uri} target="_blank" rel="noopener noreferrer" 
                                       className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-2xl transition-colors group">
                                        <div className="flex flex-col truncate pr-4">
                                            <span className="text-xs font-bold text-green-900 truncate">{link.web.title}</span>
                                            <span className="text-[10px] text-gray-400 truncate">{new URL(link.web.uri).hostname}</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-green-600 transition-colors shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-3xl border border-gray-200 rounded-[40px] shadow-2xl flex items-center gap-2 p-2 z-[100] scale-110">
        <button onClick={() => { setAiAnalysis(null); setGroundingLinks([]); setActiveTab('search'); }} className={`p-5 rounded-[34px] transition-all duration-300 ${activeTab === 'search' ? 'bg-[#1a2e05] text-white shadow-lg' : 'text-green-900 hover:bg-green-50'}`}><LayoutGrid className="w-6 h-6" /></button>
        <button onClick={() => setShowCamera(true)} className={`p-5 rounded-[34px] transition-all duration-300 ${activeTab === 'scan' ? 'bg-[#1a2e05] text-white shadow-lg' : 'text-green-900 hover:bg-green-50'}`}><Scan className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('meals')} className={`p-5 rounded-[34px] transition-all duration-300 ${activeTab === 'meals' ? 'bg-[#1a2e05] text-white shadow-lg' : 'text-green-900 hover:bg-green-50'}`}><CookingPot className="w-6 h-6" /></button>
        <button onClick={() => setActiveTab('community')} className={`p-5 rounded-[34px] transition-all duration-300 ${activeTab === 'community' ? 'bg-[#1a2e05] text-white shadow-lg' : 'text-green-900 hover:bg-green-50'}`}><Box className="w-6 h-6" /></button>
      </nav>
    </div>
  );
};

export default ConsumerDashboard;
