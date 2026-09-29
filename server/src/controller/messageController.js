import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Contact from "../models/contact.model.js";
import BlockedUser from "../models/blockedUser.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const getMessages = async (req, res, next) => {
  try {
    const { userId: userToChatId } = req.params;
    const senderId = req.user.id;

    if (!userToChatId || !mongoose.isValidObjectId(userToChatId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const partnerObjectId = new mongoose.Types.ObjectId(userToChatId);

    // Check if blocked in either direction
    const isBlocked = await BlockedUser.findOne({
      $or: [
        { userId: senderObjectId, blockedUserId: partnerObjectId },
        { userId: partnerObjectId, blockedUserId: senderObjectId },
      ],
    });

    const messages = await Message.find({
      $or: [
        { senderId: senderObjectId, receiverId: partnerObjectId },
        { senderId: partnerObjectId, receiverId: senderObjectId },
      ],
    }).sort({ createdAt: 1 });

    // Mark unread messages sent by partner to current user as read
    const unreadUpdated = await Message.updateMany(
      {
        senderId: partnerObjectId,
        receiverId: senderObjectId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    // If messages were marked as read, inform the partner via Socket.IO
    if (unreadUpdated.modifiedCount > 0) {
      io.to(`user:${userToChatId}`).emit("messagesRead", {
        readerId: senderId,
        readAt: new Date(),
      });
    }

    // Check conversation status
    const conversation = await Conversation.findOne({
      participants: { $all: [senderObjectId, partnerObjectId] },
    }).lean();

    return res.status(200).json({
      success: true,
      messages,
      isBlocked: Boolean(isBlocked),
      conversationStatus: conversation ? conversation.status : "new",
      isIncomingRequest:
        conversation &&
        conversation.status === "pending" &&
        conversation.recipient.toString() === senderId,
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

    if (!receiverId || !mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ message: "Valid receiver ID is required." });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ message: "You cannot send messages to yourself." });
    }

    const receiverExists = await User.findById(receiverId).select("-password");
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver user not found." });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    // Check if blocked
    const blockRecord = await BlockedUser.findOne({
      $or: [
        { userId: senderObjectId, blockedUserId: receiverObjectId },
        { userId: receiverObjectId, blockedUserId: senderObjectId },
      ],
    });

    if (blockRecord) {
      return res.status(403).json({
        message: "Message could not be sent. This conversation is blocked.",
      });
    }

    // Determine Conversation status:
    // If receiver already has sender in their contacts, or sender has receiver in contacts, or an accepted conversation exists:
    const [receiverHasSenderAsContact, senderHasReceiverAsContact, existingConv] =
      await Promise.all([
        Contact.findOne({ userId: receiverObjectId, contactId: senderObjectId }),
        Contact.findOne({ userId: senderObjectId, contactId: receiverObjectId }),
        Conversation.findOne({
          participants: { $all: [senderObjectId, receiverObjectId] },
        }),
      ]);

    let conversation = existingConv;
    const isDirectContact = Boolean(receiverHasSenderAsContact || senderHasReceiverAsContact);

    if (!conversation) {
      // First-time incoming message!
      // If neither has the other in contacts, this is a Message Request!
      const initialStatus = isDirectContact ? "accepted" : "pending";
      conversation = await Conversation.create({
        participants: [senderObjectId, receiverObjectId],
        status: initialStatus,
        initiatedBy: senderObjectId,
        recipient: receiverObjectId,
        acceptedAt: initialStatus === "accepted" ? new Date() : null,
      });
    } else {
      // If conversation already exists and was deleted by either party, restore visibility
      conversation.deletedBy = conversation.deletedBy.filter(
        (id) => id.toString() !== senderId && id.toString() !== receiverId.toString()
      );
      if (isDirectContact && conversation.status === "pending") {
        conversation.status = "accepted";
        conversation.acceptedAt = new Date();
      }
    }

    let savedFileUrl = fileUrl || "";

    // Save base64 attachments to disk
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
        }
      } catch (diskErr) {
        console.warn("[STORAGE] Note: could not write local disk file:", diskErr.message);
      }
    }

    const cleanText = (message || "").trim();

    // Create the message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: senderObjectId,
      receiverId: receiverObjectId,
      message: cleanText,
      fileUrl: savedFileUrl,
      fileType: fileType || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      isRead: false,
    });

    // Update conversation metadata
    conversation.lastMessage = newMessage._id;
    conversation.lastMessageText = cleanText;
    conversation.lastFileType = fileType || "";
    conversation.lastFileName = fileName || "";
    conversation.lastMessageAt = newMessage.createdAt;
    conversation.lastSenderId = senderObjectId;
    await conversation.save();

    // Fetch sender info for real-time payload
    const senderUser = await User.findById(senderId).select("fullName email profilePic bio").lean();

    // Real-time notifications via Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);

    // Standard new message event
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("receive_message", newMessage);
    }
    io.to(`user:${receiverId}`).emit("newMessage", newMessage);
    io.to(`user:${receiverId}`).emit("receive_message", newMessage);

    // If this conversation is a pending Message Request for the receiver, emit dedicated request event!
    if (conversation.status === "pending" && conversation.recipient.toString() === receiverId.toString()) {
      io.to(`user:${receiverId}`).emit("newMessageRequest", {
        conversationId: conversation._id,
        sender: senderUser,
        latestMessage: cleanText,
        lastFileType: fileType || "",
        lastFileName: fileName || "",
        lastMessageAt: newMessage.createdAt,
      });
    }

    // Also notify sender's own devices for sync
    io.to(`user:${senderId}`).emit("messageSent", newMessage);

    return res.status(201).json({
      success: true,
      message: newMessage,
      conversationStatus: conversation.status,
    });
  } catch (error) {
    next(error);
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    const currentUserId = req.user.id;

    if (!partnerId || !mongoose.isValidObjectId(partnerId)) {
      return res.status(400).json({ message: "Valid partner ID is required." });
    }

    const result = await Message.updateMany(
      {
        senderId: partnerId,
        receiverId: currentUserId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    if (result.modifiedCount > 0) {
      io.to(`user:${partnerId}`).emit("messagesRead", {
        readerId: currentUserId,
        readAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      markedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};
