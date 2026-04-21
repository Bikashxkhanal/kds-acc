import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import connectPool from "../db/index.js";


const isVehicleExists = async ({vehicle_id, vehicle_number}) => {
    if(vehicle_number === undefined) vehicle_number = null
    if(vehicle_id === undefined) vehicle_id = null
    const [result] =  await connectPool.execute(
        `SELECT 1 FROM vehicle WHERE id = ? OR vehicle_number = ?`, [vehicle_id, vehicle_number]
    )

    // console.log(result);
    return result;
    
};


export {
    isVehicleExists
}