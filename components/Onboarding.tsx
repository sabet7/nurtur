
import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';
import WatercolorDecoration from './WatercolorDecoration';
import { 
  Leaf, Heart, DollarSign, ShoppingCart, 
  MapPin, Clock, Truck, CreditCard, ChevronRight, Check, Map, User, Home
} from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const DIET_OPTIONS = ['Halal', 'Gluten free', 'Keto', 'Nut free', 'Whole 30', 'Paleo', 'Vegan', 'Organic', 'Kosher', 'Pescetarian', 'Lactose free'];
const GOAL_OPTIONS = ['Eat healthier', 'Save money', 'Support local farmers', 'Reduce food waste', 'Quick meals', 'Sustainable shopping'];
const SHOP_OPTIONS = ['Supermarket', 'CSA program', 'Local farms', 'Discount stores', 'Farmer\'s market'];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<UserRole>(UserRole.UNSET);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    farmName: '',
    dietaryRestrictions: [],
    healthGoals: [],
    shoppingPreferences: [],
    behaviors: [],
    interactionHistory: [],
    location: ''
  });

  const next = () => setStep(s => s + 1);

  const toggleItem = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfa] p-6 relative overflow-hidden font-sans">
        <WatercolorDecoration type="blueberries" className="absolute top-10 left-10 w-48 h-48 opacity-40" style={{ transform: 'rotate(12deg)' }} />
        <WatercolorDecoration type="lacinto kale" className="absolute bottom-10 right-10 w-56 h-56 opacity-40" style={{ transform: 'rotate(-12deg)' }} />
        <WatercolorDecoration type="garlic" className="absolute top-1/2 left-0 w-64 h-64 opacity-20" style={{ transform: 'translateX(-20px)' }} />

        
        <h2 className="text-4xl font-serif font-bold mb-8 text-center text-green-900">Who are you?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          <button 
            onClick={() => { setRole(UserRole.CONSUMER); next(); }}
            className="p-8 border-2 border-green-700/20 rounded-2xl bg-green-50/30 hover:bg-green-100/50 transition-all flex flex-col items-center group"
          >
            <ShoppingCart className="w-12 h-12 text-green-700 mb-4 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold">I need fresh food</span>
            <p className="text-sm text-gray-600 mt-2 text-center font-medium">Finding groceries on a budget and local fresh produce.</p>
          </button>
          <button 
            onClick={() => { setRole(UserRole.FARMER); next(); }}
            className="p-8 border-2 border-green-700/20 rounded-2xl bg-white hover:bg-green-50 transition-all flex flex-col items-center group"
          >
            <Leaf className="w-12 h-12 text-green-700 mb-4 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold">I am a farmer/seller</span>
            <p className="text-sm text-gray-600 mt-2 text-center font-medium">Connecting my produce to the community.</p>
          </button>
        </div>
      </div>
    );
  }

  // Identity Step
  if (step === 1) {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
        <div className="bg-[#1a2e05] p-12 flex flex-col justify-center text-white relative">
          <h2 className="text-5xl font-serif font-bold mb-4">Let's introduce ourselves</h2>
          <p className="italic opacity-80 font-medium">What should we call you?</p>
        </div>
        <div className="p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full space-y-6">
            <div>
              <label className="block text-sm font-bold text-green-900 mb-2 uppercase tracking-widest">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700 w-5 h-5" />
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  className="w-full py-4 pl-12 pr-4 border-2 border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-green-700/20 font-medium"
                />
              </div>
            </div>
            {role === UserRole.FARMER && (
              <div>
                <label className="block text-sm font-bold text-green-900 mb-2 uppercase tracking-widest">Farm Name</label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700 w-5 h-5" />
                  <input 
                    type="text" 
                    value={profile.farmName}
                    onChange={(e) => setProfile(p => ({ ...p, farmName: e.target.value }))}
                    placeholder="e.g. Sunny Acres Farm"
                    className="w-full py-4 pl-12 pr-4 border-2 border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-green-700/20 font-medium"
                  />
                </div>
              </div>
            )}
            <button 
              onClick={next}
              disabled={!profile.name || (role === UserRole.FARMER && !profile.farmName)}
              className="w-full mt-4 bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-green-800 transition-colors shadow-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Consumer Path
  if (role === UserRole.CONSUMER) {
    if (step === 2) {
      return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
          <div className="bg-[#1a2e05] p-12 flex flex-col justify-center text-white relative">
            <h3 className="text-xl mb-4 font-medium opacity-70 tracking-wide">Tell us about your dietary needs...</h3>
            <h2 className="text-5xl font-serif font-bold mb-4">My diet is...</h2>
            <p className="italic opacity-80 font-medium">Choose as many as apply</p>
          </div>
          <div className="p-12 flex flex-col justify-center bg-white">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {DIET_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setProfile(p => ({ ...p, dietaryRestrictions: toggleItem(p.dietaryRestrictions || [], opt) }))}
                  className={`p-4 border-2 rounded-xl text-left transition-all flex items-center justify-between font-bold ${
                    profile.dietaryRestrictions?.includes(opt) ? 'bg-green-700 text-white border-green-700 shadow-lg' : 'border-gray-100 hover:border-green-700'
                  }`}
                >
                  {opt}
                  {profile.dietaryRestrictions?.includes(opt) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button onClick={next} className="mt-12 bg-green-700 text-white px-10 py-4 rounded-full self-start flex items-center gap-2 font-bold shadow-lg hover:bg-green-800 transition-all">
              Continue <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
          <div className="bg-[#1a2e05] p-12 flex flex-col justify-center text-white">
            <h3 className="text-xl mb-4 font-medium opacity-70 tracking-wide">Do you have specific goals?</h3>
            <h2 className="text-5xl font-serif font-bold mb-4">When I shop, I think about</h2>
            <p className="italic opacity-80 font-medium">Choose as many as apply</p>
          </div>
          <div className="p-12 flex flex-col justify-center bg-white">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setProfile(p => ({ ...p, healthGoals: toggleItem(p.healthGoals || [], opt) }))}
                  className={`p-4 border-2 rounded-xl text-left transition-all flex items-center justify-between font-bold ${
                    profile.healthGoals?.includes(opt) ? 'bg-green-700 text-white border-green-700 shadow-lg' : 'border-gray-100 hover:border-green-700'
                  }`}
                >
                  {opt}
                  {profile.healthGoals?.includes(opt) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button onClick={next} className="mt-12 bg-green-700 text-white px-10 py-4 rounded-full self-start flex items-center gap-2 font-bold shadow-lg hover:bg-green-800 transition-all">
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    if (step === 4) {
      return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
          <div className="bg-[#1a2e05] p-12 flex flex-col justify-center text-white">
            <h3 className="text-xl mb-4 font-medium opacity-70 tracking-wide">Let's help you find your sources</h3>
            <h2 className="text-5xl font-serif font-bold mb-4">Where do you prefer to shop?</h2>
            <p className="italic opacity-80 font-medium">You can save more than one preference</p>
          </div>
          <div className="p-12 flex flex-col justify-center bg-white">
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {SHOP_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setProfile(p => ({ ...p, shoppingPreferences: toggleItem(p.shoppingPreferences || [], opt) }))}
                  className={`p-4 border-2 rounded-xl text-left transition-all flex items-center justify-between font-bold ${
                    profile.shoppingPreferences?.includes(opt) ? 'bg-green-700 text-white border-green-700 shadow-lg' : 'border-gray-100 hover:border-green-700'
                  }`}
                >
                  {opt}
                  {profile.shoppingPreferences?.includes(opt) && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <button onClick={next} className="mt-12 bg-green-700 text-white px-10 py-4 rounded-full self-start flex items-center gap-2 font-bold shadow-lg hover:bg-green-800 transition-all">
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans">
          <div className="bg-[#1a2e05] p-12 flex flex-col justify-center text-white">
            <h3 className="text-xl mb-4 font-medium opacity-70 tracking-wide">One last thing...</h3>
            <h2 className="text-5xl font-serif font-bold mb-4">What is your Zip Code?</h2>
            <p className="italic opacity-80 font-medium">We use this to find fresh produce and local markets near you.</p>
          </div>
          <div className="p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md w-full">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700 w-6 h-6" />
                <input 
                  type="text" 
                  value={profile.location}
                  onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. 90210"
                  className="w-full py-6 pl-14 pr-4 border-2 border-gray-100 rounded-2xl text-2xl font-bold focus:border-green-700 focus:outline-none transition-colors"
                />
              </div>
              <button 
                onClick={() => onComplete({ ...profile as UserProfile, role, budget: 'Budget Conscious', interactionHistory: [], behaviors: [], savedMeals: [] })} 
                disabled={!profile.location || profile.location.length < 5}
                className="mt-12 w-full bg-green-700 disabled:bg-gray-300 text-white px-8 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all hover:bg-green-800 shadow-2xl"
              >
                Start Nurturing <ChevronRight className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Farmer path 
  return (
    <div className="min-h-screen flex items-center justify-center p-12 bg-white font-sans">
        <div className="max-w-xl w-full">
            <h2 className="text-4xl font-serif font-bold mb-8 text-green-900">Farmer Onboarding</h2>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-green-900">Contribution Frequency</label>
                    <input type="text" className="w-full p-4 border-2 border-gray-100 rounded-xl font-medium outline-none focus:border-green-700 transition-colors" placeholder="e.g. Weekly, Harvest-based" onChange={e => setProfile(p => ({...p, frequency: e.target.value}))}/>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2 uppercase tracking-widest text-green-900">Primary Produce</label>
                    <input type="text" className="w-full p-4 border-2 border-gray-100 rounded-xl font-medium outline-none focus:border-green-700 transition-colors" placeholder="e.g. Greens, Root vegetables" onChange={e => setProfile(p => ({...p, produce: e.target.value.split(',')}))}/>
                </div>
                <button 
                    onClick={() => onComplete({ ...profile as UserProfile, role, budget: 'N/A', interactionHistory: [], behaviors: [], savedMeals: [], shoppingPreferences: [], dietaryRestrictions: [], healthGoals: [] })}
                    className="w-full bg-green-700 text-white py-5 rounded-xl font-bold text-xl hover:bg-green-800 transition-all shadow-xl"
                >
                    Start Supporting My Community
                </button>
            </div>
        </div>
    </div>
  );
};

export default Onboarding;
