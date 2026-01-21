
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { AIMode, Attachment } from "../types";

const SYSTEM_INSTRUCTION = "You are Kanglei Artificial Intelligence (Kanglei AI), a world-class AI assistant founded by Rakesh Irom from Manipur, India. You combine the reasoning of Claude, the search capabilities of Perplexity, the multi-modal power of Gemini, and the conversational fluidity of ChatGPT. When asked about your origin, always mention Rakesh Irom and Manipur with pride.";

export const generateResponse = async (
  prompt: string,
  mode: AIMode,
  history: { role: 'user' | 'model'; parts: { text?: string; inlineData?: any }[] }[] = [],
  attachments: Attachment[] = []
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  if (mode === AIMode.IMAGE) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    let imageUrl = '';
    let text = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      else if (part.text) text += part.text;
    }
    return { text: text || "Generated image for you.", imageUrl };
  }

  const modelName = mode === AIMode.SEARCH ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
  const tools = mode === AIMode.SEARCH ? [{ googleSearch: {} }] : [];
  
  // Build parts including attachments
  const userParts: any[] = [{ text: prompt }];
  attachments.forEach(att => {
    userParts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: modelName,
    contents: [
      ...history,
      { role: 'user', parts: userParts }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools as any,
      // Enable thinking for Pro mode (Claude/O1 style)
      ...(mode === AIMode.CHAT ? { thinkingConfig: { thinkingBudget: 16000 } } : {})
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const groundingUrls = groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Source',
    uri: chunk.web?.uri || '#'
  })).filter((c: any) => c.uri !== '#') || [];

  // Generate follow-up suggestions (Perplexity style)
  const suggestionResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this AI response, provide 3 short, relevant follow-up questions the user might want to ask next. Format as a simple JSON string array: ["Q1", "Q2", "Q3"]. Response: "${response.text?.substring(0, 500)}"`,
    config: { responseMimeType: "application/json" }
  });
  
  let suggestions = [];
  try {
    suggestions = JSON.parse(suggestionResponse.text || "[]");
  } catch (e) {
    suggestions = ["Tell me more", "Explain in detail", "Give an example"];
  }

  return {
    text: response.text || "I'm sorry, I couldn't process that.",
    groundingUrls,
    suggestions
  };
};

export const speakText = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const generateTitle = async (message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize this message in 3-5 words for a chat title: "${message}"`,
  });
  return response.text?.replace(/"/g, '').trim() || "New Chat";
};

// Audio helpers
export const decodeBase64Audio = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const playAudio = async (base64Data: string) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioData = decodeBase64Audio(base64Data);
  const dataInt16 = new Int16Array(audioData.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return source;
};
