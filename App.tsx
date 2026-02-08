// JJ
import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './types';
import Onboarding from './components/Onboarding';
import ConsumerDashboard from './components/ConsumerDashboard';
import WatercolorDecoration from './components/WatercolorDecoration';
import { ChevronRight, ArrowRight, Search, Bell, Calendar, Clock, Edit3, Send, Leaf, Users, Zap } from 'lucide-react';

const FarmerDashboard: React.FC<{ profile: UserProfile, onUpdate: (p: UserProfile) => void }> = ({ profile, onUpdate }) => {
  const [news, setNews] = useState('');
  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const addNews = () => {
    if (!news) return;
    const update = { date: new Date().toLocaleDateString(), content: news };
    onUpdate({ ...profile, newsUpdates: [update, ...(profile.newsUpdates || [])] });
    setNews('');
  };

  return (
    <div className="min-h-screen bg-[#fcfdfa] pb-24 relative overflow-hidden font-sans">
      <WatercolorDecoration type="rosemary" className="top-20 -right-20 w-64 h-64 rotate-12" />
      <WatercolorDecoration type="onion" className="bottom-40 -left-20 w-48 h-48 -rotate-12" />
      
      <header className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100 font-sans">
        <div>
          <h1 className="text-2xl font-serif font-bold text-green-900">nurtur | farmer</h1>
          <p className="text-[10px] uppercase tracking-widest text-green-700 font-bold">YOUR NUMBER 1 FOOD SOURCING AGENT</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm font-bold text-green-900">{profile.farmName}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter font-medium">{profile.name}</p>
            </div>
            <div className="relative">
                <div className="w-12 h-12 rounded-full bg-lime-400 flex items-center justify-center text-green-900 font-bold border-2 border-white shadow-sm text-lg">
                    {initials}
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <svg viewBox="0 0 40 20" className="w-10 h-5 fill-amber-800">
                    <path d="M5 15 Q 20 5, 35 15 L 35 18 L 5 18 Z" />
                    <rect x="15" y="10" width="10" height="5" />
                  </svg>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* News & Updates */}
          <section className="bg-white/80 backdrop-blur p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-green-700" />
              <h2 className="text-2xl font-serif font-bold text-green-900">Broadcast Updates</h2>
            </div>
            <div className="flex flex-col gap-4 mb-8">
              <textarea 
                value={news}
                onChange={e => setNews(e.target.value)}
                placeholder="Announce produce drops, harvest delays, etc."
                className="w-full p-4 border-2 border-gray-50 rounded-2xl outline-none min-h-[100px] bg-white/50 font-medium"
              />
              <button onClick={addNews} className="bg-green-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors shadow-lg">
                <Send className="w-5 h-5" /> Send News Update
              </button>
            </div>
            <div className="space-y-4">
              {(profile.newsUpdates || []).map((n, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl border border-gray-50">
                  <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-widest">{n.date}</p>
                  <p className="text-sm text-green-900 font-medium">{n.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Schedule & Produce */}
          <div className="space-y-8">
            <section className="bg-white/80 backdrop-blur p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-green-700" />
                <h2 className="text-2xl font-serif font-bold text-green-900">Manage Schedule</h2>
              </div>
              <div className="space-y-4">
                {['Mon - Market Dropoff', 'Wed - Home Deliveries', 'Sat - Farm Pickup'].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0">
                    <span className="font-bold text-green-900">{item}</span>
                    <button className="text-[10px] text-gray-400 hover:text-green-700 font-black uppercase tracking-widest">Edit</button>
                  </div>
                ))}
                <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold text-sm hover:border-green-200 hover:text-green-700 transition-colors">
                  + Add New Slot
                </button>
              </div>
            </section>

            <section className="bg-[#1a2e05] p-8 rounded-[40px] text-white overflow-hidden relative">
              <WatercolorDecoration type="spinach" className="-top-10 -right-10 w-40 h-40 opacity-20" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <Clock className="w-6 h-6 text-lime-400" />
                <h2 className="text-2xl font-serif font-bold">Produce Status</h2>
              </div>
              <div className="space-y-6 relative z-10">
                 <div>
                   <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2 font-bold">Available Now</p>
                   <p className="text-lg font-bold">{profile.produce?.join(', ') || 'No produce listed yet'}</p>
                 </div>
                 <button className="text-lime-400 font-bold underline flex items-center gap-2 hover:text-lime-300 transition-colors">Update Inventory <Edit3 className="w-4 h-4" /></button>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-50">
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-50 text-red-500 px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg border border-red-100 hover:bg-red-100 transition-colors">Logout</button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'onboarding' | 'dashboard'>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nurtur_profile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
      setView('dashboard');
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nurtur_profile', JSON.stringify(profile));
    setView('dashboard');
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('nurtur_profile', JSON.stringify(newProfile));
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfa] p-6 relative overflow-hidden font-sans">
        <div className="absolute top-[5%] left-[5%] w-56 h-56 opacity-40 pointer-events-none z-0" style={{ transform: 'rotate(15deg)' }}>
          <WatercolorDecoration type="bell pepper" className="w-full h-full" />
        </div>
        <div className="absolute top-[8%] right-[8%] w-48 h-48 opacity-40 pointer-events-none z-0" style={{ transform: 'rotate(-12deg)' }}>
          <WatercolorDecoration type="cherry" className="w-full h-full" />
        </div>
        <div className="absolute bottom-[25%] left-[2%] w-64 h-64 opacity-35 pointer-events-none z-0" style={{ transform: 'rotate(-20deg)' }}>
          <WatercolorDecoration type="cucumber" className="w-full h-full" />
        </div>
        <div className="absolute bottom-[5%] right-[3%] w-60 h-60 opacity-40 pointer-events-none z-0" style={{ transform: 'rotate(18deg)' }}>
          <WatercolorDecoration type="carrots" className="w-full h-full" />
        </div>
        <div className="absolute top-[50%] -left-32 w-64 h-64 opacity-15 pointer-events-none z-0" style={{ transform: 'rotate(25deg)' }}>
          <WatercolorDecoration type="pomegranate" className="w-full h-full" />
        </div>
        <div className="absolute top-[40%] -right-28 w-56 h-56 opacity-15 pointer-events-none z-0" style={{ transform: 'rotate(-18deg)' }}>
          <WatercolorDecoration type="garlic" className="w-full h-full" />
        </div>

        <div className="z-10 text-center max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="mb-12">
            <h1 className="text-8xl font-serif font-bold text-green-900 mb-4 tracking-tighter">nurtur</h1>
            <div className="inline-block relative">
              <p className="text-[10px] uppercase tracking-[0.4em] text-green-700 font-black">YOUR NUMBER 1 FOOD SOURCING AGENT</p>
              <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-lime-400/50 rounded-full" />
            </div>
          </div>
          
          <h2 className="text-4xl font-serif text-gray-800 mb-10 leading-[1.2] font-semibold italic">
            Bridging the gap between fresh harvests and every home, ensuring no table is left empty.
          </h2>
          
          <p className="text-xl text-gray-600 mb-14 max-w-lg mx-auto leading-relaxed font-medium">
            Nurtur is your intelligent food partner, locating affordable local produce, 
            connecting you with neighborhood farmers, and creating meal plans that respect your budget and health.
          </p>

          <button 
            onClick={() => setView('onboarding')}
            className="group relative bg-[#1a2e05] text-white px-12 py-6 rounded-full font-bold text-2xl shadow-2xl hover:scale-105 hover:bg-green-900 active:scale-95 transition-all flex items-center gap-4 mx-auto"
          >
            Let's get Started
            <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
          </button>
          
          <div className="mt-16 flex justify-center gap-12 opacity-40">
            <div className="flex flex-col items-center gap-2">
                <Leaf className="w-6 h-6" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">Organic</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">Community</span>
            </div>
            <div className="flex flex-col items-center gap-2">
                <Zap className="w-6 h-6" />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">AI Power</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (userProfile?.role === UserRole.CONSUMER) {
    return <ConsumerDashboard profile={userProfile} onUpdateProfile={handleUpdateProfile} />;
  }

  if (userProfile?.role === UserRole.FARMER) {
    return <FarmerDashboard profile={userProfile} onUpdate={handleUpdateProfile} />;
  }

  return <div className="min-h-screen flex items-center justify-center text-green-900 font-serif text-2xl animate-pulse">Loading Nurtur...</div>;
};

export default App;
// SDG
