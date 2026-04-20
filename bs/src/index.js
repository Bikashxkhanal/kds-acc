import { app } from "./app.js";
import dotenv from 'dotenv'
import connectPool from "./db/index.js";

dotenv.config({
    path : './.env'
});

(async () => {
    try {
        const connection = await connectPool.getConnection();
        console.log("DB connected successfully!");
        connection.release();
        
    } catch (error) {
        console.log("Error occured", error.message);
        
    }
} )()


app.listen(process.env.PORT, () => {
    console.log(`Listing at port ${process.env.PORT }`)
})
