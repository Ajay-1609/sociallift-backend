const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use("/api/contact", require("./routes/contactRoutes"));

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.get("/api/contact", (req, res) => {
  res.send("Contact route working");
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

app.use("/api/contact", limiter);

const helmet = require("helmet");
app.use(helmet());