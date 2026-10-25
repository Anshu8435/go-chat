import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import * as contactController from "../src/controller/contactController.js";
import * as conversationController from "../src/controller/conversationController.js";
import * as messageController from "../src/controller/messageController.js";
import User from "../src/models/user.model.js";
import Contact from "../src/models/contact.model.js";
import Conversation from "../src/models/conversation.model.js";
import BlockedUser from "../src/models/blockedUser.model.js";
import Message from "../src/models/message.model.js";

test("addContact prevents user from adding themselves as a contact", async () => {
  const selfId = new mongoose.Types.ObjectId().toString();
  const req = {
    user: { id: selfId },
    body: { contactId: selfId },
  };

  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await contactController.addContact(req, res, () => {});
  assert.equal(res.code, 400);
  assert.match(res.payload.message, /cannot add yourself/i);
});

test("addContact creates a new contact and sets conversation status to accepted", async () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const contactId = new mongoose.Types.ObjectId().toString();

  const originalFindById = User.findById;
  const originalBlockedFindOne = BlockedUser.findOne;
  const originalContactFindOne = Contact.findOne;
  const originalContactCreate = Contact.create;
  const originalConvUpdate = Conversation.findOneAndUpdate;

  User.findById = () => ({
    select: () => ({ _id: contactId, fullName: "Alice Smith", email: "alice@example.com" }),
  });
  BlockedUser.findOne = async () => null;
  Contact.findOne = async () => null;
  Contact.create = async (doc) => ({ _id: new mongoose.Types.ObjectId(), ...doc });
  Conversation.findOneAndUpdate = async () => ({ ok: 1 });

  const req = {
    user: { id: userId },
    body: { contactId },
  };

  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await contactController.addContact(req, res, () => {});
  assert.equal(res.code, 201);
  assert.equal(res.payload.success, true);
  assert.match(res.payload.message, /Alice Smith added/i);

  User.findById = originalFindById;
  BlockedUser.findOne = originalBlockedFindOne;
  Contact.findOne = originalContactFindOne;
  Contact.create = originalContactCreate;
  Conversation.findOneAndUpdate = originalConvUpdate;
});

test("sendMessage blocks delivery when a block relationship exists", async () => {
  const senderId = new mongoose.Types.ObjectId().toString();
  const receiverId = new mongoose.Types.ObjectId().toString();

  const originalFindById = User.findById;
  const originalBlockedFindOne = BlockedUser.findOne;

  User.findById = () => ({
    select: () => ({ _id: receiverId, fullName: "Bob" }),
  });
  BlockedUser.findOne = async () => ({ _id: new mongoose.Types.ObjectId() });

  const req = {
    user: { id: senderId },
    params: { receiverId },
    body: { message: "Hello there" },
  };

  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await messageController.sendMessage(req, res, () => {});
  assert.equal(res.code, 403);
  assert.match(res.payload.message, /blocked/i);

  User.findById = originalFindById;
  BlockedUser.findOne = originalBlockedFindOne;
});

test("acceptMessageRequest transitions pending conversation to accepted", async () => {
  const recipientId = new mongoose.Types.ObjectId().toString();
  const senderId = new mongoose.Types.ObjectId().toString();
  const convId = new mongoose.Types.ObjectId().toString();

  const originalConvFindOne = Conversation.findOne;
  const originalMsgUpdateMany = Message.updateMany;

  Conversation.findOne = () => ({
    populate: () => ({
      _id: convId,
      status: "pending",
      participants: [{ _id: recipientId }, { _id: senderId }],
      save: async function () {
        this.status = "accepted";
        return this;
      },
    }),
  });

  Message.updateMany = async () => ({ modifiedCount: 1 });

  const req = {
    user: { id: recipientId },
    params: { conversationId: convId },
  };

  const res = {
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };

  await conversationController.acceptMessageRequest(req, res, () => {});
  assert.equal(res.code, 200);
  assert.equal(res.payload.success, true);
  assert.match(res.payload.message, /accepted/i);

  Conversation.findOne = originalConvFindOne;
  Message.updateMany = originalMsgUpdateMany;
});
