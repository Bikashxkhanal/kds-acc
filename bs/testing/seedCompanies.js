/**
 * Seed script for MongoDB billing companies.
 * Run: node bs/testing/seedCompanies.js
 */
import dotenv from "dotenv";
import connectMongo from "../src/db/mongo.js";
import Company from "../src/models/company.model.js";

dotenv.config({ path: "../.env" });

const companies = [
  {
    name: "Khanal Dhuwani Sewa",
    address: "Dudhauli-8, Sindhuli, Nepal",
    phone: "047-XXXXXX",
    email: "info@kds.com.np",
    pan: "123456789",
    isActive: true
  }
];

const seed = async () => {
  await connectMongo();
  for (const company of companies) {
    const exists = await Company.findOne({ pan: company.pan });
    if (!exists) {
      await Company.create(company);
      console.log(`Created company: ${company.name}`);
    } else {
      console.log(`Skipped (exists): ${company.name}`);
    }
  }
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
