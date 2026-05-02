import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
        getACustomer,
        getAllCustomers,
        addACustomer,
        addCustomerPaymentDetail,
        getACustomerPaymentDetails,
        addCustomerWorkDetails,
        getCustomerWorkDetails,
        searchCustomer,
        getACustomerWorkAndPaymentDetails,
        getACustomerPreviewData,
        downloadWorkAndPaymentDetailsInPDF

 } from "../controllers/customer.controller.js";


const customerRouter =  Router();


customerRouter.route("/search").get(verifyJWT, searchCustomer)
customerRouter.route("/work-details").post(verifyJWT, addCustomerWorkDetails)
customerRouter.route("/:customerId").get(verifyJWT, getACustomer);
customerRouter.route("/").get(verifyJWT, getAllCustomers)
customerRouter.route("/").post(verifyJWT, addACustomer)
customerRouter.route("/payment").post(verifyJWT, addCustomerPaymentDetail)
customerRouter.route("/:customer_id/work-pay-details").get(verifyJWT, getACustomerWorkAndPaymentDetails)
customerRouter.route("/payment/:customer_id").get(verifyJWT, getACustomerPaymentDetails)
customerRouter.route("/:work-details/:customer_id").get(verifyJWT, getCustomerWorkDetails)
customerRouter.route("/preview/:customer_id").get(verifyJWT, getACustomerPreviewData)
customerRouter.route('/download/:customerId').get(verifyJWT, downloadWorkAndPaymentDetailsInPDF)

export {
    customerRouter
}