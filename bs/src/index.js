import { app } from "./app.js";
import dotenv from 'dotenv'
import connectMongo from "./db/mongo.js";

dotenv.config({
    path : '../.env'
});

connectMongo()
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.warn("MongoDB connection failed:", err.message));

app.listen(process.env.PORT, () => {
    console.log(`Listing at port ${process.env.PORT }`)
})
