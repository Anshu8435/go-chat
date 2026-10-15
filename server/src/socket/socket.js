import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";
import Conversation from "../models/conversation.model.js";
import BlockedUser from "../models/blockedUser.model.js";
import {
  canViewerSeeUserOnline,
  getAuthorizedViewersForUser,
  getAllPotentialAudienceForUser,
} from "./presenceVisibility.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  },
});

// Map of userId -> Set of socketIds (supports multiple tabs / devices per user)
const userSockets = new Map();

export const getReceiverSocketId = (receiverId) => {
  const sockets = userSockets.get(String(receiverId));
  if (!sockets || sockets.size === 0) return null;
  return Array.from(sockets)[0];
};

export const getOnlineUsersList = () => {
  return Array.from(userSockets.keys());
};

/**
 * Get authorized online user IDs for a given viewer user
 * Respects each user's selective online visibility privacy setting!
 */
export const getAuthorizedOnlineUsersFor = async (userId) => {
  try {
    if (!userId || !mongoose.isValidObjectId(userId)) return [];
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const sUserId = String(userId);

    // 1. Blocked users in either direction
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: userObjectId }, { blockedUserId: userObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === sUserId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    // 2. Personal contacts
    const contacts = await Contact.find({ userId: userObjectId }).lean();
    const contactIds = contacts.map((c) => c.contactId.toString());

    // 3. Accepted conversations
    const acceptedConvs = await Conversation.find({
      participants: userObjectId,
      status: "accepted",
    }).lean();

    const acceptedPartnerIds = acceptedConvs
      .map((conv) => {
        const partner = conv.participants.find((p) => p.toString() !== sUserId);
        return partner ? partner.toString() : null;
      })
      .filter(Boolean);

    const candidateSet = new Set([...contactIds, ...acceptedPartnerIds]);
    blockedUserIds.forEach((id) => candidateSet.delete(id));
    candidateSet.delete(sUserId);

    const onlineList = getOnlineUsersList();
    const onlineSet = new Set(onlineList);

    // Filter by online status AND privacy visibility permission
    const onlineCandidates = Array.from(candidateSet).filter((id) => onlineSet.has(id));

    const visibilityChecks = await Promise.all(
      onlineCandidates.map(async (candId) => {
        const canSee = await canViewerSeeUserOnline(sUserId, candId);
        return canSee ? candId : null;
      })
    );

    return visibilityChecks.filter(Boolean);
  } catch (err) {
    console.error("Error computing authorized online users:", err);
    return [];
  }
};

/**
 * Notify authorized users when a user's presence changes (online / offline)
 * Enforces recipient privacy checks
 */
const notifyAuthorizedUsersOfPresence = async (userId, isOnline) => {
  try {
    if (!userId || !mongoose.isValidObjectId(userId)) return;
    const sUserId = String(userId);

    let targetAudience = [];
    if (isOnline) {
      targetAudience = await getAuthorizedViewersForUser(sUserId);
    } else {
      targetAudience = await getAllPotentialAudienceForUser(sUserId);
    }

    const payload = {
      userId: sUserId,
      isOnline,
      lastActive: new Date(),
    };

    targetAudience.forEach((targetUserId) => {
      io.to(`user:${targetUserId}`).emit("contactPresenceChanged", payload);
      io.to(`user:${targetUserId}`).emit("userPresenceChanged", payload);
    });
  } catch (err) {
    console.error("Error notifying authorized users of presence:", err);
  }
};

/**
 * Instantly recalculate and broadcast presence changes when a user updates
 * their online visibility privacy settings
 */
export const notifyPrivacySettingChanged = async (userId) => {
  try {
    if (!userId || !mongoose.isValidObjectId(userId)) return;
    const sUserId = String(userId);

    const isCurrentlyOnline = userSockets.has(sUserId) && userSockets.get(sUserId).size > 0;
    const allAudience = await getAllPotentialAudienceForUser(sUserId);
    const newAuthorizedViewers = await getAuthorizedViewersForUser(sUserId);
    const authorizedSet = new Set(newAuthorizedViewers);

    allAudience.forEach((viewerId) => {
      const canSee = isCurrentlyOnline && authorizedSet.has(viewerId);
      const payload = {
        userId: sUserId,
        isOnline: canSee,
        lastActive: new Date(),
      };
      io.to(`user:${viewerId}`).emit("contactPresenceChanged", payload);
      io.to(`user:${viewerId}`).emit("userPresenceChanged", payload);
    });

    // Also update this user's own view of online users
    const userAuthorized = await getAuthorizedOnlineUsersFor(sUserId);
    io.to(`user:${sUserId}`).emit("getOnlineUsers", userAuthorized);
    io.to(`user:${sUserId}`).emit("getAuthorizedOnlineUsers", userAuthorized);
    io.to(`user:${sUserId}`).emit("privacySettingsUpdated", { userId: sUserId });
  } catch (err) {
    console.error("Error in notifyPrivacySettingChanged:", err);
  }
};

// Middleware to authenticate socket connections via JWT or userId fallback
io.use((socket, next) => {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    const secret = process.env.JWT_SECRET || "gochatapp_jwt_secret_key_2026";

    if (token) {
      try {
        const decoded = jwt.verify(token, secret);
        const resolvedId = decoded.id || decoded._id || decoded.userId;
        if (resolvedId) {
          socket.userId = String(resolvedId);
        }
      } catch (tokenErr) {
        console.warn("Socket JWT token verification fallback:", tokenErr.message);
      }
    }

    if (!socket.userId) {
      const explicitUserId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
      if (explicitUserId) {
        socket.userId = String(explicitUserId);
      }
    }

    if (!socket.userId) {
      return next(new Error("Authentication error: No valid token or userId provided"));
    }

    next();
  } catch (err) {
    console.error("Socket authentication failed:", err.message || err);
    next(new Error("Authentication error: Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`Socket connected: ${socket.id} (User: ${userId})`);

  if (userId) {
    const sUserId = String(userId);
    socket.userId = sUserId;
    socket.join(`user:${sUserId}`);

    const isFirstConnectionForUser = !userSockets.has(sUserId) || userSockets.get(sUserId).size === 0;

    if (!userSockets.has(sUserId)) {
      userSockets.set(sUserId, new Set());
    }
    userSockets.get(sUserId).add(socket.id);

    User.findByIdAndUpdate(sUserId, { isOnline: true, lastActive: new Date() })
      .exec()
      .catch(() => {});

    if (isFirstConnectionForUser) {
      notifyAuthorizedUsersOfPresence(sUserId, true);
    }

    // Send this user their authorized online contacts
    getAuthorizedOnlineUsersFor(sUserId).then((authorizedOnlineUsers) => {
      socket.emit("getOnlineUsers", authorizedOnlineUsers);
      socket.emit("getAuthorizedOnlineUsers", authorizedOnlineUsers);
    });
  }

  socket.on("requestOnlineUsers", async () => {
    if (socket.userId) {
      const authorizedOnlineUsers = await getAuthorizedOnlineUsersFor(socket.userId);
      socket.emit("getOnlineUsers", authorizedOnlineUsers);
      socket.emit("getAuthorizedOnlineUsers", authorizedOnlineUsers);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
    if (socket.userId) {
      const sUserId = String(socket.userId);
      const set = userSockets.get(sUserId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) {
          userSockets.delete(sUserId);
          User.findByIdAndUpdate(sUserId, { isOnline: false, lastActive: new Date() })
            .exec()
            .catch(() => {});

          notifyAuthorizedUsersOfPresence(sUserId, false);
        }
      }
    }
  });
});

export { app, io, server };
