import { Router } from "express";
import { createABill, getABillDetails } from "../controllers/billings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const billingsRouter = Router();

billingsRouter.route("").post(verifyJWT,  createABill)
billingsRouter.route("/:billing_id").get(verifyJWT, getABillDetails)

export {billingsRouter}