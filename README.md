# legal-rag-app


## Setting Up
Basic prerequisite, you need to install Node.js. Instructions [here](https://nodejs.org/en)

In addition, you also need to have a MongoDB account so you can set up your own Atlas Vector Database (it's free!). Once you create the account and sign in, MongoDB should redirect you to the page to create your first database with instruction. Or you can try following [this link.](https://www.mongodb.com/resources/products/fundamentals/create-database#using-the-mongodb-atlas-ui)

Environment Variable needed:

```GOOGLE_AI_KEY``` for embedding model and summarization. ```MONGO_ATLAS_CONNECTION_URI``` to connect to your instance of MongoDB Atlas

To run application on your local machine, execute these 2 commands in your bash terminal:

``` 
npm run build
npm run start
```
If you want to mess around with the code and see updates happening in real-time through Nodemon, you can execute this command in your bash terminal:
```
npm run dev
```
Once that is done, you can access the server through  ```localhost:3000``` by default.
## Adding Tags to Your Existing Atlas Vector Database
To add a list of new documents to your existing vector database, call route ```/input_law_book``` for law documents and ```/input_evidence``` for evidence documents as a POST request. So to get a response, your URL should be ```localhost:3000/input_law_book``` or ```localhost:3000/input_evidence```.

The basic input format for the request body:
```json
{
    "tagList": [
        {
            "tag_name": "<your tag name>",
            "text": "<your tag description>"
        }
    ]
}
```
The ```tag_list``` object is an array, so you can add in multiple tags at once.

Once the tags have been successfully added, you can go to your MongoDB Atlas collection to check the values themselves. The server will return a short response confirming that the tags have been added. The response would look like below:
```json
{
    "message": "Evidence input successful",
    "tags_inserted": <number of tags being added excluding any duplicates>
}
```

## Querying from Your Existing Atlas Vector Database
To generate an AI answer, call ```/generate``` as a POST request. So to get a response, your URL should be ```localhost:3000/generate```.

The basic input format for the request body:
```json
{
    "text": "<your question content here>"
}
```
The output format of the response body:
```json
{
    "ai_response": "Based on RCW 12.40.050, your claim should include your name and address, a sworn statement of the claim's nature ($1,800 refund for uncompleted work) and when it occurred, and Mark's name and address.\n\nYour case is valid for small claims court because the amount claimed ($1,800) is within the jurisdictional limit. Note that per RCW 12.40.120, if you requested the exercise of jurisdiction by the small claims department, you may not be able to appeal the judgement.\n",
    "law_context": [
        {
            "tag_name": "RCW 12.40.050",
            "text": "RCW 12.40.050 \n Requisites of claim. \n A claim filed in the small claims department shall contain: (1) The name and address of the plaintiff; (2) a sworn statement, in brief and concise form, of the nature and amount of the claim and when the claim accrued; and (3) the name and residence of the defendant, if known to the plaintiff, for the purpose of serving the notice of claim on the defendant."
        },
        {
            "tag_name": "RCW 12.40.120",
            "text": "RCW 12.40.120 \n Appeals—Setting aside judgments. \n No appeal shall be permitted from a judgment of the small claims department of the district court where the amount claimed was less than two hundred fifty dollars. No appeal shall be permitted by a party who requested the exercise of jurisdiction by the small claims department where the amount claimed by that party was less than one thousand dollars. A party in default may seek to have the default judgment set aside according to the civil court rules applicable to setting aside judgments in district court."
        }
    ],
    "evidence_context": [
        {
            "tag_name": "Background Information",
            "text": "Sarah hired a local handyman, Mark, to remodel her bathroom for $4,200. They signed a written agreement stating the work would be completed in four weeks. Sarah paid a $2,500 deposit upfront. Mark started the job but only worked sporadically and then stopped coming after installing part of the tile flooring. After three weeks with no progress and no returned calls, Sarah hired another contractor to complete the work. She requested a refund of $1,800 for the unperformed portion of the project, but Mark refused, claiming the job was \\\"almost done.\\\" Sarah filed a small claims case to recover the funds."
        }
    ],
    "original_input": "Is my case valid for small claims court?"
}
```
