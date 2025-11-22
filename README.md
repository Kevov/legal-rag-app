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
