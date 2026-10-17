import assert from "node:assert/strict";
import test from "node:test";
import { errorHandler } from "./errorHandler.js";

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("errorHandler exposes a safe service error and preserves its status", () => {
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    errorHandler({ message: "AI analysis is not configured.", statusCode: 503 }, {}, response, () => {});
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 503);
  assert.deepEqual(response.body, { error: "AI analysis is not configured." });
});

test("errorHandler masks unclassified internal errors", () => {
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};

  try {
    errorHandler(new Error("internal detail"), {}, response, () => {});
  } finally {
    console.error = originalError;
  }

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, { error: "Internal server error." });
});
