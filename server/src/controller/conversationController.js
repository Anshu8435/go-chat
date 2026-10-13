import mongoose from "mongoose";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Contact from "../models/contact.model.js";
import BlockedUser from "../models/blockedUser.model.js";
import Message from "../models/message.model.js";
import { getOnlineUsersList, io } from "../socket/socket.js";
import { canViewerSeeUserOnline } from "../socket/presenceVisibility.js";

/**
 * Get all active/accepted chats for the logged-in user
 */
export const getChats = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // 1. Fetch blocked user IDs in either direction
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: loggedInObjectId }, { blockedUserId: loggedInObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === loggedInUserId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    // 2. Fetch logged-in user's contact IDs
    const contacts = await Contact.find({ userId: loggedInObjectId }).lean();
    const contactUserIds = new Set(contacts.map((c) => c.contactId.toString()));

    // 3. Find conversations where loggedInUser is a participant
    const conversations = await Conversation.find({
      participants: loggedInObjectId,
      deletedBy: { $ne: loggedInObjectId },
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // 4. Identify chat conversations eligible for main Chats section:
    //    - status === "accepted"
    //    - OR initiated by loggedInUser (they started it, so it's in their sent chats)
    //    - OR the partner is already in user's contacts
    const activeChats = [];
    const processedPartnerIds = new Set();

    for (const conv of conversations) {
      const partner = conv.participants.find(
        (p) => p && p._id && p._id.toString() !== loggedInUserId
      );

      if (!partner) continue;
      const partnerIdStr = partner._id.toString();

      // Skip blocked users
      if (blockedUserIds.has(partnerIdStr)) continue;

      const isAccepted = conv.status === "accepted";
      const isInitiator = conv.initiatedBy && conv.initiatedBy.toString() === loggedInUserId;
      const isContact = contactUserIds.has(partnerIdStr);

      // If pending and recipient is loggedInUser, this belongs in Message Requests, NOT Chats!
      const isIncomingPending =
        conv.status === "pending" &&
        conv.recipient &&
        conv.recipient.toString() === loggedInUserId &&
        !isContact;

      if (isIncomingPending) {
        continue;
      }

      if (isAccepted || isInitiator || isContact) {
        processedPartnerIds.add(partnerIdStr);
        activeChats.push({
          conversationId: conv._id,
          status: conv.status,
          partner,
          lastMessage: conv.lastMessageText || conv.lastMessage?.message || "",
          lastFileType: conv.lastFileType || conv.lastMessage?.fileType || "",
          lastFileName: conv.lastFileName || conv.lastMessage?.fileName || "",
          lastMessageAt: conv.lastMessageAt || conv.updatedAt,
          lastSenderId: conv.lastSenderId || conv.lastMessage?.senderId || null,
        });
      }
    }

    // 5. Also check contacts who don't have a Conversation record yet, or existing Message pairs
    //    so existing chats and contacts are NEVER lost!
    const partnerObjectIds = activeChats.map(
      (c) => new mongoose.Types.ObjectId(c.partner._id)
    );

    // Compute unread message count for each chat partner
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: loggedInObjectId,
          senderId: { $in: partnerObjectIds },
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = new Map();
    unreadCounts.forEach((u) => {
      unreadMap.set(u._id.toString(), u.count);
    });

    const activeSocketUsers = getOnlineUsersList();

    const formattedChats = await Promise.all(
      activeChats.map(async (chat) => {
        const u = chat.partner;
        const isSocketActive = activeSocketUsers.includes(u._id.toString()) || Boolean(u.isOnline);
        const canSee = isSocketActive && (await canViewerSeeUserOnline(loggedInUserId, u));

        return {
          conversationId: chat.conversationId,
          status: chat.status,
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone || "",
          profilePic: u.profilePic || "",
          bio: u.bio || "",
          isOnline: Boolean(canSee),
          lastActive: u.lastActive || u.updatedAt,
          lastMessage: chat.lastMessage,
          lastFileType: chat.lastFileType,
          lastFileName: chat.lastFileName,
          lastMessageAt: chat.lastMessageAt,
          lastSenderId: chat.lastSenderId,
          unreadCount: unreadMap.get(u._id.toString()) || 0,
        };
      })
    );

    // Bubble most recently messaged conversations to the very top!
    formattedChats.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA && timeB) return timeB - timeA;
      if (timeA) return -1;
      if (timeB) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });

    return res.status(200).json({
      success: true,
      chats: formattedChats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all incoming message requests for the logged-in user
 */
export const getMessageRequests = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // Blocked users
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: loggedInObjectId }, { blockedUserId: loggedInObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === loggedInUserId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    // Existing contacts
    const contacts = await Contact.find({ userId: loggedInObjectId }).lean();
    const contactUserIds = new Set(contacts.map((c) => c.contactId.toString()));

    // Find pending conversations where loggedInUser is recipient
    const pendingConvs = await Conversation.find({
      recipient: loggedInObjectId,
      status: "pending",
      deletedBy: { $ne: loggedInObjectId },
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 })
      .lean();

    const requests = [];

    for (const conv of pendingConvs) {
      const sender = conv.participants.find(
        (p) => p && p._id && p._id.toString() !== loggedInUserId
      );

      if (!sender) continue;
      const senderIdStr = sender._id.toString();

      // If blocked or already a contact, skip from message requests
      if (blockedUserIds.has(senderIdStr) || contactUserIds.has(senderIdStr)) {
        continue;
      }

      // Count unread messages from this sender
      const unreadCount = await Message.countDocuments({
        receiverId: loggedInObjectId,
        senderId: sender._id,
        isRead: false,
      });

      requests.push({
        conversationId: conv._id,
        status: conv.status,
        sender: {
          _id: sender._id,
          fullName: sender.fullName,
          email: sender.email,
          phone: sender.phone || "",
          profilePic: sender.profilePic || "",
          bio: sender.bio || "",
          lastActive: sender.lastActive,
        },
        latestMessage: conv.lastMessageText || conv.lastMessage?.message || "",
        lastFileType: conv.lastFileType || conv.lastMessage?.fileType || "",
        lastFileName: conv.lastFileName || conv.lastMessage?.fileName || "",
        lastMessageAt: conv.lastMessageAt || conv.createdAt,
        unreadCount: unreadCount > 0 ? unreadCount : 1,
      });
    }

    return res.status(200).json({
      success: true,
      requests,
      count: requests.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept an incoming message request
 */
export const acceptMessageRequest = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required." });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: loggedInUserId,
    }).populate("participants", "-password");

    if (!conversation) {
      return res.status(404).json({ message: "Message request not found." });
    }

    // Update status to accepted
    conversation.status = "accepted";
    conversation.acceptedAt = new Date();
    await conversation.save();

    const partner = conversation.participants.find(
      (p) => p._id.toString() !== loggedInUserId
    );

    // Also mark messages from this partner as read
    if (partner) {
      await Message.updateMany(
        {
          receiverId: loggedInUserId,
          senderId: partner._id,
          isRead: false,
        },
        {
          $set: { isRead: true, readAt: new Date() },
        }
      );

      // Real-time notification to both users
      const partnerIdStr = partner._id.toString();
      io.to(`user:${loggedInUserId}`).emit("requestAccepted", {
        conversationId: conversation._id,
        partnerId: partnerIdStr,
      });
      io.to(`user:${partnerIdStr}`).emit("requestAccepted", {
        conversationId: conversation._id,
        partnerId: loggedInUserId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message request accepted. You can now chat seamlessly.",
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message request (soft delete for recipient)
 */
export const deleteMessageRequest = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required." });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: loggedInUserId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Message request not found." });
    }

    // Add loggedInUserId to deletedBy array so it's removed from visible requests
    if (!conversation.deletedBy.includes(loggedInUserId)) {
      conversation.deletedBy.push(loggedInUserId);
      await conversation.save();
    }

    io.to(`user:${loggedInUserId}`).emit("requestDeleted", {
      conversationId: conversation._id,
    });

    return res.status(200).json({
      success: true,
      message: "Message request deleted.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Block a user
 */
export const blockUser = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const targetUserId = req.body.targetUserId || req.params.targetUserId;
    const { reason } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required." });
    }

    if (String(loggedInUserId) === String(targetUserId)) {
      return res.status(400).json({ message: "You cannot block yourself." });
    }

    const targetUser = await User.findById(targetUserId).select("-password");
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create block record
    await BlockedUser.findOneAndUpdate(
      { userId: loggedInUserId, blockedUserId: targetUserId },
      { $set: { reason: reason || "" } },
      { upsert: true, new: true }
    );

    // Update any conversation between them to status: blocked
    await Conversation.findOneAndUpdate(
      {
        participants: {
          $all: [
            new mongoose.Types.ObjectId(loggedInUserId),
            new mongoose.Types.ObjectId(targetUserId),
          ],
        },
      },
      { $set: { status: "blocked" } }
    );

    // Emit block events
    io.to(`user:${loggedInUserId}`).emit("userBlocked", { targetUserId });
    io.to(`user:${targetUserId}`).emit("userBlockedBy", { blockerId: loggedInUserId });

    return res.status(200).json({
      success: true,
      message: `${targetUser.fullName} has been blocked.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unblock a user
 */
export const unblockUser = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const targetUserId = req.body.targetUserId || req.params.targetUserId;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required." });
    }

    const removed = await BlockedUser.findOneAndDelete({
      userId: loggedInUserId,
      blockedUserId: targetUserId,
    });

    if (!removed) {
      return res.status(404).json({ message: "User is not in your blocked list." });
    }

    // Revert conversation status to accepted if it exists
    await Conversation.findOneAndUpdate(
      {
        participants: {
          $all: [
            new mongoose.Types.ObjectId(loggedInUserId),
            new mongoose.Types.ObjectId(targetUserId),
          ],
        },
        status: "blocked",
      },
      { $set: { status: "accepted" } }
    );

    // Emit unblock event
    io.to(`user:${loggedInUserId}`).emit("userUnblocked", { targetUserId });
    io.to(`user:${targetUserId}`).emit("userUnblockedBy", { unblockerId: loggedInUserId });

    return res.status(200).json({
      success: true,
      message: "User has been unblocked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get list of all blocked users
 */
export const getBlockedUsers = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    const blockedList = await BlockedUser.find({ userId: loggedInUserId })
      .populate("blockedUserId", "fullName email profilePic bio")
      .lean();

    const formatted = blockedList
      .filter((b) => b.blockedUserId)
      .map((b) => ({
        _id: b.blockedUserId._id,
        fullName: b.blockedUserId.fullName,
        email: b.blockedUserId.email,
        profilePic: b.blockedUserId.profilePic,
        bio: b.blockedUserId.bio,
        blockedAt: b.createdAt,
      }));

    return res.status(200).json({
      success: true,
      blockedUsers: formatted,
    });
  } catch (error) {
    next(error);
  }
};
