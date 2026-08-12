import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("hello from the server");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
