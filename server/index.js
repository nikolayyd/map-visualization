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
    const query = `SELECT c.id, c.PL_Names_id, c.Longitude, c.Latitute, n.color 
              FROM PL_COORDINATES c 
              INNER JOIN PL_Names n ON n.id = c.PL_Names_id`;
    const result = await pool
      .request()
      .query(query);
    res.json({ result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/get-points", async (req, res) => {
  try {
    const query = `SELECT 
      c.id,
      c.Longitude,
      c.Latitute,
      c.name,
      c.name_a,
      c.name_b,
      c.sap_location,
      e.color
    FROM PST_COORDINATES c
    OUTER APPLY (
      SELECT TOP 1 e.color
      FROM PST_ESTIMATE e
      WHERE e.COORDINATES_ID = c.id
      ORDER BY e.id DESC
    ) e;`;
    const result = await pool
      .request()
      .query(query);
    res.json({ result: result.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/get-line-info/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool
      .request()
      .input("id", id)
      .query(`SELECT name,volt FROM PL_Names WHERE id = @id`);
      res.json({name: result.recordset[0].name, 
                volt: result.recordset[0].volt});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


const PORT = Number(process.env.PORT);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
