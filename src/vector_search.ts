import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SearchOutputModel } from "./searchOutputModel";


const GOOGLE_AI_KEY = process.env.GOOGLE_GEMINI_KEY;
const MONGO_ATLAS_CONNECTION_URI = process.env.MONGO_ATLAS_CONNECTION_URI;

export async function vectorStoreSearch(input: string): Promise<SearchOutputModel[]> {
    if (!MONGO_ATLAS_CONNECTION_URI) {
        throw new Error("MONGO_ATLAS_CONNECTION_URI is not set in the environment variables.");
    }
    const client = new MongoClient(MONGO_ATLAS_CONNECTION_URI);
    try {
        // Configure your Atlas collection
        const database = client.db("epic-tags");
        const collection = database.collection("tags2");
        const embeddingModel = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004",
            apiKey: GOOGLE_AI_KEY
        });
        const vectorStore = new MongoDBAtlasVectorSearch(embeddingModel, {
            collection,
            indexName: "default",
            textKey: "text",
            embeddingKey: "embedding"
        });

        // Perform similarity search
        const results = await vectorStore.similaritySearch(input, 6); // 6 is the number of results to return

        const formattedResults: SearchOutputModel[] = results.map(doc => {
            try {
                return SearchOutputModel.fromDocument(doc);
            }   catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Error processing document: ${error.message}`);
                } else {
                    throw new Error(`Error processing document: ${String(error)}`);
                }
            }
        });
        return formattedResults;

    } catch (error) {
        console.error("Error fetching search query:", error);
        throw new Error("Failed to fetch search query.");
    } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
    }
}
