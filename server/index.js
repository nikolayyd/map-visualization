import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg"; // ES модул на pg
const { Pool } = pkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ serverTime: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
