import { Router } from "express";
import {
        getACustomer,
        getAllCustomers,
        addACustomer,
        addCustomerPaymentDetail,
        getACustomerPaymentDetails

 } from "../controllers/customer.controller.js";


const customerRouter =  Router();


customerRouter.route("/:customerId").get(getACustomer);
customerRouter.route("").get(getAllCustomers)
customerRouter.route("").post(addACustomer)
customerRouter.route("/payment").post(addCustomerPaymentDetail)
customerRouter.route("/payment/:customer_id").get(getACustomerPaymentDetails)


export {
    customerRouter
}