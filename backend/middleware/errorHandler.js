export function errorHandler(error, _req, res, _next) {
  if (error && error.name === "MulterError") {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message = status === 413 ? "The PDF must be 8 MB or smaller." : error.message;
    return res.status(status).json({ error: message });
  }

  const candidateStatus = error?.statusCode ?? error?.status;
  const status = Number.isInteger(candidateStatus) && candidateStatus >= 400 && candidateStatus <= 599
    ? candidateStatus
    : 500;
  if (status >= 500) {
    console.error("Request failed:", error);
    if (status === 500) {
      return res.status(status).json({ error: "Internal server error." });
    }
  }

  return res.status(status).json({ error: error.message || "Invalid request." });
}
