import express from 'express'
import dotenv from 'dotenv'
import connectPool from './db/index.js'

const app = express()

dotenv.config({
    path : './.env'
})



app.listen(process.env.PORT || 8000, () => {
    console.log(`Listing at port ${process.env.PORT || 8000}`)
})

  const [result, fields] = await connectPool.query('INSERT INTO `sys_user`(`id`, `name`, `email`) VALUES (2,"Josh", "josh@gmail.com")');
    
    console.log(result, fields);

app.get('/', (req, res) => {

    res.send("Bikash")
    
})

app.get('/login', (req, res) => {
    res.send("Login form open")
})

app.get('/signup', (req, res)=> {
    res.send("Signup")
})