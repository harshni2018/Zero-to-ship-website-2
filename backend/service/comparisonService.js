import { PDFParse } from "pdf-parse";
import { Comparison } from "../config/db.js";
import { buildComparison, validatePdfFile } from "../utils.js";

async function extractResumeText(file) {
  if (!file || !file.buffer || !file.buffer.length) {
    const error = new Error("The uploaded PDF is empty.");
    error.statusCode = 422;
    throw error;
  }

  const parser = new PDFParse({ data: file.buffer });
  try {
    const result = await parser.getText();
    if (!result.text.trim()) {
      const error = new Error("This PDF contains no extractable text. Upload a text-based PDF.");
      error.statusCode = 422;
      throw error;
    }
    return result.text;
  } catch (error) {
    if (error.statusCode === 422) {
      throw error;
    }

    const parsingError = new Error("Could not read this PDF. Upload a valid, text-based PDF.");
    parsingError.statusCode = 422;
    throw parsingError;
  } finally {
    await parser.destroy();
  }
}

export async function compareResume(file, jobDescription = "") {
  const validationMessage = validatePdfFile(file);
  if (validationMessage) {
    throw new Error(validationMessage);
  }

  const resumeText = await extractResumeText(file);
  const comparison = buildComparison(resumeText, jobDescription);
  const payload = {
    fileName: file.originalname,
    jobDescription,
    score: comparison.score,
    present: comparison.present,
    missing: comparison.missing,
  };

  if (process.env.MONGODB_URI) {
    await Comparison.create(payload);
  }

  return {
    ...payload,
    summary: `${comparison.score}% resume match`,
  };
}
