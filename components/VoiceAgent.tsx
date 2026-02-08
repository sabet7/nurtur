
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { X, Mic, MicOff, Volume2, Zap, AlertCircle, CheckCircle2, Languages } from 'lucide-react';

// Encoding/Decoding helpers 
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

type AgentState = 'idle' | 'listening' | 'understood' | 'thinking' | 'searching' | 'almost_done' | 'done' | 'error';

const scanFridgeFunctionDeclaration: FunctionDeclaration = {
  name: 'scan_fridge',
  parameters: {
    type: Type.OBJECT,
    description: 'Triggers the physical fridge scanner. Use this when the user wants to scan their fridge for specific items or just generally update their inventory.',
    properties: {
      item_query: {
        type: Type.STRING,
        description: 'Optional specific item the user is looking for (e.g., "milk").',
      },
    },
  },
};

const VoiceAgent: React.FC<{ onClose: () => void, location: string, onTriggerScan: (query?: string) => void }> = ({ onClose, location, onTriggerScan }) => {
  const [state, setState] = useState<AgentState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputVolume, setInputVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const volumeMeterRef = useRef<number>(0);

useEffect(() => {
    let animationFrame: number;
    
    const initializeVoice = async () => {
      try {
        // Step 1: Request mic permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ Microphone access granted!');
        stream.getTracks().forEach(track => track.stop());
        
        // Step 2: Start volume animation
        const updateVolume = () => {
          setInputVolume(prev => {
            const target = volumeMeterRef.current;
            return prev + (target - prev) * 0.2;
          });
          animationFrame = requestAnimationFrame(updateVolume);
        };
        updateVolume();
        
      } catch (err) {
        console.error('❌ Microphone permission denied:', err);
        alert('Please allow microphone access to use voice search.');
      }
    };
    
    initializeVoice();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrame);
      stopSession();
    };
  }, []);

  const startSession = async () => {
    setIsActive(true);
    setState('listening');
    setErrorMessage(null);
    setTranscription('');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate real-time volume for visual feedback
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              volumeMeterRef.current = rms;

              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setTranscription(message.serverContent.inputTranscription.text);
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'scan_fridge') {
                  const args = fc.args as any;
                  // First acknowledge
                  sessionPromise.then((session) => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Opening fridge scanner now. Please point your camera at the open fridge." },
                      }
                    })
                  });
                  // Trigger UI transition
                  onTriggerScan(args?.item_query);
                }
              }
            }

            if (message.serverContent?.modelTurn) {
              if (state === 'listening') {
                setState('understood');
                setTimeout(() => setState('thinking'), 800);
              }

              const base64Audio = message.serverContent.modelTurn.parts[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                setState('done');
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) {
                    setState('idle');
                    setTranscription('');
                  }
                };
              }
            }
          },
          onerror: (e: any) => {
            console.error("Live Error", e);
            setState('error');
            setErrorMessage("Connection issue. Please try again.");
            setIsActive(false);
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          tools: [{ functionDeclarations: [scanFridgeFunctionDeclaration] }],
          systemInstruction: `You are Nurtur's multilingual voice assistant. Your goal is to help people living in food deserts find affordable groceries near ${location}.
          
          CRITICAL GUIDELINES:
          1. ACCENTS & LANGUAGES: You are highly patient and inclusive. You can understand and respond in English, Spanish, and any other language the user chooses. 
          2. ACCENT TOLERANCE: Do not be confused by strong accents or non-standard grammar. Focus on the core intent of finding food or help.
          3. RESPONSE LANGUAGE: Always respond in the SAME language the user speaks to you.
          4. TONE: Be warm, community-focused, and helpful. 
          5. LOCAL KNOWLEDGE: Use your internal search capabilities to find the absolute best budget deals (EBT-friendly) near ${location}.
          6. FRIDGE SCANNING: If the user asks to "scan my fridge" or "check what I have", use the 'scan_fridge' tool immediately. While triggering it, tell the user you are opening the camera for them to scan.`,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setState('error');
      setErrorMessage("Microphone access or API connection failed.");
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    volumeMeterRef.current = 0;
    setIsActive(false);
    if (state !== 'error') setState('idle');
  };

  return (
    <div className="fixed inset-0 bg-[#fcfdfa]/98 backdrop-blur-xl z-[150] flex flex-col items-center justify-center p-8 transition-all duration-500 font-sans">
      <button onClick={onClose} className="absolute top-8 right-8 p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
        <X className="w-6 h-6 text-gray-600" />
      </button>

      <div className="w-full max-w-lg aspect-video flex items-center justify-center mb-12 relative">
        <div className={`absolute inset-0 bg-green-50/30 rounded-full blur-[100px] transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
        <div className="relative w-full h-full flex items-center justify-center">
          {state === 'idle' && (
            <div className="relative w-full h-full flex items-center justify-center opacity-40">
              <div className="w-32 h-32 rounded-full border border-green-200 border-dashed animate-[spin_20s_linear_infinite]" />
              <div className="absolute w-24 h-24 rounded-full border border-green-100 border-dashed animate-[spin_15s_linear_infinite_reverse]" />
              <Zap className="absolute w-8 h-8 text-green-700 opacity-20" />
            </div>
          )}
          {state === 'listening' && (
            <div className="flex items-center justify-center gap-1.5 w-full h-32">
              {[...Array(16)].map((_, i) => {
                const factor = 1 + (Math.sin(i * 0.5) * 0.5);
                const height = 15 + (inputVolume * 400 * factor);
                return (
                  <div 
                    key={i} 
                    className="w-1.5 bg-green-500 rounded-full transition-[height] duration-75 ease-out"
                    style={{ 
                      height: `${Math.min(height, 100)}%`,
                      opacity: 0.3 + (inputVolume * 2),
                      boxShadow: inputVolume > 0.05 ? '0 0 15px rgba(34, 197, 94, 0.4)' : 'none'
                    }}
                  />
                );
              })}
            </div>
          )}
          {state === 'understood' && (
            <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                <CheckCircle2 className="w-24 h-24 text-green-600 relative z-10" />
              </div>
              <p className="mt-4 text-green-700 font-bold uppercase tracking-widest text-xs animate-pulse">Request Understood</p>
            </div>
          )}
          {state === 'thinking' && (
            <div className="flex flex-col items-center justify-center">
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-green-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" />
              </div>
              <p className="mt-8 text-green-900 font-serif italic text-lg">Consulting sources...</p>
            </div>
          )}
          {state === 'done' && (
            <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
              <div className="w-40 h-40 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-green-100 animate-ping opacity-20" />
                <Volume2 className="w-16 h-16 text-green-700 animate-pulse" />
              </div>
            </div>
          )}
          {state === 'error' && (
            <div className="flex flex-col items-center justify-center text-red-500 p-4 text-center">
              <AlertCircle className="w-16 h-16 mb-4" />
              <p className="font-bold">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-12 max-w-md w-full">
        <div className="flex items-center justify-center gap-2 mb-4">
           <Languages className="w-4 h-4 text-green-600" />
           <span className="text-[10px] uppercase font-black tracking-[0.2em] text-green-800">Automatic Language Detection</span>
        </div>
        
        <h2 className="text-5xl font-serif font-bold text-green-900 mb-6 capitalize tracking-tight">
          {state === 'listening' ? 'I\'m Listening' : 
           state === 'understood' ? 'Understood' :
           state === 'done' ? 'Speaking' :
           state.replace('_', ' ')}
        </h2>
        
        <div className="min-h-[4rem] px-6">
          {isActive && transcription ? (
            <p className="text-green-800 text-xl font-medium italic animate-in fade-in slide-in-from-bottom-2">
              "{transcription}..."
            </p>
          ) : isActive ? (
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-400 font-medium font-sans">Listening for your voice...</p>
              {inputVolume < 0.01 && <p className="text-[10px] text-amber-600 font-bold uppercase font-sans">Try speaking louder or checking your mic</p>}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative">
        {isActive && (
          <div className="absolute inset-[-12px] border-4 border-red-100 rounded-full animate-ping opacity-30" />
        )}
        <button 
          onClick={isActive ? stopSession : startSession} 
          className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 z-10 ${
            isActive ? 'bg-red-500 hover:bg-red-600 ring-8 ring-red-50' : 'bg-green-700 hover:bg-green-800 ring-8 ring-green-50'
          }`}
        >
          {isActive ? <MicOff className="w-12 h-12 text-white" /> : <Mic className="w-12 h-12 text-white" />}
        </button>
      </div>

      <div className="mt-16 flex items-center gap-8 text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] font-sans">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`} />
          {isActive ? 'Mic Active' : 'Mic Ready'}
        </div>
        <div className="w-1 h-1 bg-gray-200 rounded-full" />
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Native Gemini Audio
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
