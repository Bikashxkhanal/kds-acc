import { Router } from "express";
import { addAStaff, getAStaffPersonalDetails, addAStaffStippendAndPayout, getAStaffStippendAndPayout } from "../controllers/staff.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const staffRouter = Router()


staffRouter.route("").post(verifyJWT, addAStaff)
staffRouter.route("/:staff_id").get(verifyJWT, getAStaffPersonalDetails)
staffRouter.route("/cr-dr").post(verifyJWT, addAStaffStippendAndPayout)
staffRouter.route("/cr-dr/:staff_id").get(verifyJWT, getAStaffStippendAndPayout)

export{
    staffRouter
}

