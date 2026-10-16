import { compareResume } from "../service/comparisonService.js";

export async function compareResumeHandler(req, res, next) {
  try {
    const { jobDescription = "" } = req.body || {};
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "A resume PDF is required." });
    }

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ error: "A job description is required." });
    }

    const payload = await compareResume(file, jobDescription);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
}
