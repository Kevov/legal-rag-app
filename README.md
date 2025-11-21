# ai-taxonomy-recommendation


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
To add a list of new tags to your existing vector database, call route ```/input_tag``` as a POST request. So to get a response, your URL should be ```localhost:3000/input_tag```.

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
    "message": "Tag input successful",
    "tags_inserted": <number of tags being added excluding any duplicates>
}
```

## Querying from Your Existing Atlas Vector Database
To query a list of tags from an existing database, call route ```/generate``` as a POST request. So to get a response, your URL should be ```localhost:3000/generate```.

The basic input format for the request body:
```json
{
    "text": "<your article content here>"
}
```
The output format of the response body:
```json
{
    "ai_summary": "<The search query created from your article>",
    "searchResults": [
        {
            "tag_name": "<name>",
            "text": "<description>"
        }
    ],
    "original_input": "<your original article content>"
}
```
