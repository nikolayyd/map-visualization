import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "mssql";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new sql.ConnectionPool({
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: true
  },
  connectionTimeout: 30000
});

pool.connect()
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection failed:", err));

app.get("/get-routes", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM PL_COORDINATES");

    res.json({ result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/get-points", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query("SELECT * FROM PST_COORDINATES");
    res.json({ result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const PORT = Number(process.env.PORT);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
