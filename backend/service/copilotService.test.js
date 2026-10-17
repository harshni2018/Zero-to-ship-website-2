import assert from "node:assert/strict";
import test from "node:test";
import { analyzeResumeWithCopilot, parseCopilotAnalysis } from "./copilotService.js";

test("parseCopilotAnalysis accepts JSON and removes duplicate skills", () => {
  assert.deepEqual(
    parseCopilotAnalysis('```json\n{"present":["React","React"],"missing":["Docker"]}\n```'),
    { present: ["React"], missing: ["Docker"] }
  );
});

test("parseCopilotAnalysis rejects overlapping present and missing skills", () => {
  assert.throws(
    () => parseCopilotAnalysis('{"present":["React"],"missing":["react"]}'),
    /both present and missing/
  );
});

test("analyzeResumeWithCopilot uses a restricted session and returns the analysis", async () => {
  let clientOptions;
  let sessionOptions;
  let sentPrompt;
  let stopped = false;
  const result = await analyzeResumeWithCopilot("Resume text", "Job description", {
    apiKey: "test-token",
    clientFactory: (options) => {
      clientOptions = options;
      return {
        async start() {},
        async createSession(optionsForSession) {
          sessionOptions = optionsForSession;
          return {
            async sendAndWait({ prompt }, timeout) {
              sentPrompt = prompt;
              assert.equal(timeout, 40_000);
              return {
                data: { content: '{"present":["React"],"missing":["Docker"]}' },
              };
            },
          };
        },
        async stop() {
          stopped = true;
          return [];
        },
      };
    },
  });

  assert.equal(clientOptions.gitHubToken, "test-token");
  assert.equal(clientOptions.useLoggedInUser, false);
  assert.equal(clientOptions.mode, "empty");
  assert.equal(clientOptions.workingDirectory, clientOptions.baseDirectory);
  assert.deepEqual(sessionOptions.availableTools, []);
  assert.match(sentPrompt, /Resume text/);
  assert.match(sentPrompt, /Job description/);
  assert.deepEqual(result, { present: ["React"], missing: ["Docker"] });
  assert.equal(stopped, true);
});

test("analyzeResumeWithCopilot reports missing token configuration", async () => {
  await assert.rejects(
    analyzeResumeWithCopilot("Resume text", "Job description", { apiKey: "" }),
    {
      message: "AI analysis is not configured. Set COPILOT_GITHUB_TOKEN on the backend.",
      statusCode: 503,
    }
  );
});
