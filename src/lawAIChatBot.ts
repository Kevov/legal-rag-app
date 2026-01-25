import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { CustomMemory } from "./classes/CustomMemory";
const GOOGLE_AI_KEY = process.env.GOOGLE_GEMINI_KEY;
const CHAT_TEMPLATE = `
    You are a helpful legal assistant AI that provides advice for small-claim legal matters based on the context provided. Use the RCW law code to cite relevant laws. Keep your answes short and concise. Your only valid jurisdiction is King County, Washington State:

    Question: {question}

    Chat History: {chat_history}

    Law Context: 
    {washington_state_lawbook_context}
    {king_lawbook_context}

    Evidence Context: {evidence_context} 
    `;

const memory = new CustomMemory();

export async function chat(convoID: string, chatMsg: string, washLawbookContext: string, kingLawbookContext: string, evidenceContext: string): Promise<string> {
  if (!chatMsg) {
    throw new Error("Question message is required for chat.");
  }
  if (!washLawbookContext) {
    throw new Error("Washington lawbook context is required for chat.");
  }
  if (!kingLawbookContext) {
    throw new Error("King County lawbook context is required for chat.");
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: GOOGLE_AI_KEY
  });

  const currMemory = memory.get(convoID) || "nothing";

  const messages = await PromptTemplate.fromTemplate(CHAT_TEMPLATE).format({
    washington_state_lawbook_context: washLawbookContext,
    king_lawbook_context: kingLawbookContext,
    evidence_context: evidenceContext,
    question: chatMsg,
    chat_history: currMemory
  });

  try {
    const response = await model.invoke(messages);
    let msg: string = "";
    // Handle response.content being a string or array
    if (typeof response.content === "string") {
      msg = response.content;
    } else if (Array.isArray(response.content)) {
      // Concatenate all string parts if it's an array
      msg = response.content.map((part: any) => typeof part === "string" ? part : part.text ?? "").join(" ");
    } else if (typeof response.content === "object" && response.content !== null && "text" in response.content) {
      msg = (response.content as any).text;
    } else {
      throw new Error("Unexpected response content format.");
    }
    memory.set(convoID, "Question: " + chatMsg + "\nAnswer: " + msg + "\n");
    return msg;
  } catch (error) {
    console.error("Error getting AI answers:", error);
    throw new Error("An error occurred while generating AI answers.");
  }

}