import { GenerativeModel, GoogleGenerativeAI, Part } from "@google/generative-ai";
import ENV from "@src/common/constants/ENV";
import { RouteError } from "./route-errors";
import HttpStatusCodes from "@src/common/constants/HttpStatusCodes";

const GEMINI_API_KEY = ENV.GeminiApiKey;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel: GenerativeModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "Think youself as an AI agent but write within 1000 characters." 
});


interface GeminiContent {
  role: 'user' | 'model';
  parts: Part[];
}
export async function sendGeminiMessage(chatHistory: GeminiContent[], newMessageText: string): Promise<string> {
  const chat = geminiModel.startChat({
    history: chatHistory,
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(newMessageText);
  const response = await result.response;
  const responseText = response.text();

  if (!responseText) {
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].finishReason === 'MAX_TOKENS') {
      throw new RouteError(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'Gemini could not generate a complete response (token limit reached).'
      );
    }
    throw new RouteError(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'Gemini API did not return a text response.');
  }

  return responseText;
}
