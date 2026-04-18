import bcrypt from 'bcrypt'
import connectPool from "../src/db/index.js";

const addSystemUser = async () => {

    console.log("DB USER:", process.env.DB_USER);

    const hashed_password = await bcrypt.hash("Bikash07", 10);

    await connectPool.execute(
        `INSERT INTO sys_user 
        (name, phone_number, email, address, hashed_password) 
        VALUES (?, ?, ?, ?, ?)`,
        [
            "Bikash Khanal",
            "9824774632",
            "khanalbikash007@gmail.com",
            "Dudhauli-8, Sindhuli",
            hashed_password
        ]
    );

    console.log("User inserted successfully");
}

export const addCompany = async() => {
    await connectPool.execute(
            `INSERT INTO company_info (name , address, pan) VALUES 
            ("KHANAL DHUWANI SEWA", "Dudhauli-8, Sindhuli", "983908230439"),
            ("YES KHANAL NIRWAN SEWA PVT. LTD.", "Dudhauli-8, Sindhuli", "98230439")`
    )
} 

export default addSystemUser;