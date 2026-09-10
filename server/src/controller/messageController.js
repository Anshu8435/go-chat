import path from "node:path";
import fs from "node:fs";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getMessages = async (req, res, next) => {
  try {
    const { userId: userToChatId } = req.params;
    const senderId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { message, fileUrl, fileType, fileName, fileSize } = req.body;
    const receiverId = req.params.receiverId || req.body.receiverId;
    const senderId = req.user.id;

    if ((!message || !message.trim()) && !fileUrl) {
      return res.status(400).json({ message: "Message content or attachment cannot be empty." });
    }

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required." });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "You cannot send messages to yourself." });
    }

    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver user not found." });
    }

    let savedFileUrl = fileUrl || "";

    // If fileUrl is base64, also save to disk in server/uploads folder
    if (savedFileUrl && savedFileUrl.startsWith("data:")) {
      try {
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const matches = savedFileUrl.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const ext = fileName ? path.extname(fileName) : ".bin";
          const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          const diskPath = path.join(uploadsDir, safeName);
          fs.writeFileSync(diskPath, Buffer.from(matches[2], "base64"));
          console.log(`[STORAGE] Upload saved to disk at: ${diskPath}`);
        }
      } catch (diskErr) {
        console.warn("[STORAGE] Note: could not write local disk file:", diskErr.message);
      }
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: (message || "").trim(),
      fileUrl: savedFileUrl,
      fileType: fileType || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
    });

    // Real-time notification via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }

    // Also emit to receiver room
    io.to(`user:${receiverId}`).emit("newMessage", newMessage);

    return res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    next(error);
  }
};
