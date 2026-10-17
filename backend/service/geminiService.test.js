import assert from "node:assert/strict";
import test from "node:test";
import { analyzeResumeWithGemini, parseGeminiAnalysis } from "./geminiService.js";

test("parseGeminiAnalysis accepts JSON and removes duplicate skills", () => {
  assert.deepEqual(
    parseGeminiAnalysis('```json\n{"present":["React","React"],"missing":["Docker"]}\n```'),
    { present: ["React"], missing: ["Docker"] }
  );
});

test("parseGeminiAnalysis rejects overlapping present and missing skills", () => {
  assert.throws(
    () => parseGeminiAnalysis('{"present":["React"],"missing":["react"]}'),
    /both present and missing/
  );
});

test("analyzeResumeWithGemini requests structured JSON and returns the analysis", async () => {
  let clientOptions;
  let request;
  const result = await analyzeResumeWithGemini("Resume text", "Job description", {
    apiKey: "test-key",
    clientFactory: (options) => {
      clientOptions = options;
      return {
        interactions: {
          async create(params, requestOptions) {
            request = { params, requestOptions };
            return {
              output_text: '{"present":["React"],"missing":["Docker"]}',
            };
          },
        },
      };
    },
  });

  assert.deepEqual(clientOptions, { apiKey: "test-key" });
  assert.equal(request.params.model, "gemini-flash-latest");
  assert.equal(request.params.response_format.mime_type, "application/json");
  assert.deepEqual(request.params.response_format.schema.required, ["present", "missing"]);
  assert.equal(request.requestOptions.timeout_ms, 45_000);
  assert.match(request.params.input, /Resume text/);
  assert.match(request.params.input, /Job description/);
  assert.deepEqual(result, { present: ["React"], missing: ["Docker"] });
});

test("analyzeResumeWithGemini reports missing key configuration", async () => {
  await assert.rejects(
    analyzeResumeWithGemini("Resume text", "Job description", { apiKey: "" }),
    {
      message: "AI analysis is not configured. Set Gemini_API_KEY on the backend.",
      statusCode: 503,
    }
  );
});

test("analyzeResumeWithGemini maps provider rate limits", async () => {
  await assert.rejects(
    analyzeResumeWithGemini("Resume text", "Job description", {
      apiKey: "test-key",
      clientFactory: () => ({
        interactions: {
          async create() {
            throw Object.assign(new Error("rate limited"), { status: 429 });
          },
        },
      }),
    }),
    {
      message: "The Gemini API is rate limited. Please wait and try again.",
      statusCode: 429,
    }
  );
});
