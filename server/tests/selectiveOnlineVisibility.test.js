import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

import {
  canViewerSeeUserOnline,
  getAuthorizedViewersForUser,
} from "../src/socket/presenceVisibility.js";
import {
  getOnlineVisibilitySettings,
  updateOnlineVisibilitySettings,
} from "../src/controller/userController.js";
import User from "../src/models/user.model.js";
import Contact from "../src/models/contact.model.js";
import Conversation from "../src/models/conversation.model.js";
import BlockedUser from "../src/models/blockedUser.model.js";

test("canViewerSeeUserOnline returns false when targetUser visibility is 'nobody'", async () => {
  const viewerId = new mongoose.Types.ObjectId().toString();
  const targetId = new mongoose.Types.ObjectId().toString();

  const originalBlockedExists = BlockedUser.exists;
  const originalUserFindById = User.findById;

  BlockedUser.exists = async () => false;
  User.findById = () => ({
    select: () => ({
      lean: async () => ({
        _id: targetId,
        onlineVisibility: "nobody",
        selectedOnlineContacts: [],
      }),
    }),
  });

  const canSee = await canViewerSeeUserOnline(viewerId, targetId);
  assert.equal(canSee, false);

  BlockedUser.exists = originalBlockedExists;
  User.findById = originalUserFindById;
});

test("canViewerSeeUserOnline in 'selected' mode allows selected users and blocks unselected users", async () => {
  const selectedViewerId = new mongoose.Types.ObjectId().toString();
  const unselectedViewerId = new mongoose.Types.ObjectId().toString();
  const targetId = new mongoose.Types.ObjectId().toString();

  const originalBlockedExists = BlockedUser.exists;
  const originalUserFindById = User.findById;

  BlockedUser.exists = async () => false;
  User.findById = () => ({
    select: () => ({
      lean: async () => ({
        _id: targetId,
        onlineVisibility: "selected",
        selectedOnlineContacts: [new mongoose.Types.ObjectId(selectedViewerId)],
      }),
    }),
  });

  // Selected viewer can see online
  const canSeeSelected = await canViewerSeeUserOnline(selectedViewerId, targetId);
  assert.equal(canSeeSelected, true);

  // Unselected viewer cannot see online
  const canSeeUnselected = await canViewerSeeUserOnline(unselectedViewerId, targetId);
  assert.equal(canSeeUnselected, false);

  BlockedUser.exists = originalBlockedExists;
  User.findById = originalUserFindById;
});

test("canViewerSeeUserOnline returns false when users are blocked regardless of privacy mode", async () => {
  const viewerId = new mongoose.Types.ObjectId().toString();
  const targetId = new mongoose.Types.ObjectId().toString();

  const originalBlockedExists = BlockedUser.exists;
  BlockedUser.exists = async () => true;

  const canSee = await canViewerSeeUserOnline(viewerId, {
    _id: targetId,
    onlineVisibility: "everyone",
    selectedOnlineContacts: [],
  });
  assert.equal(canSee, false);

  BlockedUser.exists = originalBlockedExists;
});

test("getAuthorizedViewersForUser returns only selected contact IDs when visibility is 'selected'", async () => {
  const targetId = new mongoose.Types.ObjectId().toString();
  const contact1 = new mongoose.Types.ObjectId().toString();
  const contact2 = new mongoose.Types.ObjectId().toString();

  const originalUserFindById = User.findById;
  const originalBlockedFind = BlockedUser.find;

  User.findById = () => ({
    select: () => ({
      lean: async () => ({
        _id: targetId,
        onlineVisibility: "selected",
        selectedOnlineContacts: [contact1, contact2],
      }),
    }),
  });
  BlockedUser.find = () => ({ lean: async () => [] });

  const viewers = await getAuthorizedViewersForUser(targetId);
  assert.equal(viewers.length, 2);
  assert.ok(viewers.includes(contact1));
  assert.ok(viewers.includes(contact2));

  User.findById = originalUserFindById;
  BlockedUser.find = originalBlockedFind;
});

test("updateOnlineVisibilitySettings rejects invalid visibility option", async () => {
  const req = {
    user: { id: new mongoose.Types.ObjectId().toString() },
    body: { onlineVisibility: "invalid_option" },
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

  await updateOnlineVisibilitySettings(req, res, () => {});
  assert.equal(res.code, 400);
  assert.match(res.payload.message, /invalid online visibility/i);
});

test("updateOnlineVisibilitySettings saves preferences to User model", async () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const contactId = new mongoose.Types.ObjectId().toString();

  const fakeUser = {
    _id: userId,
    onlineVisibility: "everyone",
    selectedOnlineContacts: [],
    save: async function () {
      return this;
    },
  };

  const originalFindById = User.findById;
  const originalContactFind = Contact.find;
  const originalConvFind = Conversation.find;
  const originalBlockedFind = BlockedUser.find;

  User.findById = (id) => {
    return Object.assign(Promise.resolve(fakeUser), {
      select: () => ({
        lean: async () => fakeUser,
      }),
    });
  };
  Contact.find = () => ({ lean: async () => [] });
  Conversation.find = () => ({ lean: async () => [] });
  BlockedUser.find = () => ({ lean: async () => [] });

  const req = {
    user: { id: userId },
    body: {
      onlineVisibility: "selected",
      selectedContactIds: [contactId],
    },
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

  await updateOnlineVisibilitySettings(req, res, () => {});
  assert.equal(res.code, 200);
  assert.equal(res.payload.success, true);
  assert.equal(fakeUser.onlineVisibility, "selected");
  assert.equal(fakeUser.selectedOnlineContacts.length, 1);

  User.findById = originalFindById;
  Contact.find = originalContactFind;
  Conversation.find = originalConvFind;
  BlockedUser.find = originalBlockedFind;
});
