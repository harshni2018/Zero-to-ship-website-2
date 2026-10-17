import { PDFParse } from "pdf-parse";
import { Comparison } from "../config/db.js";
import { analyzeResumeWithGemini } from "./geminiService.js";
import { validatePdfFile } from "../utils.js";

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
    const error = new Error(validationMessage);
    error.statusCode = 400;
    throw error;
  }

  const resumeText = await extractResumeText(file);
  const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);
  const totalSkills = analysis.present.length + analysis.missing.length;
  const score = totalSkills
    ? Math.round((analysis.present.length / totalSkills) * 100)
    : 0;
  const payload = {
    fileName: file.originalname,
    jobDescription,
    score,
    present: analysis.present,
    missing: analysis.missing,
  };

  if (process.env.MONGODB_URI) {
    await Comparison.create(payload);
  }

  return {
    ...payload,
    summary: `${score}% resume match`,
  };
}
