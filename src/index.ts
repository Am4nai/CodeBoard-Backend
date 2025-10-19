import express from "express";
import pool from "./config/db";
import routes from "./routes/index";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    // Проверяем соединение и делаем простой запрос
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
