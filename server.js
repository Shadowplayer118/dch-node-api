const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();
app.use(express.json());

// Connect to Hostinger MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Test connection
db.connect(err => {
  if (err) {
    console.error("DB connection failed:", err);
    return;
  }
  console.log("✅ Connected to Hostinger MySQL");
});

// ---------------- Inventory CRUD ---------------- //

// CREATE - add new inventory item
app.post("/inventory", (req, res) => {
  const data = req.body;
  const sql = `
    INSERT INTO inventory 
    (item_number, item_code, brand, desc_1, desc_2, desc_3, desc_4, fixed_price, retail_price, units, tsv, area, date_created, last_updated, is_deleted, location, old_id, rep_id, category, img, thresh_hold) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 0, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    data.item_number,
    data.item_code,
    data.brand,
    data.desc_1,
    data.desc_2,
    data.desc_3,
    data.desc_4,
    data.fixed_price,
    data.retail_price,
    data.units,
    data.tsv,
    data.area,
    data.location,
    data.old_id,
    data.rep_id,
    data.category,
    data.img,
    data.thresh_hold
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ Item added", id: result.insertId });
  });
});

// READ - get all items (not deleted)
app.get("/inventory", (req, res) => {
  db.query("SELECT * FROM inventory WHERE is_deleted = 0", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// READ - get one item
app.get("/inventory/:id", (req, res) => {
  db.query("SELECT * FROM inventory WHERE inventory_id = ? AND is_deleted = 0", [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: "Item not found" });
    res.json(results[0]);
  });
});

// UPDATE - update item by id
app.put("/inventory/:id", (req, res) => {
  const data = req.body;
  const sql = `
    UPDATE inventory SET 
      item_number = ?, item_code = ?, brand = ?, desc_1 = ?, desc_2 = ?, desc_3 = ?, desc_4 = ?, 
      fixed_price = ?, retail_price = ?, units = ?, tsv = ?, area = ?, last_updated = NOW(),
      location = ?, old_id = ?, rep_id = ?, category = ?, img = ?, thresh_hold = ?
    WHERE inventory_id = ?
  `;
  db.query(sql, [
    data.item_number,
    data.item_code,
    data.brand,
    data.desc_1,
    data.desc_2,
    data.desc_3,
    data.desc_4,
    data.fixed_price,
    data.retail_price,
    data.units,
    data.tsv,
    data.area,
    data.location,
    data.old_id,
    data.rep_id,
    data.category,
    data.img,
    data.thresh_hold,
    req.params.id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "✅ Item updated" });
  });
});

// DELETE (soft delete) - mark item as deleted
app.delete("/inventory/:id", (req, res) => {
  db.query("UPDATE inventory SET is_deleted = 1 WHERE inventory_id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "🗑️ Item deleted" });
  });
});

// ------------------------------------------------ //

app.listen(3000, () => console.log("🚀 API running on port 3000"));
