import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express()

app.use(
    cors({
        origin : process.env.CORS_ORIGIN,
        credintials : true
    })
    
)
console.log(process.env.CORS_ORIGIN);
console.log(process.env.DB_NAME);

app.use(express.json())

app.use(express.urlencoded({extended : true , limit : "16kb"}))

app.use(cookieParser())

import { customerRouter } from './routes/customer.route.js'
import { staffRouter } from './routes/staff.route.js'
import { billingsRouter } from './routes/billings.route.js'
import { sysUserRouter } from './routes/sysuser.route.js'

app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/billings", billingsRouter);
app.use("/api/v1/sysuser", sysUserRouter);


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error"
    });
});


export {app}









 