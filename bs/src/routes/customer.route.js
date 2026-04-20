import { Router } from "express";
import {
        getACustomer,
        getAllCustomers,
        addACustomer

 } from "../controllers/customer.controller.js";


const customerRouter =  Router();


customerRouter.route("/:customerId").get(getACustomer);
customerRouter.route("").get(getAllCustomers)
customerRouter.route("/").post(addACustomer)


export {
    customerRouter
}