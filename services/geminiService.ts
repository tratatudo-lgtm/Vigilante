import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIAnalysis, ReportCategory, Severity } from "../types";
import { translations } from "./localization";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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

export const analyzeReport = async (description: string, lang: 'pt' | 'en' | 'es' | 'fr' | 'de' = 'pt', imageBase64?: string): Promise<AIAnalysis> => {
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a community safety assistant. Analyze citizen reports in the requested language (${lang}).`;
  const prompt = `Analyze this report: "${description}". Categorize it and determine severity. Language: ${lang}.`;

  const contents: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.split(',')[1] || imageBase64
      }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: Object.values(ReportCategory),
          },
          severity: {
            type: Type.STRING,
            enum: Object.values(Severity),
          },
          summary: {
            type: Type.STRING,
            description: 'A short, professional summary in the specified language.',
          }
        },
        required: ['category', 'severity', 'summary']
      }
    }
  });

  try {
    const result = JSON.parse(response.text);
    return result as AIAnalysis;
  } catch (error) {
    console.error("AI parsing error:", error);
    return {
      category: ReportCategory.OTHER,
      severity: Severity.MEDIUM,
      summary: description
    };
  }
};

export const generateVoiceAlert = async (category: string, severity: string, summary: string, lang: 'pt' | 'en' | 'es' | 'fr' | 'de' = 'pt') => {
  const model = 'gemini-2.5-flash-preview-tts';
  
  const prompt = `State formally: ${translations[lang].voice_alert_text.replace('{category}', category).replace('{severity}', severity).replace('{summary}', summary)}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: lang === 'en' ? 'Zephyr' : 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("Voice Alert Error:", error);
  }
};

export const generateRadarAlert = async (limit: number, lang: 'pt' | 'en' | 'es' | 'fr' | 'de' = 'pt') => {
  const model = 'gemini-2.5-flash-preview-tts';
  
  const prompt = translations[lang].radar_alert_voice.replace('{limit}', limit.toString());

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: lang === 'en' ? 'Zephyr' : 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (error) {
    console.error("Radar Voice Alert Error:", error);
  }
};