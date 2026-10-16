export function validatePdfFile(file) {
  if (!file) {
    return "A resume PDF is required.";
  }

  if (file.mimetype !== "application/pdf" && !file.originalname.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are allowed.";
  }

  return null;
}
