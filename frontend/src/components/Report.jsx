import { useEffect, useState } from "react";

const RING_LENGTH = 327; // 2π × r(52) — matches stroke-dasharray in the CSS

export default function Report({ report }) {
  // One animated value drives both visuals: `shown` counts up from 0 to the
  // score, and the ring's dash offset is derived from it on every render.
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Users who ask the OS for reduced motion get the final number instantly
    // instead of a 0.9s animation — same content, no movement.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(report.score);
      return;
    }
    const start = performance.now();
    let frame;
    function tick(now) {
      const t = Math.min((now - start) / 900, 1);
      setShown(report.score * t);
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [report]);

  return (
    <div className="result">
      <div className="score-card">
        <div className="ring-wrap">
          <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle className="ring-bg" cx="60" cy="60" r="52" />
            <circle
              className="ring-fill"
              cx="60"
              cy="60"
              r="52"
              style={{
                stroke: ringColor(report.score),
                strokeDashoffset: RING_LENGTH * (1 - shown / 100),
              }}
            />
          </svg>
          <div className="score-num">{Math.round(shown)}</div>
        </div>
        <div className="score-label">Resume score</div>
      </div>

      <div className="skills">
        <SkillList title="Skills present" skills={report.present} kind="present" />
        <SkillList title="Skills missing" skills={report.missing} kind="missing" />
      </div>
    </div>
  );
}

function SkillList({ title, skills, kind }) {
  return (
    <div className="skills-col">
      <h3>
        {title} <span className="count">· {skills.length}</span>
      </h3>
      <ul className={`chips chips-${kind}`}>
        {skills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>
    </div>
  );
}

function ringColor(score) {
  if (score >= 75) return "var(--good)";
  if (score >= 50) return "var(--warn)";
  return "var(--bad)";
}
