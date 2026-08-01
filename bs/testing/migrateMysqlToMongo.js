/**
 * Migrates all MySQL data to MongoDB while preserving numeric IDs and field names.
 *
 * Prerequisites:
 *   - MySQL running with existing kds_db data
 *   - MONGODB_URI set in bs/.env
 *   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME set for MySQL
 *
 * Run from project root:
 *   node bs/testing/migrateMysqlToMongo.js
 */
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import connectMongo from "../src/db/mongo.js";
import { setSequence } from "../src/utils/autoIncrement.js";
import SysUser from "../src/models/sysUser.model.js";
import Customer from "../src/models/customer.model.js";
import CustomerPayment from "../src/models/customerPayment.model.js";
import CustomerWork from "../src/models/customerWork.model.js";
import Vehicle from "../src/models/vehicle.model.js";
import Staff from "../src/models/staff.model.js";
import StaffRemuneration from "../src/models/staffRemuneration.model.js";
import StaffPayment from "../src/models/staffPayment.model.js";
import Company from "../src/models/company.model.js";

dotenv.config({ path: "../.env" });

const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true
});

const upsertMany = async (Model, docs, label) => {
    if (!docs.length) {
        console.log(`  ${label}: no rows`);
        return 0;
    }
    for (const doc of docs) {
        await Model.findOneAndUpdate({ id: doc.id }, doc, { upsert: true, new: true });
    }
    console.log(`  ${label}: ${docs.length} rows migrated`);
    return docs.length;
};

const setMaxSequence = async (name, docs) => {
    if (!docs.length) return;
    const maxId = Math.max(...docs.map((d) => d.id));
    await setSequence(name, maxId);
};

const migrate = async () => {
    console.log("Connecting to MongoDB...");
    await connectMongo();

    console.log("Reading from MySQL...");

    const [sysUsers] = await mysqlPool.execute("SELECT * FROM sys_user");
    const [customers] = await mysqlPool.execute("SELECT * FROM customer_personal_details_tbh");
    const [payments] = await mysqlPool.execute("SELECT * FROM customer_payment_details_tbh");
    const [works] = await mysqlPool.execute("SELECT * FROM customer_work_details_tbh");
    const [vehicles] = await mysqlPool.execute("SELECT * FROM vehicle");
    const [staffs] = await mysqlPool.execute("SELECT * FROM staff");
    const [remunerations] = await mysqlPool.execute("SELECT * FROM staff_remunation_tbh");
    const [staffPayments] = await mysqlPool.execute("SELECT * FROM staff_payment_tbh");
    const [companies] = await mysqlPool.execute("SELECT * FROM company_info");

    console.log("Writing to MongoDB...");

    await upsertMany(SysUser, sysUsers.map((r) => ({
        id: r.id,
        name: r.name,
        phone_number: r.phone_number,
        email: r.email,
        address: r.address,
        hashed_password: r.hashed_password
    })), "sys_user");

    await upsertMany(Customer, customers.map((r) => ({
        id: r.id,
        name: r.name,
        phone_number: r.phone_number,
        address: r.address || ""
    })), "customers");

    await upsertMany(CustomerPayment, payments.map((r) => ({
        id: r.id,
        customer_id: r.customer_id,
        pay_amount: r.pay_amount,
        payment_mode: r.payment_mode,
        payers_name: r.payers_name,
        payment_date: new Date(r.payment_date)
    })), "customer_payments");

    await upsertMany(CustomerWork, works.map((r) => ({
        id: r.id,
        customer_id: r.customer_id,
        vehicle_id: r.vehicle_id,
        title: r.title,
        quantity: String(r.quantity),
        quantity_unit_notation: r.quantity_unit_notation,
        rate: r.rate,
        total: r.total,
        work_date: new Date(r.work_date),
        entry_date: r.entry_date ? new Date(r.entry_date) : new Date()
    })), "customer_works");

    await upsertMany(Vehicle, vehicles.map((r) => ({
        id: r.id,
        vehicle_number: r.vehicle_number,
        type: r.type || ""
    })), "vehicles");

    await upsertMany(Staff, staffs.map((r) => ({
        id: r.id,
        name: r.name,
        phone_number: r.phone_number,
        address: r.address || "",
        dob: new Date(r.dob),
        salary: r.salary
    })), "staff");

    await upsertMany(StaffRemuneration, remunerations.map((r) => ({
        id: r.id,
        staff_id: r.staff_id,
        title: r.title,
        discription: r.discription || "",
        amount: r.amount,
        date: new Date(r.date)
    })), "staff_remunerations");

    await upsertMany(StaffPayment, staffPayments.map((r) => ({
        id: r.id,
        staff_id: r.staff_id,
        discription: r.discription || "",
        amount: r.amount,
        date: new Date()
    })), "staff_payments");

    for (const r of companies) {
        const exists = await Company.findOne({ pan: r.pan });
        if (!exists) {
            await Company.create({
                name: r.name,
                address: r.address,
                pan: r.pan,
                isActive: true
            });
        }
    }
    console.log(`  company_info: ${companies.length} rows processed`);

    await setMaxSequence("sysUser", sysUsers);
    await setMaxSequence("customer", customers);
    await setMaxSequence("customerPayment", payments);
    await setMaxSequence("customerWork", works);
    await setMaxSequence("vehicle", vehicles);
    await setMaxSequence("staff", staffs);
    await setMaxSequence("staffRemuneration", remunerations);
    await setMaxSequence("staffPayment", staffPayments);

    console.log("\nMigration complete.");
    await mysqlPool.end();
    process.exit(0);
};

migrate().catch(async (err) => {
    console.error("Migration failed:", err);
    await mysqlPool.end();
    process.exit(1);
});
