import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'


const app = express()
import { captureActivity } from './services/activityLog.js'

const allowedOrigins = [process.env.CORS_ORIGIN, process.env.CORS_ORIGIN_NETWORK].filter(Boolean);
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true
}));
// console.log(process.env.CORS_ORIGIN);

// console.log(process.env.CORS_ORIGIN);
// console.log(process.env.DB_NAME);

app.use(express.json())

app.use(express.urlencoded({extended : true , limit : "16kb"}))

app.set('trust proxy', 1)

app.use(cookieParser())
app.use(captureActivity)

import { customerRouter } from './routes/customer.route.js'
import { staffRouter } from './routes/staff.route.js'
import { billingsRouter } from './routes/billings.route.js'
import { sysUserRouter } from './routes/sysuser.route.js'
import businessRouter from './routes/business.route.js'
import activityRouter from './routes/activity.route.js'
import supplierRouter from './routes/supplier.route.js'
import receiptRouter from './routes/receipt.route.js'

app.use("/api/v1/customer", customerRouter)
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/billings", billingsRouter);
app.use("/api/v1/sysuser", sysUserRouter);
app.use("/api/v1/business", businessRouter);
app.use("/api/v1/suppliers", supplierRouter);
app.use("/api/v1/receipts", receiptRouter);
app.use("/api/logs", activityRouter);


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
        ...(err.errors?.length ? { errors: err.errors } : {})
    });
});


export {app}
