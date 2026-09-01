import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

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

    const usersWithMetadata = filteredUsers.map((u) => {
      const msg = messageMap.get(u._id.toString());
      return {
        ...u,
        lastMessage: msg?.lastMessage || "",
        lastFileType: msg?.lastFileType || "",
        lastFileName: msg?.lastFileName || "",
        lastMessageAt: msg?.lastMessageAt || null,
        lastSenderId: msg?.lastSenderId || null,
      };
    });

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

    if (!fullName || !email) {
      return res.status(400).json({ message: "Full name and email are required." });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({ message: "This email is already in use." });
    }

    user.fullName = String(fullName).trim();
    user.email = normalizedEmail;
    user.phone = phone ? String(phone).trim() : "";
    user.bio = bio !== undefined ? String(bio).trim().slice(0, 200) : user.bio || "";

    if (profilePic !== undefined) {
      user.profilePic = String(profilePic);
    }

    await user.save();

    const responseUser = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic || "",
      bio: user.bio || "",
      loginType: user.loginType,
    };

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: responseUser,
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
