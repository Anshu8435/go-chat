import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate contacts for the same user
contactSchema.index({ userId: 1, contactId: 1 }, { unique: true });

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);

export default Contact;
