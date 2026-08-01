import { Router } from "express";
import {
    createABill,
    createCompany,
    deleteABill,
    duplicateABill,
    downloadBillPDF,
    getABillDetails,
    getBillings,
    getCompanies,
    updateABill
} from "../controllers/billings.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const billingsRouter = Router();

billingsRouter.route("").get(verifyJWT, getBillings).post(verifyJWT,  createABill)
billingsRouter.route("/companies").get(verifyJWT, getCompanies).post(verifyJWT, createCompany)
billingsRouter.route("/:billing_id").get(verifyJWT, getABillDetails).put(verifyJWT, updateABill).delete(verifyJWT, deleteABill)
billingsRouter.route("/:billing_id/duplicate").post(verifyJWT, duplicateABill)
billingsRouter.route("/:billing_id/download").get(verifyJWT, downloadBillPDF)

export {billingsRouter}
