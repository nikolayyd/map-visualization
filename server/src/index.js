const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const { Pool } = require("pg");

const pool = new Pool({

});

app.use(cors());
app.use(express.json());

app.get("...link", (req, res) => {
    res.json();
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
