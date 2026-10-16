export const skillCatalog = [
  "JavaScript",
  "React",
  "Node.js",
  "TypeScript",
  "Python",
  "SQL",
  "REST APIs",
  "Git",
  "HTML",
  "CSS",
  "MongoDB",
  "Docker",
  "AWS",
  "CI/CD",
  "Testing",
  "Leadership",
  "Communication",
];

export function normalizeText(value = "") {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreSkillMatch(text, skill) {
  const normalized = normalizeText(text);

  switch (skill) {
    case "JavaScript":
      return /javascript|js\b/.test(normalized);
    case "React":
      return /react\b/.test(normalized);
    case "Node.js":
      return /node\.js|nodejs|node\b/.test(normalized);
    case "TypeScript":
      return /typescript|ts\b/.test(normalized);
    case "Python":
      return /python\b/.test(normalized);
    case "SQL":
      return /sql\b|mysql|postgres|postgresql/.test(normalized);
    case "REST APIs":
      return /rest api|restful api|apis|api integration/.test(normalized);
    case "Git":
      return /git\b|github|gitlab/.test(normalized);
    case "HTML":
      return /html\b/.test(normalized);
    case "CSS":
      return /css\b|tailwind|sass|scss/.test(normalized);
    case "MongoDB":
      return /mongodb|mongo db/.test(normalized);
    case "Docker":
      return /docker\b/.test(normalized);
    case "AWS":
      return /aws\b|amazon web services/.test(normalized);
    case "CI/CD":
      return /ci\/cd|continuous integration|continuous deployment|github actions|jenkins/.test(normalized);
    case "Testing":
      return /testing|unit tests|integration tests|jest|pytest/.test(normalized);
    case "Leadership":
      return /leadership|mentoring|owner|team lead/.test(normalized);
    case "Communication":
      return /communication|stakeholder|presentations|writing/.test(normalized);
    default:
      return false;
  }
}

export function buildComparison(resumeText, jobDescription) {
  const jdText = jobDescription || "";
  const allResumeSkills = [...new Set(skillCatalog.filter((skill) => scoreSkillMatch(resumeText, skill)))];
  const relevantSkills = [...new Set(skillCatalog.filter((skill) => scoreSkillMatch(jdText, skill)))];
  const comparisonSkills = relevantSkills.length
    ? relevantSkills
    : ["JavaScript", "React", "Git", "REST APIs", "TypeScript", "Docker"];

  const present = comparisonSkills.filter((skill) => allResumeSkills.includes(skill));
  const missing = comparisonSkills.filter((skill) => !allResumeSkills.includes(skill));
  const score = comparisonSkills.length
    ? Math.max(0, Math.min(100, Math.round((present.length / comparisonSkills.length) * 100)))
    : 0;

  return {
    score,
    present: present.length ? present : allResumeSkills.length ? allResumeSkills.slice(0, 3) : ["JavaScript", "Git"],
    missing: missing.length ? missing : comparisonSkills.length ? comparisonSkills.slice(0, 3) : ["TypeScript", "Docker"],
  };
}

export function validatePdfFile(file) {
  if (!file) {
    return "A resume PDF is required.";
  }

  if (file.mimetype !== "application/pdf" && !file.originalname.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are allowed.";
  }

  return null;
}
