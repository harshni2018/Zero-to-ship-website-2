// 0 → Shipped resume parser — mock build.
//
// There is no backend: choosing a PDF starts a fake "analysis" that waits a
// moment and then shows one of a few curated reports. The report is picked by
// hashing the file name, so the same PDF always gets the same result and
// different PDFs usually get different ones.

const REPORTS = [
  {
    score: 82,
    present: ["JavaScript", "React", "HTML", "CSS", "Git", "REST APIs", "Testing"],
    missing: ["TypeScript", "Docker", "AWS", "CI/CD"],
  },
  {
    score: 64,
    present: ["Python", "SQL", "Git", "REST APIs"],
    missing: ["Docker", "AWS", "Testing", "TypeScript", "React"],
  },
  {
    score: 91,
    present: ["JavaScript", "TypeScript", "React", "Node.js", "Docker", "AWS", "CI/CD", "Testing", "Git"],
    missing: ["Accessibility"],
  },
  {
    score: 47,
    present: ["HTML", "CSS", "Git"],
    missing: ["JavaScript", "React", "Node.js", "SQL", "Docker", "Testing", "CI/CD"],
  },
];

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const ringFill = document.getElementById("ringFill");
const scoreNum = document.getElementById("scoreNum");
const presentSkillsEl = document.getElementById("presentSkills");
const missingSkillsEl = document.getElementById("missingSkills");
const presentCount = document.getElementById("presentCount");
const missingCount = document.getElementById("missingCount");

const RING_LENGTH = 327; // 2π × r(52) — matches stroke-dasharray in the CSS

/* ---------- picking a file ---------- */

dropzone.addEventListener("click", () => fileInput.click());

// The programmatic click on the hidden input bubbles back up to the dropzone,
// which would call input.click() again — stop it here.
fileInput.addEventListener("click", (event) => event.stopPropagation());

// Keyboard users can open the picker with Enter or Space.
dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener("change", () => {
  handleFile(fileInput.files[0]);
  fileInput.value = ""; // so picking the same file again still fires change
});

// Highlight while dragging, and accept files dropped on the zone.
["dragenter", "dragover"].forEach((type) =>
  dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  })
);
["dragleave", "drop"].forEach((type) =>
  dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
  })
);
dropzone.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));

// A drop anywhere else would make the browser open the PDF — block that.
window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("drop", (event) => event.preventDefault());

/* ---------- the mock analysis ---------- */

function handleFile(file) {
  if (!file) return;

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    setStatus("That's not a PDF — drop a .pdf file instead.", true);
    return;
  }

  resultEl.hidden = true;
  setStatus(`Scanning ${file.name}…`);

  // The "parser": wait a moment, then show a canned report for this file.
  setTimeout(() => {
    render(pickReport(file.name));
    setStatus(`Parsed ${file.name}`);
  }, 1400);
}

function pickReport(fileName) {
  let hash = 0;
  for (const char of fileName) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return REPORTS[hash % REPORTS.length];
}

/* ---------- rendering the report ---------- */

function render(report) {
  scoreNum.textContent = "0";
  ringFill.style.stroke = ringColor(report.score);
  ringFill.style.strokeDashoffset = RING_LENGTH; // start from an empty ring

  fillChips(presentSkillsEl, report.present);
  fillChips(missingSkillsEl, report.missing);
  presentCount.textContent = `· ${report.present.length}`;
  missingCount.textContent = `· ${report.missing.length}`;

  resultEl.hidden = false;

  // Animate on the next frame so the CSS transition actually runs.
  requestAnimationFrame(() => {
    ringFill.style.strokeDashoffset = RING_LENGTH * (1 - report.score / 100);
    countUp(scoreNum, report.score, 900);
  });
}

function countUp(el, target, ms) {
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / ms, 1);
    el.textContent = Math.round(target * t);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function fillChips(list, skills) {
  list.replaceChildren(
    ...skills.map((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      return li;
    })
  );
}

function ringColor(score) {
  if (score >= 75) return "var(--good)";
  if (score >= 50) return "var(--warn)";
  return "var(--bad)";
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}
