import { Router } from "express";
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


customerRouter.route("/:customerId").get(getACustomer);
customerRouter.route("").get(getAllCustomers)
customerRouter.route("").post(addACustomer)
customerRouter.route("/payment").post(addCustomerPaymentDetail)
customerRouter.route("/payment/:customer_id").get(getACustomerPaymentDetails)
customerRouter.route("/work-details").post(addCustomerWorkDetails)
customerRouter.route("/:work-details/:customer_id").get(getCustomerWorkDetails)


export {
    customerRouter
}