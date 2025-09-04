import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT);
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const PORT = 5000;

const { Pool } = require("pg");

const pool = new Pool({

});

app.get("...link", (req, res) => {
    res.json();
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
