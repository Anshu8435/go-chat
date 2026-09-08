import express from "express";
import {
  LoginUser,
  LogoutrUser,
  RegisterUser,
} from "../controller/authController.js";



const router = express.Router();

router.post("/login", LoginUser);
router.post("/register", RegisterUser);
router.post("/logout", LogoutrUser);

export default router;
