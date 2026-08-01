import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    vehicle_number: { type: String, required: true, trim: true, index: true },
    type: { type: String, trim: true, default: "" }
}, { collection: "vehicles" });

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
