import connectMongo from "../db/mongo.js";
import Vehicle from "../models/vehicle.model.js";

const isVehicleExists = async ({vehicle_id, vehicle_number}) => {
    await connectMongo();

    const conditions = [];
    if (vehicle_id != null) conditions.push({ id: Number(vehicle_id) });
    if (vehicle_number != null) conditions.push({ vehicle_number });

    if (!conditions.length) return [];

    const vehicle = await Vehicle.findOne({ $or: conditions }).select("id").lean();
    return vehicle ? [1] : [];
};

export {
    isVehicleExists
}
