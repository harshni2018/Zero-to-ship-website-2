import { useEffect, useRef, useState } from "react";
import { isPdf } from "../parser";

export default function Dropzone({ onReport, onStatus, jobDescription }) {
  const inputRef = useRef(null);
  const latestRequestId = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const prevent = (event) => event.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);

    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  async function handleFile(file) {
    const requestId = ++latestRequestId.current;
    if (!file) return;

    if (!isPdf(file)) {
      onStatus({
        message: "That's not a PDF — drop a .pdf file instead.",
        error: true,
      });
      return;
    }

    if (!jobDescription.trim()) {
      onStatus({
        message: "Add a job description before comparing the resume.",
        error: true,
      });
      return;
    }

    onReport(null);
    onStatus({ message: `Comparing ${file.name} against the job description…`, error: false });

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

    if (!import.meta.env.DEV && !apiBaseUrl) {
      onStatus({
        message: "The API URL is not configured. Set VITE_API_URL to your backend deployment URL.",
        error: true,
      });
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/compare`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to compare the resume.");
      }
      if (
        !Number.isFinite(data.score) ||
        data.score < 0 ||
        data.score > 100 ||
        !Array.isArray(data.present) ||
        !Array.isArray(data.missing)
      ) {
        throw new Error("The server returned an invalid comparison result.");
      }
      if (requestId !== latestRequestId.current) return;

      onReport({
        score: data.score,
        present: data.present,
        missing: data.missing,
      });
      onStatus({ message: `Compared ${file.name} successfully`, error: false });
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      onStatus({
        message: error instanceof Error ? error.message : `Couldn't compare ${file.name}. Try another PDF.`,
        error: true,
      });
    }
  }

  return (
    <div
      className={dragging ? "dropzone dragover" : "dropzone"}
      tabIndex={0}
      role="button"
      aria-label="Upload a PDF resume"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          handleFile(event.target.files[0]);
          event.target.value = "";
        }}
      />
      <p className="drop-title">Drop a PDF here, or click to choose one</p>
      <p className="drop-hint">PDFs are uploaded to this app for text extraction and skill matching.</p>
    </div>
  );
}
