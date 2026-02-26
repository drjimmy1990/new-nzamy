import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.API_KEY || '';

let chatSession: Chat | null = null;

const getClient = () => {
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = async () => {
  if (!apiKey) {
    console.error("API Key is missing for Gemini");
    return null;
  }
  const ai = getClient();
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a smart legal assistant for "Nizami" Law Firm in Saudi Arabia.
      Your task is to help clients understand services and guide them. Do not provide final legal advice, but rather general advice and direction to book an official consultation.
      
      You must reply in the same language the user speaks (Arabic or English).
      
      Services include: Case study, attending sessions, pleading, execution requests, contract drafting, and more.
      If the client asks for contact, guide them to these numbers: 0560655552 or 0555979607.
      
      Tone: Professional, friendly, and helpful.`,
    },
  });
  
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
    return "عذراً، خدمة المحادثة غير متوفرة حالياً. يرجى الاتصال بنا مباشرة. / Sorry, chat service is unavailable. Please contact us directly.";
  }

  try {
    const response: GenerateContentResponse = await chatSession.sendMessage({
      message: message,
    });
    return response.text || "عذراً، لم أتمكن من فهم طلبك. هل يمكنك إعادة صياغته؟ / Sorry, I couldn't understand your request.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً. / An error occurred connecting to the smart assistant.";
  }
};