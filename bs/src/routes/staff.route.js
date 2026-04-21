import { Router } from "express";
import { addAStaff, getAStaffPersonalDetails, addAStaffStippendAndPayout, getAStaffStippendAndPayout } from "../controllers/staff.controller.js";


const staffRouter = Router()


staffRouter.route("").post(addAStaff)
staffRouter.route("/:staff_id").get(getAStaffPersonalDetails)
staffRouter.route("/cr-dr").post(addAStaffStippendAndPayout)
staffRouter.route("/cr-dr/:staff_id").get(getAStaffStippendAndPayout)

export{
    staffRouter
}