import express from "express";
import { evidenceVectorSearch, lawbookVectorSearch } from "./vector_search";
import { vectorInput } from "./vector_input";
import { TagModel } from "./tagModel";
import cors from "cors";
import { chat } from "./lawAIChatBot";
import { parseDocument } from "./documentParse";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(cors({
    origin: '*', // Allow all origins for simplicity; adjust as needed for security
    methods: ['GET', 'POST'] // Allow specific methods
}));

// Routes
app.get('/', (req, res) => {
  res.send('Hello, Node.js Server lol!');
  console.log("Received chat message:");
});

app.post('/generate', async (req, res): Promise<void> => {
    const chatMsg: string = req.body.text;
    const convoID: string = req.headers['convoid'] as string || 'default_convo';
    try {
        if (!chatMsg) {
            res.status(400).json({ error: 'Article content is required for summarization.' });
            return;
        }
        
        const washingtonStateLawbookSearch = await lawbookVectorSearch("washington-state-law-book", chatMsg);
        const kingCountyLawbookSearch = await lawbookVectorSearch("king-county-law-book", chatMsg);
        const evidenceSearch = await evidenceVectorSearch(chatMsg);
        const washingtonStateLawbookObj = washingtonStateLawbookSearch.map(result => result.getTagDescription()).join("\n");
        const kingCountyLawbookObj = kingCountyLawbookSearch.map(result => result.getTagDescription()).join("\n");
        const evidenceObj = evidenceSearch.map(result => result.getTagDescription()).join("\n");
        
        const chatting = await chat(convoID, chatMsg, washingtonStateLawbookObj, kingCountyLawbookObj, evidenceObj);

        res.json({
            ai_response: chatting,
            wash_law_context: washingtonStateLawbookSearch.map(result => ({
                tag_name: result.getTagName(),
                text: result.getTagDescription()
            })),
            king_law_context: kingCountyLawbookSearch.map(result => ({
                tag_name: result.getTagName(),
                text: result.getTagDescription()
            })),
            evidence_context: evidenceSearch.map(result => ({
                tag_name: result.getTagName(),
                text: result.getTagDescription()
            })),
            original_input: chatMsg 
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while generating the response' });
    }
});

app.post('/input_washington_law_book', async (req, res): Promise<void> => {
    const tagListObj = req.body.tagList;
    const collection: string = "washington-state-law-book"

    try {
        if (!tagListObj) {
            res.status(400).json({ error: 'Tag list is required for inputting to MongoDB Atlas.' });
            return;
        }
        console.log("Received tag list:", tagListObj);
        const tagList: TagModel[] = tagListObj.map((tag: { tag_name: string; text: string }) => TagModel.fromObject(tag));
        const insertedTagsNum: number = await vectorInput(tagList, collection);
        res.json({ 
            message: 'Laws input successful',
            tags_inserted: insertedTagsNum 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inputting the law to MongoDB Atlas' })
    }
});

app.post('/input_kingcounty_law_book', async (req, res): Promise<void> => {
    const tagListObj = req.body.tagList;
    const collection: string = "king-county-law-book"

    try {
        if (!tagListObj) {
            res.status(400).json({ error: 'Tag list is required for inputting to MongoDB Atlas.' });
            return;
        }
        console.log("Received tag list:", tagListObj);
        const tagList: TagModel[] = tagListObj.map((tag: { tag_name: string; text: string }) => TagModel.fromObject(tag));
        const insertedTagsNum: number = await vectorInput(tagList, collection);
        res.json({ 
            message: 'Laws input successful',
            tags_inserted: insertedTagsNum 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inputting the law to MongoDB Atlas' })
    }
});

app.post('/input_evidence', async (req, res): Promise<void> => {
    const tagListObj = req.body.tagList;
    const collection: string = "law-evidence"

    try {
        if (!tagListObj) {
            res.status(400).json({ error: 'Tag list is required for inputting to MongoDB Atlas.' });
            return;
        }
        console.log("Received tag list:", tagListObj);
        const tagList: TagModel[] = tagListObj.map((tag: { tag_name: string; text: string }) => TagModel.fromObject(tag));
        const insertedTagsNum: number = await vectorInput(tagList, collection);
        res.json({ 
            message: 'Evidence input successful',
            tags_inserted: insertedTagsNum 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inputting the evidence to MongoDB Atlas' })
    }
});

app.post('/input_evidence_doc', async (req, res): Promise<void> => {
    try {
        const documents = await parseDocument('./src/test_evidence_document.pdf');
        const tagList: TagModel[] = documents.map((docText: string, index: number) => 
            TagModel.fromString(`evidence_doc_page_${index + 1}`, docText)
        );
        const collection: string = "law-evidence"
        const insertedTagsNum: number = await vectorInput(tagList, collection);
        res.json({ 
            message: 'Evidence document parsed successfully',
            tags_inserted: insertedTagsNum
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while parsing the evidence PDF' })
    }
});

// app.get('/test', async (_, res): Promise<void> => {
//     try {
//         const data = require('../test.json');
//         const items = data.pages.map((page: any) => page.items).flat();
//         const reformattedItems = items.map((obj: any) => ({value: obj.value, bBox: obj.bBox}));
//         let header = "";
//         let currString = ""
//         let arr = []
//         for (const item of reformattedItems) {
//             if (item.bBox.label === "paragraph_title") {
//                 header = item.value;
//             } else if (currString.length < 500) {
//                 currString += " " + item.value
//             } else {
//                 arr.push({tag_name: header, text: currString});
//                 currString = "";
//             }
//         }
//         res.json(arr);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'An error occurred while fetching test data' });
//     }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});

// Endpoint to check the status of the server
app.get('/ping', (_, res) => {
	res.jsonp({ message: 'pong' });
});