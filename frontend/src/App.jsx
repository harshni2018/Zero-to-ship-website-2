import { useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Dropzone from "./components/Dropzone";
import Report from "./components/Report";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";

export default function App() {
  const [jobDescription, setJobDescription] = useState("");
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState({ message: "", error: false });

  return (
    <>
      <Header />
      <main>
        <Hero />
        <section className="demo" id="demo">
          <h2>Parse a resume</h2>
          <div className="compare-panel">
            <label className="jd-label" htmlFor="job-description">
              Job description
            </label>
            <textarea
              id="job-description"
              className="jd-input"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the role description here to compare against the resume…"
              rows={6}
            />
            <Dropzone
              onReport={setReport}
              onStatus={setStatus}
              jobDescription={jobDescription}
            />
          </div>
          <p
            className={status.error ? "status error" : "status"}
            role={status.error ? "alert" : "status"}
          >
            {status.message}
          </p>
          {report && <Report report={report} />}
        </section>
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
