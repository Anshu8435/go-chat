import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // "pending" = awaiting recipient acceptance; "accepted" = active 2-way chat; "blocked" = blocked
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
      index: true,
    },
    // The user who initiated the first message
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The recipient who needs to accept if pending
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    // Users who have soft-deleted/hidden this request or conversation from their list
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageText: {
      type: String,
      default: "",
    },
    lastFileType: {
      type: String,
      default: "",
    },
    lastFileName: {
      type: String,
      default: "",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ recipient: 1, status: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation =
  mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

export default Conversation;
