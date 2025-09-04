const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const { Pool } = require("pg");

const pool = new Pool({
  user: "r-mars",
  host: "...",
  database: "TEST_MARS",
  password: "r1r2r3r4",
  port: 0,
});

app.use(cors());
app.use(express.json());

app.get("...link", (req, res) => {
    res.json();
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
