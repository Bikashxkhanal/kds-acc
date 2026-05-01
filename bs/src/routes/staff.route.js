import { Router } from "express";
import { 
    addAStaff,
     getAStaffPersonalDetails,
      addAStaffRemunationDetails,
       getAStaffStippendAndPayout, 
       getSearchedStaffs, 
       addAStaffPayoutDetails, 
       getAllStaffs
 } from "../controllers/staff.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const staffRouter = Router()


staffRouter.route("/").post(verifyJWT, addAStaff)
staffRouter.route("/all").get(verifyJWT, getAllStaffs)
staffRouter.route("/").get(verifyJWT, getSearchedStaffs)
staffRouter.route("/:staff_id").get(verifyJWT, getAStaffPersonalDetails)
staffRouter.route("/remunation").post(verifyJWT, addAStaffRemunationDetails)
staffRouter.route("payout").post(verifyJWT, addAStaffPayoutDetails)
staffRouter.route("/:staff_id/remu-payout-details").get(verifyJWT, getAStaffStippendAndPayout)


export{
    staffRouter
}

