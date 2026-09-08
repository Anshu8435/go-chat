import express from "express";
import { ContactUs } from "../controller/publicController";

const router = express.Router();

router.post("/contactUs", ContactUs);

export default router;
