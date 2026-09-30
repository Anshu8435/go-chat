import express from "express";
import {
  getContacts,
  addContact,
  removeContact,
  searchUsersToContact,
  getOnlineContacts,
} from "../controller/contactController.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getContacts);
router.post("/add", verifyToken, addContact);
router.delete("/:contactId", verifyToken, removeContact);
router.get("/search", verifyToken, searchUsersToContact);
router.get("/online", verifyToken, getOnlineContacts);

export default router;
