import dotenv from 'dotenv'

dotenv.config({
    path : './.env'
})

import express from 'express'
const app = express()






app.listen(process.env.PORT || 8000, () => {
    console.log(`Listing at port ${process.env.PORT || 8000}`)
})

 