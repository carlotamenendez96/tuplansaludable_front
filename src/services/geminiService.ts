
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is present.
  console.warn("API_KEY environment variable not found. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const recipeSchema = {
    type: Type.OBJECT,
    properties: {
        recipeName: { type: Type.STRING, description: "Nombre de la receta." },
        description: { type: Type.STRING, description: "Breve descripción del platillo." },
        calories: { type: Type.NUMBER, description: "Contenido calórico total (kcal)." },
        macros: {
            type: Type.OBJECT,
            properties: {
                protein: { type: Type.STRING, description: "Gramos de proteína. Ej: '30g'." },
                carbs: { type: Type.STRING, description: "Gramos de carbohidratos. Ej: '45g'." },
                fat: { type: Type.STRING, description: "Gramos de grasa. Ej: '15g'." },
            },
            required: ["protein", "carbs", "fat"]
        },
        ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Lista de ingredientes con cantidades."
        },
        instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Pasos para la preparación."
        },
    },
    required: ["recipeName", "description", "calories", "macros", "ingredients", "instructions"]
};

export const generateRecipe = async (prompt: string): Promise<Recipe | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Genera una receta saludable basada en esta petición: "${prompt}". La receta debe ser fácil de preparar y apetitosa.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });
        const jsonText = response?.text?.trim();
        if (!jsonText) {
            throw new Error("No se pudo generar la receta");
        }
        return JSON.parse(jsonText) as Recipe;
    } catch (error) {
        console.error("Error generating recipe:", error);
        return null;
    }
};

export const getAIAssistantResponse = async (userMessage: string): Promise<string> => {
    if (!API_KEY) return "Lo siento, la función de IA no está disponible en este momento.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userMessage,
            config: {
                systemInstruction: "Eres un asistente de salud amigable y motivador para la app 'Tu Plan Saludable'. Responde preguntas generales sobre nutrición, fitness y hábitos saludables. No des consejos médicos específicos. Si el usuario pide cambios en su plan o tiene una pregunta muy personal, aconséjale que consulte a su entrenador personal a través del chat de la app. Mantén tus respuestas concisas, en español y positivas.",
            },
        });
        return response?.text || "Hubo un problema al contactar al asistente de IA. Por favor, intenta de nuevo más tarde.";
    } catch (error) {
        console.error("Error getting AI assistant response:", error);
        return "Hubo un problema al contactar al asistente de IA. Por favor, intenta de nuevo más tarde.";
    }
};
