import mongoose from "mongoose";
import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";
import Conversation from "../models/conversation.model.js";
import BlockedUser from "../models/blockedUser.model.js";
import Message from "../models/message.model.js";
import { getOnlineUsersList, io } from "../socket/socket.js";
import { canViewerSeeUserOnline } from "../socket/presenceVisibility.js";

/**
 * Get all personal contacts for the logged-in user
 */
export const getContacts = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // Fetch blocked user IDs (both directions)
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: loggedInObjectId }, { blockedUserId: loggedInObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === loggedInUserId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    // Fetch personal contacts
    const contacts = await Contact.find({ userId: loggedInObjectId })
      .populate("contactId", "-password")
      .lean();

    // Filter out deleted users or blocked users
    const validContacts = contacts.filter(
      (c) => c.contactId && !blockedUserIds.has(c.contactId._id.toString())
    );

    if (validContacts.length === 0) {
      return res.status(200).json({
        success: true,
        contacts: [],
      });
    }

    const contactUserIds = validContacts.map(
      (c) => new mongoose.Types.ObjectId(c.contactId._id)
    );

    // Fetch latest message metadata for each contact
    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInObjectId, receiverId: { $in: contactUserIds } },
            { receiverId: loggedInObjectId, senderId: { $in: contactUserIds } },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", loggedInObjectId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$message" },
          lastFileType: { $first: "$fileType" },
          lastFileName: { $first: "$fileName" },
          lastMessageAt: { $first: "$createdAt" },
          lastSenderId: { $first: "$senderId" },
        },
      },
    ]);

    const messageMap = new Map();
    latestMessages.forEach((m) => {
      messageMap.set(m._id.toString(), m);
    });

    // Unread message count per contact
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: loggedInObjectId,
          senderId: { $in: contactUserIds },
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

    const formattedContacts = await Promise.all(
      validContacts.map(async (c) => {
        const u = c.contactId;
        const msg = messageMap.get(u._id.toString());
        const isSocketActive = activeSocketUsers.includes(u._id.toString()) || Boolean(u.isOnline);
        const canSee = isSocketActive && (await canViewerSeeUserOnline(loggedInUserId, u));

        return {
          _id: u._id,
          contactRecordId: c._id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone || "",
          profilePic: u.profilePic || "",
          bio: u.bio || "",
          nickname: c.nickname || "",
          isOnline: Boolean(canSee),
          lastActive: u.lastActive || u.updatedAt,
          lastMessage: msg?.lastMessage || "",
          lastFileType: msg?.lastFileType || "",
          lastFileName: msg?.lastFileName || "",
          lastMessageAt: msg?.lastMessageAt || null,
          lastSenderId: msg?.lastSenderId || null,
          unreadCount: unreadMap.get(u._id.toString()) || 0,
        };
      })
    );

    // Sort by recent activity or name
    formattedContacts.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA && timeB) return timeB - timeA;
      if (timeA) return -1;
      if (timeB) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });

    return res.status(200).json({
      success: true,
      contacts: formattedContacts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a registered user to personal contacts
 */
export const addContact = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const { contactId, nickname } = req.body;

    if (!contactId) {
      return res.status(400).json({ message: "Contact user ID is required." });
    }

    if (String(loggedInUserId) === String(contactId)) {
      return res.status(400).json({ message: "You cannot add yourself to your contacts." });
    }

    // Verify contact user exists
    const contactUser = await User.findById(contactId).select("-password");
    if (!contactUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if blocked in either direction
    const isBlocked = await BlockedUser.findOne({
      $or: [
        { userId: loggedInUserId, blockedUserId: contactId },
        { userId: contactId, blockedUserId: loggedInUserId },
      ],
    });

    if (isBlocked) {
      return res.status(403).json({
        message: "Unable to add contact. A block relationship exists between these accounts.",
      });
    }

    // Check if already in contacts
    const existing = await Contact.findOne({
      userId: loggedInUserId,
      contactId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: `${contactUser.fullName} is already in your contacts.`,
        contact: existing,
      });
    }

    // Create new Contact
    const newContact = await Contact.create({
      userId: loggedInUserId,
      contactId,
      nickname: (nickname || "").trim(),
    });

    // If there is an existing pending conversation, mark it accepted now that they are in contacts
    await Conversation.findOneAndUpdate(
      {
        participants: {
          $all: [
            new mongoose.Types.ObjectId(loggedInUserId),
            new mongoose.Types.ObjectId(contactId),
          ],
        },
      },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      }
    );

    // Notify user's devices via Socket.IO
    io.to(`user:${loggedInUserId}`).emit("contactAdded", {
      contact: {
        _id: contactUser._id,
        contactRecordId: newContact._id,
        fullName: contactUser.fullName,
        email: contactUser.email,
        profilePic: contactUser.profilePic,
        bio: contactUser.bio,
        isOnline: Boolean(contactUser.isOnline),
        lastActive: contactUser.lastActive,
      },
    });

    return res.status(201).json({
      success: true,
      message: `${contactUser.fullName} added to your contacts.`,
      contact: newContact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a contact from personal list (preserves message history)
 */
export const removeContact = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const { contactId } = req.params;

    if (!contactId) {
      return res.status(400).json({ message: "Contact ID is required." });
    }

    const deleted = await Contact.findOneAndDelete({
      userId: loggedInUserId,
      $or: [
        { contactId },
        { _id: mongoose.isValidObjectId(contactId) ? contactId : null },
      ],
    });

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found in your list." });
    }

    // Socket.IO notification to user's devices
    io.to(`user:${loggedInUserId}`).emit("contactRemoved", {
      contactId: deleted.contactId.toString(),
    });

    return res.status(200).json({
      success: true,
      message: "Contact removed from your personal list. Conversation history is preserved.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search registered GoChat users to find and add new contacts
 */
export const searchUsersToContact = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const query = String(req.query.q || req.query.query || "").trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // Fetch blocked users
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: loggedInObjectId }, { blockedUserId: loggedInObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === loggedInUserId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    // Fetch existing contacts of loggedInUser
    const existingContacts = await Contact.find({ userId: loggedInObjectId }).lean();
    const contactSet = new Set(existingContacts.map((c) => c.contactId.toString()));

    // Search users by fullName or email
    const safeRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const matchedUsers = await User.find({
      _id: { $ne: loggedInObjectId },
      $or: [{ fullName: safeRegex }, { email: safeRegex }],
    })
      .select("-password")
      .limit(25)
      .lean();

    const results = matchedUsers
      .filter((u) => !blockedUserIds.has(u._id.toString()))
      .map((u) => ({
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        profilePic: u.profilePic || "",
        bio: u.bio || "",
        isContact: contactSet.has(u._id.toString()),
      }));

    return res.status(200).json({
      success: true,
      users: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get online contacts for the logged-in user (only added contacts + accepted conversations)
 * Respects selective online visibility settings
 */
export const getOnlineContacts = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // 1. Blocked users
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: loggedInObjectId }, { blockedUserId: loggedInObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === loggedInUserId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    // 2. Added contacts
    const contacts = await Contact.find({ userId: loggedInObjectId }).lean();
    const contactIds = contacts.map((c) => c.contactId.toString());

    // 3. Accepted conversations
    const acceptedConvs = await Conversation.find({
      participants: loggedInObjectId,
      status: "accepted",
    }).lean();

    const acceptedPartnerIds = acceptedConvs.map((conv) => {
      const partner = conv.participants.find((p) => p.toString() !== loggedInUserId);
      return partner ? partner.toString() : null;
    }).filter(Boolean);

    // Combine distinct authorized IDs
    const authorizedIdSet = new Set([...contactIds, ...acceptedPartnerIds]);
    blockedUserIds.forEach((id) => authorizedIdSet.delete(id));
    authorizedIdSet.delete(loggedInUserId);

    if (authorizedIdSet.size === 0) {
      return res.status(200).json({
        success: true,
        onlineContacts: [],
      });
    }

    const authorizedObjectIds = Array.from(authorizedIdSet).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const users = await User.find({ _id: { $in: authorizedObjectIds } })
      .select("-password")
      .lean();

    const activeSocketUsers = getOnlineUsersList();

    const formatted = await Promise.all(
      users.map(async (u) => {
        const isSocketActive = activeSocketUsers.includes(u._id.toString()) || Boolean(u.isOnline);
        const canSee = isSocketActive && (await canViewerSeeUserOnline(loggedInUserId, u));
        return {
          _id: u._id,
          fullName: u.fullName,
          email: u.email,
          profilePic: u.profilePic || "",
          bio: u.bio || "",
          isOnline: Boolean(canSee),
          lastActive: u.lastActive || u.updatedAt,
        };
      })
    );

    // Return online contacts first, then by last active
    formatted.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
    });

    return res.status(200).json({
      success: true,
      onlineContacts: formatted,
    });
  } catch (error) {
    next(error);
  }
};
