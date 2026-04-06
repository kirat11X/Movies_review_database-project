import app from "./server.js";
import mongodb from "mongodb";

import ReviewsDAO from "./dao/reviewsDAO.js";

const MongoClient = mongodb.MongoClient;
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("uri error");
    process.exit(1);
}

const port = process.env.PORT || 8000;  

MongoClient.connect(uri, {
    maxPoolSize: 50,
    wtimeoutMS: 2500
}).catch(err => {
    console.error(err.stack);
    process.exit(1);
}).then(async client => {
    if (typeof ReviewsDAO !== "undefined" && ReviewsDAO.injectDB) {
        await ReviewsDAO.injectDB(client);
    }
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
});
