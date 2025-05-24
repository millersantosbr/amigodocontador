
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION } from '../constants';

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

export const isApiKeySet = (): boolean => {
  return !!process.env.API_KEY;
};

export const initializeGemini = (): void => {
  if (!process.env.API_KEY) {
    console.error("Gemini API Key is not set in process.env.API_KEY");
    throw new Error("Gemini API Key is not set.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getChatSession = async (): Promise<Chat> => {
  if (!ai) {
    initializeGemini();
  }
  if (!ai) { // Check again after initialization attempt
    throw new Error("GoogleGenAI instance not initialized.");
  }
  
  if (chatSession) {
    return chatSession;
  }

  chatSession = ai.chats.create({
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      // thinkingConfig: { thinkingBudget: 0 } // Uncomment for lower latency if needed, may impact quality
    },
  });
  return chatSession;
};

export async function* sendMessageToGeminiStream(
  message: string
): AsyncGenerator<string, void, undefined> {
  if (!isApiKeySet()) {
    throw new Error("API Key not configured.");
  }

  try {
    const currentChat = await getChatSession();
    const result = await currentChat.sendMessageStream({ message });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred with the Gemini API.");
  }
}
