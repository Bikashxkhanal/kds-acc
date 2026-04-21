import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
        getACustomer,
        getAllCustomers,
        addACustomer,
        addCustomerPaymentDetail,
        getACustomerPaymentDetails,
        addCustomerWorkDetails,
        getCustomerWorkDetails

 } from "../controllers/customer.controller.js";


const customerRouter =  Router();


customerRouter.route("/:customerId").get(verifyJWT, getACustomer);
customerRouter.route("").get(verifyJWT, getAllCustomers)
customerRouter.route("").post(verifyJWT, addACustomer)
customerRouter.route("/payment").post(verifyJWT, addCustomerPaymentDetail)
customerRouter.route("/payment/:customer_id").get(verifyJWT, getACustomerPaymentDetails)
customerRouter.route("/work-details").post(verifyJWT, addCustomerWorkDetails)
customerRouter.route("/:work-details/:customer_id").get(verifyJWT, getCustomerWorkDetails)


export {
    customerRouter
}