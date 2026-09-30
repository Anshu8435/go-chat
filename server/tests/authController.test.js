import test from 'node:test';
import assert from 'node:assert/strict';

import * as authController from '../src/controller/authController.js';
import User from '../src/models/user.model.js';

test('ForgotPassword resets password for an existing user', async () => {
  const originalFindOne = User.findOne;

  User.findOne = async ({ email }) => {
    if (email === 'reset@example.com') {
      return {
        email,
        save: async () => ({ ok: true }),
      };
    }

    return null;
  };

  const req = {
    body: {
      email: 'reset@example.com',
      newPassword: 'newStrongPassword123',
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

  await authController.ForgotPassword(req, res, () => {});

  assert.equal(res.code, 200);
  assert.match(res.payload.message, /successful|updated/i);

  User.findOne = originalFindOne;
});
