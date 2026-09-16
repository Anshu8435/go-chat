import dotenv from "dotenv";
dotenv.config();
import express from "express";
import AuthRouter from "./src/router/auth.route.js";
import PublicRouter from "./src/router/public.route.js";
const app = express();

app.use(express.json());

app.use("/auth", AuthRouter);
app.use("/contactUs", PublicRouter);

app.get("/", (req, res) => {
  res.send("hello from the server");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
