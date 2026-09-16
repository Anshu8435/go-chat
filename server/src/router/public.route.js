import express from "express";
import { ContactUs } from "../controller/publicController.js";

const router = express.Router();

router.post("/contactUs", ContactUs);


export default router;
