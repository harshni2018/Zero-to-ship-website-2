export default function HowItWorks() {
  return (
    <section className="how" id="how">
      <h2>How it works</h2>
      <ol className="steps">
        <li>
          <h3>1 · Upload</h3>
          <p>Drop any PDF resume into the box above.</p>
        </li>
        <li>
          <h3>2 · Analyze</h3>
          <p>The parser scans the document for known skills and structure.</p>
        </li>
        <li>
          <h3>3 · Score</h3>
          <p>You get a 0–100 score plus present and missing skills.</p>
        </li>
      </ol>
      <p className="note">
        This version uses text-based skill matching. AI-powered analysis can be
        added later.
      </p>
    </section>
  );
}
