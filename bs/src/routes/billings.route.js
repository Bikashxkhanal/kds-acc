import { Router } from "express";
import { createABill, getABillDetails } from "../controllers/billings.controller.js";


const billingsRouter = Router();

billingsRouter.route("").post(createABill)
billingsRouter.route("/:billing_id").get(getABillDetails)

export {billingsRouter}