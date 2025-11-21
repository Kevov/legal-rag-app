import { MongoClient } from "mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TagModel } from "./tagModel"; // Assuming you have a TagModel class defined

const GOOGLE_AI_KEY = process.env.GOOGLE_GEMINI_KEY;
const MONGO_ATLAS_CONNECTION_URI = process.env.MONGO_ATLAS_CONNECTION_URI;

export async function vectorInput(tagList: TagModel[]): Promise<number> {
    if (!MONGO_ATLAS_CONNECTION_URI) {
            throw new Error("MONGO_ATLAS_CONNECTION_URI is not set in the environment variables.");
        }
        const client = new MongoClient(MONGO_ATLAS_CONNECTION_URI);
    try {
        // define your Atlas Vector Search index
        const database = client.db("epic-tags");
        const collection = database.collection("tags2");
        const embeddingModel = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004",
            apiKey: GOOGLE_AI_KEY
        });
        const insertTags: TagModel[] = [];
        // Iterate through the tagList and process each tag
        await Promise.all(tagList.map(async tag => {
            // Check if the tag already exists
            const existingTag = await collection.findOne({ tag_name: tag.getTagName() });
            
            // Generate an embedding using the function that you defined
            const embedding = await embeddingModel.embedQuery(tag.getText());
            tag.setEmbedding(embedding); // Set the embedding in the tag object
            
            // If the tag does not exist, add it to the insertTags array
            if (!existingTag) {
                insertTags.push(tag)
            }
        }));
        console.log("Count of documents to be inserted: " + insertTags.length);
        // Continue processing documents if an error occurs during an operation
        const options = { ordered: false };
        // Insert documents with embeddings into Atlas
        if (insertTags.length > 0) {
            const result = await collection.insertMany(insertTags, options);
            console.log("Count of documents inserted: " + result.insertedCount);
        }
        return insertTags.length
    } finally {
        await client.close();
    }
}
