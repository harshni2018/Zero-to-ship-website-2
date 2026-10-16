import assert from "node:assert/strict";
import test from "node:test";
import { analyzeResumeWithLabd, parseLabdAnalysis } from "./labdService.js";

test("parseLabdAnalysis accepts JSON and removes duplicate skills", () => {
  assert.deepEqual(
    parseLabdAnalysis('```json\n{"present":["React","React"],"missing":["Docker"]}\n```'),
    { present: ["React"], missing: ["Docker"] }
  );
});

test("parseLabdAnalysis rejects overlapping present and missing skills", () => {
  assert.throws(
    () => parseLabdAnalysis('{"present":["React"],"missing":["react"]}'),
    /both present and missing/
  );
});

test("analyzeResumeWithLabd sends the key on the server request and returns the analysis", async () => {
  let request;
  const result = await analyzeResumeWithLabd("Resume text", "Job description", {
    apiKey: "test-secret",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(
        JSON.stringify({
          message: { content: '{"present":["React"],"missing":["Docker"]}' },
          credits: { percentLeft: 90 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    },
  });

  assert.equal(request.url, "https://agent.thedevlabs.io/v1/api/chat");
  assert.equal(request.options.headers.Authorization, "test-secret");
  assert.deepEqual(JSON.parse(request.options.body).messages.map(({ role }) => role), ["user"]);
  assert.deepEqual(result, { present: ["React"], missing: ["Docker"] });
});

test("analyzeResumeWithLabd reports missing key configuration", async () => {
  await assert.rejects(
    analyzeResumeWithLabd("Resume text", "Job description", { apiKey: "" }),
    { message: "AI analysis is not configured. Set LABD_API_KEY on the backend.", statusCode: 503 }
  );
});

test("analyzeResumeWithLabd maps the provider rate limit", async () => {
  await assert.rejects(
    analyzeResumeWithLabd("Resume text", "Job description", {
      apiKey: "test-secret",
      fetchImpl: async () => new Response(null, { status: 429 }),
    }),
    { message: "The labd API is rate limited. Please wait and try again.", statusCode: 429 }
  );
});
