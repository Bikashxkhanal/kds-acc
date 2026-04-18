import { app } from "./app.js";
import dotenv from 'dotenv'

dotenv.config({
    path : './.env'
});

console.log(process.env.DB_HOST);


app.listen(process.env.PORT || 8000, () => {
    console.log(`Listing at port ${process.env.PORT || 8000}`)
})
