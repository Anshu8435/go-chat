import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getOnlineUsersList, notifyPrivacySettingChanged } from "../socket/socket.js";
import { canViewerSeeUserOnline } from "../socket/presenceVisibility.js";

export const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;

    // Fetch all registered users except current user, excluding password
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .lean();

    if (!filteredUsers || filteredUsers.length === 0) {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }

    const userObjectIds = filteredUsers.map((u) => new mongoose.Types.ObjectId(u._id));
    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // Fetch the latest message for each contact conversation
    const latestMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: loggedInObjectId, receiverId: { $in: userObjectIds } },
            { receiverId: loggedInObjectId, senderId: { $in: userObjectIds } },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
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

    const activeSocketUsers = getOnlineUsersList();

    const usersWithMetadata = await Promise.all(
      filteredUsers.map(async (u) => {
        const msg = messageMap.get(u._id.toString());
        const isSocketActive = activeSocketUsers.includes(u._id.toString()) || Boolean(u.isOnline);
        const canSee = isSocketActive && (await canViewerSeeUserOnline(loggedInUserId, u));

        return {
          ...u,
          isOnline: Boolean(canSee),
          lastMessage: msg?.lastMessage || "",
          lastFileType: msg?.lastFileType || "",
          lastFileName: msg?.lastFileName || "",
          lastMessageAt: msg?.lastMessageAt || null,
          lastSenderId: msg?.lastSenderId || null,
        };
      })
    );

    // Sort WhatsApp-style: Conversations with the most recent messages on TOP!
    usersWithMetadata.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA && timeB) return timeB - timeA;
      if (timeA) return -1;
      if (timeB) return 1;
      return (a.fullName || "").localeCompare(b.fullName || "");
    });

    return res.status(200).json({
      success: true,
      users: usersWithMetadata,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone, profilePic, bio } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(409).json({ message: "Email is already taken by another user." });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: sanitizedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.loginType !== "normal_user" && !user.password) {
      return res.status(400).json({ message: "This account does not use a password." });
    }

    const isMatch = await bcrypt.compare(String(currentPassword), user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get online visibility privacy settings and contacts list for selection
 */
export const getOnlineVisibilitySettings = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const user = await User.findById(loggedInUserId)
      .select("onlineVisibility selectedOnlineContacts")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const onlineVisibility = user.onlineVisibility || "everyone";
    const selectedContactIds = (user.selectedOnlineContacts || []).map((id) =>
      id?.toString ? id.toString() : String(id)
    );
    const selectedSet = new Set(selectedContactIds);

    const loggedInObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    // Fetch user's personal contacts
    const contacts = await Contact.find({ userId: loggedInObjectId })
      .populate("contactId", "fullName email profilePic bio")
      .lean();

    // Fetch user's accepted conversations
    const acceptedConvs = await Conversation.find({
      participants: loggedInObjectId,
      status: "accepted",
    })
      .populate("participants", "fullName email profilePic bio")
      .lean();

    const candidatesMap = new Map();

    contacts.forEach((c) => {
      if (c.contactId && c.contactId._id) {
        const id = c.contactId._id.toString();
        candidatesMap.set(id, {
          _id: id,
          fullName: c.contactId.fullName,
          email: c.contactId.email,
          profilePic: c.contactId.profilePic || "",
          bio: c.contactId.bio || "",
          isSelected: selectedSet.has(id),
          isContact: true,
        });
      }
    });

    acceptedConvs.forEach((conv) => {
      (conv.participants || []).forEach((p) => {
        if (p && p._id && p._id.toString() !== loggedInUserId) {
          const id = p._id.toString();
          if (!candidatesMap.has(id)) {
            candidatesMap.set(id, {
              _id: id,
              fullName: p.fullName,
              email: p.email,
              profilePic: p.profilePic || "",
              bio: p.bio || "",
              isSelected: selectedSet.has(id),
              isContact: false,
            });
          }
        }
      });
    });

    // Also include any previously selected contacts that might not be in contacts anymore
    const missingIds = selectedContactIds.filter((id) => !candidatesMap.has(id));
    if (missingIds.length > 0) {
      const missingUsers = await User.find({ _id: { $in: missingIds } })
        .select("fullName email profilePic bio")
        .lean();
      missingUsers.forEach((m) => {
        const id = m._id.toString();
        candidatesMap.set(id, {
          _id: id,
          fullName: m.fullName,
          email: m.email,
          profilePic: m.profilePic || "",
          bio: m.bio || "",
          isSelected: true,
          isContact: false,
        });
      });
    }

    const contactsList = Array.from(candidatesMap.values());
    contactsList.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""));

    return res.status(200).json({
      success: true,
      onlineVisibility,
      selectedContactIds,
      contacts: contactsList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update online visibility privacy settings
 */
export const updateOnlineVisibilitySettings = async (req, res, next) => {
  try {
    const loggedInUserId = req.user.id;
    const { onlineVisibility, selectedContactIds } = req.body;

    const allowed = ["everyone", "contacts", "selected", "nobody"];
    if (onlineVisibility && !allowed.includes(onlineVisibility)) {
      return res.status(400).json({
        message: `Invalid online visibility option. Allowed: ${allowed.join(", ")}`,
      });
    }

    const user = await User.findById(loggedInUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (onlineVisibility) {
      user.onlineVisibility = onlineVisibility;
    }

    if (Array.isArray(selectedContactIds)) {
      const validIds = selectedContactIds
        .filter((id) => mongoose.isValidObjectId(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      user.selectedOnlineContacts = validIds;
    }

    await user.save();

    // Recalculate presence across connected sockets immediately
    await notifyPrivacySettingChanged(loggedInUserId);

    return res.status(200).json({
      success: true,
      message: "Online visibility privacy settings updated successfully.",
      onlineVisibility: user.onlineVisibility,
      selectedContactIds: (user.selectedOnlineContacts || []).map((id) => id.toString()),
    });
  } catch (error) {
    next(error);
  }
};
