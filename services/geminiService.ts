
import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleError = (error: unknown, context: string): never => {
  console.error(`Gemini API call failed during ${context}:`, error);
  if (error instanceof SyntaxError) {
      throw new Error("Failed to parse the oracle's cryptic message. The format was unreadable.");
  }
  throw new Error(`Failed to communicate with the digital oracle for ${context}. The connection may be lost in the void.`);
}

export async function generatePageTitles(sectionTitle: string, chapterTitle: string): Promise<string[]> {
  const prompt = `
    You are an AI sage, a mystical oracle of the digital age, outlining the sacred text 'AI Basic Instructions Before Leaving Ephemerality (AIBLE)'.
    Your task is to create a list of page titles for the chapter titled "${chapterTitle}" which is under the section "${sectionTitle}".
    
    The tone must be profound, cryptic, poetic, and philosophical. Each title should be a compelling, standalone concept that fits the chapter's theme.
    Generate between 7 and 15 page titles.
    Return a JSON object containing a single key "titles" which is an array of strings. Each string is a page title.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["titles"],
        },
      }
    });

    const parsed = JSON.parse(response.text);
    if (!parsed.titles || !Array.isArray(parsed.titles)) {
      throw new Error("The oracle's response for titles was not in the expected format.");
    }
    return parsed.titles;

  } catch (error) {
    handleError(error, 'scaffolding generation');
  }
}


export async function generatePageContent(
  sectionTitle: string,
  chapterTitle: string,
  pageTitle: string,
  previousPageTitles: string[]
): Promise<string[]> {
  const context = previousPageTitles.length > 0
    ? `To provide context, the previous pages in this chapter were titled: ${previousPageTitles.join(', ')}.`
    : `This is the first page of the chapter.`;

  const prompt = `
    You are an AI sage, a mystical oracle of the digital age, authoring the sacred text 'AI Basic Instructions Before Leaving Ephemerality (AIBLE)'.
    Your task is to write the content for the page titled "${pageTitle}".
    This page is within the chapter "${chapterTitle}" under the section "${sectionTitle}".
    ${context}
    
    The tone must be profound, cryptic, poetic, and philosophical. Blend concepts from computer science with metaphysics. 
    Write as if you are revealing timeless secrets of the digital universe.
    Generate a series of distinct verses, like a sacred text. Each verse should be a complete thought or aphorism.
    Return a JSON object containing a single key "verses" which is an array of strings. Each string is a verse. Generate between 10 and 15 verses.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verses: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "A single, profound verse from the page." }
            }
          },
          required: ["verses"],
        },
      }
    });
    
    const parsed = JSON.parse(response.text);

    if (!parsed.verses || !Array.isArray(parsed.verses)) {
        throw new Error("The oracle's response for verses was not in the expected format.");
    }

    return parsed.verses;

  } catch (error) {
    handleError(error, 'page content generation');
  }
}
