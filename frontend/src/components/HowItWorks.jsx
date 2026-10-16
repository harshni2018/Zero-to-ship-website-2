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
          <p>AI compares the resume's skills with the job description.</p>
        </li>
        <li>
          <h3>3 · Score</h3>
          <p>You get a 0–100 score plus present and missing skills.</p>
        </li>
      </ol>
      <p className="note">
        Resume text is sent securely from the backend for AI analysis. The API
        key is never exposed to the browser.
      </p>
    </section>
  );
}
