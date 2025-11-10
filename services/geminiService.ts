import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to show a more user-friendly error
  // but for this context, throwing an error is sufficient.
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const summarizeText = async (text: string): Promise<string> => {
  if (!text || text.trim().length === 0) {
    return "요약할 텍스트가 없습니다.";
  }

  const prompt = `다음 텍스트를 핵심 내용만 남도록 3~5문장으로 요약해줘. 원문의 핵심 키워드를 반드시 포함해야 해. 존댓말로 작성해줘.\n\n[요약할 텍스트]:\n"${text}"`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text with Gemini API:", error);
    return "AI 요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

const fileToGenerativePart = (dataUrl: string, mimeType: string) => {
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error("Invalid dataUrl format");
  }
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const processFileContent = async (file: { dataUrl: string; mimeType: string }): Promise<string> => {
  const isImage = file.mimeType.startsWith('image/');
  const prompt = isImage
    ? "이 이미지에서 모든 텍스트를 추출해줘. 추출된 텍스트만 응답하고, 다른 설명은 추가하지 마."
    : "이 문서의 핵심 내용을 한국어로 요약해줘.";
  
  try {
    const filePart = fileToGenerativePart(file.dataUrl, file.mimeType);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [filePart, { text: prompt }] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error processing file with Gemini API:", error);
    if (isImage) {
        return "이미지 텍스트 추출 중 오류가 발생했습니다.";
    }
    return "PDF 요약 중 오류가 발생했습니다.";
  }
};
