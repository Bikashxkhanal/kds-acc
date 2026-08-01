import bcrypt from 'bcrypt'
import dotenv from "dotenv";
import connectMongo from "../src/db/mongo.js";
import SysUser from "../src/models/sysUser.model.js";
import Company from "../src/models/company.model.js";
import { getNextSequence } from "../src/utils/autoIncrement.js";

dotenv.config({ path: "../.env" });

const addSystemUser = async () => {
    await connectMongo();

    const existing = await SysUser.findOne({ phone_number: "9824774632" });
    if (existing) {
        console.log("System user already exists, skipping.");
        return;
    }

    const hashed_password = await bcrypt.hash("Bikash07", 10);
    const id = await getNextSequence("sysUser");

    await SysUser.create({
        id,
        name: "Bikash Khanal",
        phone_number: "9824774632",
        email: "khanalbikash007@gmail.com",
        address: "Dudhauli-8, Sindhuli",
        hashed_password
    });

    console.log("User inserted successfully");
}

export const addCompany = async () => {
    await connectMongo();

    const companies = [
        { name: "KHANAL DHUWANI SEWA", address: "Dudhauli-8, Sindhuli", pan: "983908230439" },
        { name: "YES KHANAL NIRWAN SEWA PVT. LTD.", address: "Dudhauli-8, Sindhuli", pan: "98230439" }
    ];

    for (const c of companies) {
        const exists = await Company.findOne({ pan: c.pan });
        if (!exists) {
            await Company.create({ ...c, isActive: true });
            console.log(`Company created: ${c.name}`);
        }
    }
}

export default addSystemUser;

addSystemUser()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
