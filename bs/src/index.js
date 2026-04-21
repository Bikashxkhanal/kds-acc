import { app } from "./app.js";
import dotenv from 'dotenv'
import connectPool from "./db/index.js";

dotenv.config({
    path : './.env'
});




app.listen(process.env.PORT, () => {
    console.log(`Listing at port ${process.env.PORT }`)
})
