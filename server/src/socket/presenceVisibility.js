import mongoose from "mongoose";
import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";
import Conversation from "../models/conversation.model.js";
import BlockedUser from "../models/blockedUser.model.js";

/**
 * Check if a specific viewer is authorized to see targetUser's online status
 * @param {string|mongoose.Types.ObjectId} viewerId
 * @param {string|mongoose.Types.ObjectId|object} targetUserOrId
 * @returns {Promise<boolean>}
 */
export const canViewerSeeUserOnline = async (viewerId, targetUserOrId) => {
  try {
    if (!viewerId || !targetUserOrId) return false;

    const sViewerId = String(viewerId);
    let targetUser = targetUserOrId;
    let sTargetId = "";

    if (typeof targetUserOrId === "object" && targetUserOrId._id) {
      sTargetId = String(targetUserOrId._id);
    } else {
      sTargetId = String(targetUserOrId);
    }

    // A user can always see their own online status
    if (sViewerId === sTargetId) return true;

    if (!mongoose.isValidObjectId(sViewerId) || !mongoose.isValidObjectId(sTargetId)) {
      return false;
    }

    const viewerObjectId = new mongoose.Types.ObjectId(sViewerId);
    const targetObjectId = new mongoose.Types.ObjectId(sTargetId);

    // 1. Check if blocked in either direction
    const isBlocked = await BlockedUser.exists({
      $or: [
        { userId: viewerObjectId, blockedUserId: targetObjectId },
        { userId: targetObjectId, blockedUserId: viewerObjectId },
      ],
    });

    if (isBlocked) return false;

    // 2. Fetch target user's privacy settings if not already provided
    if (
      !targetUser ||
      typeof targetUser !== "object" ||
      !targetUser.onlineVisibility ||
      targetUser.selectedOnlineContacts === undefined
    ) {
      targetUser = await User.findById(targetObjectId)
        .select("onlineVisibility selectedOnlineContacts")
        .lean();
    }

    if (!targetUser) return false;

    const visibility = targetUser.onlineVisibility || "everyone";

    // 3. Evaluate visibility setting
    if (visibility === "nobody") {
      return false;
    }

    if (visibility === "selected") {
      const selected = (targetUser.selectedOnlineContacts || []).map((id) =>
        id?.toString ? id.toString() : String(id)
      );
      return selected.includes(sViewerId);
    }

    if (visibility === "contacts") {
      // Must be in target user's personal contacts
      const isContact = await Contact.exists({
        userId: targetObjectId,
        contactId: viewerObjectId,
      });
      return Boolean(isContact);
    }

    // Default "everyone": authorized if in contacts or accepted conversations
    const hasContact = await Contact.exists({
      $or: [
        { userId: targetObjectId, contactId: viewerObjectId },
        { userId: viewerObjectId, contactId: targetObjectId },
      ],
    });
    if (hasContact) return true;

    const hasConversation = await Conversation.exists({
      participants: { $all: [viewerObjectId, targetObjectId] },
      status: "accepted",
    });

    return Boolean(hasConversation);
  } catch (err) {
    console.error("Error in canViewerSeeUserOnline:", err);
    return false;
  }
};

/**
 * Get list of viewer user IDs authorized to receive targetUser's presence updates
 * @param {string|mongoose.Types.ObjectId} targetUserId
 * @returns {Promise<string[]>}
 */
export const getAuthorizedViewersForUser = async (targetUserId) => {
  try {
    if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) return [];

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const sTargetId = String(targetUserId);

    // Fetch target user's privacy settings
    const targetUser = await User.findById(targetObjectId)
      .select("onlineVisibility selectedOnlineContacts")
      .lean();

    if (!targetUser) return [];

    const visibility = targetUser.onlineVisibility || "everyone";

    // If nobody, zero viewers receive presence updates
    if (visibility === "nobody") {
      return [];
    }

    // Fetch blocked users in either direction
    const blockedRecords = await BlockedUser.find({
      $or: [{ userId: targetObjectId }, { blockedUserId: targetObjectId }],
    }).lean();

    const blockedUserIds = new Set(
      blockedRecords.map((b) =>
        b.userId.toString() === sTargetId ? b.blockedUserId.toString() : b.userId.toString()
      )
    );

    let candidateViewers = [];

    if (visibility === "selected") {
      candidateViewers = (targetUser.selectedOnlineContacts || []).map((id) =>
        id?.toString ? id.toString() : String(id)
      );
    } else if (visibility === "contacts") {
      // Viewers whom targetUser has added to their personal contacts
      const contacts = await Contact.find({ userId: targetObjectId }).lean();
      candidateViewers = contacts.map((c) => c.contactId.toString());
    } else {
      // "everyone" mode: users who have targetUser in contacts or have accepted conversations
      const contactsA = await Contact.find({ contactId: targetObjectId }).lean();
      const audienceA = contactsA.map((c) => c.userId.toString());

      const contactsB = await Contact.find({ userId: targetObjectId }).lean();
      const audienceB = contactsB.map((c) => c.contactId.toString());

      const acceptedConvs = await Conversation.find({
        participants: targetObjectId,
        status: "accepted",
      }).lean();

      const audienceC = acceptedConvs
        .map((conv) => {
          const partner = conv.participants.find((p) => p.toString() !== sTargetId);
          return partner ? partner.toString() : null;
        })
        .filter(Boolean);

      candidateViewers = [...audienceA, ...audienceB, ...audienceC];
    }

    const authorizedSet = new Set(candidateViewers);
    blockedUserIds.forEach((id) => authorizedSet.delete(id));
    authorizedSet.delete(sTargetId);

    return Array.from(authorizedSet);
  } catch (err) {
    console.error("Error in getAuthorizedViewersForUser:", err);
    return [];
  }
};

/**
 * Get all potential partners (contacts + accepted conversations) for a user
 * Used to send 'offline' presence when privacy restricts someone who previously saw them online
 */
export const getAllPotentialAudienceForUser = async (targetUserId) => {
  try {
    if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) return [];

    const targetObjectId = new mongoose.Types.ObjectId(targetUserId);
    const sTargetId = String(targetUserId);

    const contactsA = await Contact.find({ contactId: targetObjectId }).lean();
    const audienceA = contactsA.map((c) => c.userId.toString());

    const contactsB = await Contact.find({ userId: targetObjectId }).lean();
    const audienceB = contactsB.map((c) => c.contactId.toString());

    const acceptedConvs = await Conversation.find({
      participants: targetObjectId,
      status: "accepted",
    }).lean();

    const audienceC = acceptedConvs
      .map((conv) => {
        const partner = conv.participants.find((p) => p.toString() !== sTargetId);
        return partner ? partner.toString() : null;
      })
      .filter(Boolean);

    const all = new Set([...audienceA, ...audienceB, ...audienceC]);
    all.delete(sTargetId);
    return Array.from(all);
  } catch (err) {
    console.error("Error in getAllPotentialAudienceForUser:", err);
    return [];
  }
};

