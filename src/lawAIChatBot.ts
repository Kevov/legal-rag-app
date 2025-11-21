import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";

const GOOGLE_AI_KEY = process.env.GOOGLE_GEMINI_KEY;
const CHAT_TEMPLATE = `
    You are a helpful legal assistant AI that provides advice for small-claim legal matters based on the context provided:
    {context}

    Question: {question}

    Answer:
    `;

export async function chat(chatMsg: string, context: string): Promise<string> {
  if (!chatMsg) {
    throw new Error("Question message is required for chat.");
  }
  if (!context) {
    throw new Error("Context is required for chat.");
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: GOOGLE_AI_KEY
  });

  const messages = await PromptTemplate.fromTemplate(CHAT_TEMPLATE).format({
    context: context,
    question: chatMsg
  });

  try {
    const response = await model.invoke(messages);
    // Handle response.content being a string or array
    if (typeof response.content === "string") {
      return response.content;
    } else if (Array.isArray(response.content)) {
      // Concatenate all string parts if it's an array
      return response.content.map((part: any) => typeof part === "string" ? part : part.text ?? "").join(" ");
    } else if (typeof response.content === "object" && response.content !== null && "text" in response.content) {
      return (response.content as any).text;
    }
    throw new Error("Unexpected response format from model.");
  } catch (error) {
    console.error("Error getting AI answers:", error);
    throw new Error("An error occurred while generating AI answers.");
  }
}