
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { UserProfile } from "../types";

const compressBase64Image = async (base64: string, maxWidth = 800) : Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale; 
      canvas.height = img.height * scale; 
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      resolve(compressed);
    };
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}; 

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export const getAIResponse = async (
  prompt: string, 
  profile: UserProfile, 
  useSearch: boolean = false, 
  useMaps: boolean = false,
  budget?: string
) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const budgetInstruction = budget ? `IMPORTANT: The user has a strict budget of ${budget} for this specific shopping trip. Prioritize items and stores where the total cost stays within this limit. Highlight the best value-for-money options.` : '';

  const fridgeContext = profile.fridgeContents && profile.fridgeContents.length > 0
  ?`
  FRIDGE CONTENTS (last scanned ${new Date(profile.lastFridgeScan || '').toLocaleDateString()}): 
  ${profile.fridgeContents.map(item => ` - ${item.item}${!item.aligns ? '(conflicts with health goals)' : ''}`).join('\n')}
  Use this information to:
  1. Suggest recipes using ingredients they already have
  2. Recommend what's missing for balanced meals
  3. Avoid suggesting items they already have
  4. Flag items that don't align with their health goals
  `
  : '';


  const systemInstruction = `
    You are Nurtur, the #1 Food Sourcing Agent. 
    Your mission is to find the most affordable, healthy food options for the user.
    User Name: ${profile.name}
    User Location (Zip): ${profile.location || 'Unknown'}
    Dietary Restrictions: ${profile.dietaryRestrictions.join(', ') || 'None'}
    Health Goals: ${profile.healthGoals.join(', ') || 'General Wellness'}
    ${fridgeContext}
    ${budgetInstruction}
    
    Instructions:
    1. If search is enabled, look for real-time prices at local grocers (Aldi, Walmart, local co-ops, Dollar General).
    2. Prioritize stores that accept EBT/SNAP.
    3. Be concise and actionable.
    4. If the user asks for specific food, suggest the cheapest local source.
    5. Mention specific prices found in search results.
    6. When recommending specific recipes, PRIORITIZE using ingredients from their fridge first. 
    7. Point out when they can use what they already have instead of buying new items. 
  `;

  // Maps grounding is only supported in Gemini 2.5 series models.
  const modelName = useMaps ? 'gemini-2.5-flash' : 'gemini-3-flash-preview';

  const config: any = {
    systemInstruction,
    thinkingConfig: { thinkingBudget: 0 }
  };

  const tools: any[] = [];
  if (useSearch) tools.push({ googleSearch: {} });
  if (useMaps) tools.push({ googleMaps: {} });
  if (tools.length > 0) config.tools = tools;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return {
    text: response.text,
    grounding: groundingChunks as GroundingChunk[]
  };
};

export const analyzeFridgeImage = async (base64Image: string, profile: UserProfile, onComplete?: (items: any[]) => void) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };
  
  const prompt = `
    Analyze this image and list food items.
    For each item:
    1. Check if it aligns with these health goals: ${profile.healthGoals.join(', ')}.
    2. If it DOES NOT align, flag it and explain why briefly.
    Return ONLY valid JSON array (no markdown): 
    [{"item" : "item name", "aligns": true, "reason": "concise reason"}]
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ 
      role: 'user', 
      parts: [imagePart, { text: prompt }] 
      }],
    config: {
        systemInstruction: "Strictly return JSON. No markdown wrappers.",
        temperature : 0.3,
        maxOutputTokens : 1024
    }
  });

  const rawText = response.text || '[]';
  const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    const items = JSON.parse(cleanJson);
    if (onComplete) onComplete(items);
    return items;
  } catch (e) {
    console.error("Failed to parse vision response", e);
    return [];
  }
};

export const getAlternative = async (item: string, profile: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const prompt = `Provide a healthy, low-cost budget alternative for ${item}. Be extremely brief.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
        systemInstruction: "One sentence suggestion.",
        thinkingConfig: { thinkingBudget: 0 }
    }
  });
  return response.text;
};
