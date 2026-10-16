import { Router } from "express";
import { compareResumeHandler } from "../controller/comparisonController.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/api/compare", upload.single("resume"), compareResumeHandler);

export default router;
