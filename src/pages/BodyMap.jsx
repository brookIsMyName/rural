
import { useEffect, useState } from "react";
import { bodyRegions } from "../data/bodyMapData";
import { API_BASE } from "../config/api";
import {
  sendMessage,
  parseUrgency,
  stripUrgencyLine,
} from "../services/claudeApi";

const panelStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 24,
  padding: 24,
  minWidth: 0,
  boxSizing: "border-box",
};

function formatDate(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleString();
}

export default function BodyMap() {
  const [selectedParts, setSelectedParts] = useState([]);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [severityMap, setSeverityMap] = useState({});
  const [notesMap, setNotesMap] = useState({});

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [aiReportId, setAiReportId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGuidance, setAiGuidance] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiUrgency, setAiUrgency] = useState(null);

  const getToken = () => localStorage.getItem("rc_token");

  const loadReports = async () => {
    const token = getToken();

    if (!token) {
      setReports([]);
      setLoadingReports(false);
      setStatus(
        "Please sign in to save and view your symptom reports."
      );
      return;
    }

    setLoadingReports(true);

    try {
      const res = await fetch(`${API_BASE}/api/symptoms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to load symptom reports."
        );
      }

      setReports(data.reports || []);
    } catch (error) {
      setStatus(
        error.message || "Unable to load symptom reports."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const togglePart = (part) => {
    setSelectedParts((prev) =>
      prev.includes(part)
        ? prev.filter((p) => p !== part)
        : [...prev, part]
    );
  };

  const updateSeverity = (part, value) => {
    setSeverityMap((prev) => ({
      ...prev,
      [part]: Number(value),
    }));
  };

  const updateNotes = (part, value) => {
    setNotesMap((prev) => ({
      ...prev,
      [part]: value,
    }));
  };

  const submitSymptoms = async () => {
    const token = getToken();

    if (!token) {
      setStatus("Please sign in before submitting symptoms.");
      return;
    }

    if (selectedParts.length === 0) {
      setStatus("Select at least one body region first.");
      return;
    }

    const payload = {
      symptoms: selectedParts.map((part) => ({
        bodyPart: part,
        severity: severityMap[part] || 1,
        notes: notesMap[part] || "",
      })),
    };

    setSaving(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE}/api/symptoms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to save your symptom report."
        );
      }

      if (!data.report) {
        throw new Error(
          "The server did not return the saved report."
        );
      }

      setReports((prev) => [
        data.report,
        ...prev.filter(
          (report) => report._id !== data.report._id
        ),
      ]);

      setStatus("Your symptom report was saved successfully.");
    } catch (error) {
      setStatus(
        error.message || "Submission failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const askAI = async (report) => {
    setAiReportId(report._id);
    setAiLoading(true);
    setAiGuidance("");
    setAiError("");
    setAiUrgency(null);

    const symptomDetails = (report.symptoms || [])
      .map(
        (symptom) =>
          `Body region: ${symptom.bodyPart}\n` +
          `Reported severity: ${symptom.severity}/10\n` +
          `Description: ${symptom.notes || "Not provided"}`
      )
      .join("\n\n");

    const prompt = `
You are a cautious health information assistant for SalviaHealth.

Help the user understand their self-reported symptoms and decide on appropriate next steps. Do not diagnose or invent medical facts.

Keep your entire response concise, ideally under 150 words.

Use this exact structure, with a blank line between sections:

WHAT THIS COULD MEAN
Briefly explain that symptoms can have different causes. Avoid listing many possible conditions.

WHAT TO DO NOW
Give 1–3 practical, safe steps.

WHEN TO SEEK CARE
Explain the appropriate level of care. If symptoms suggest an emergency, clearly advise emergency medical care. Do not delay urgent care by asking questions.

QUESTIONS
Ask at most two important follow-up questions, only if useful.

Use short sentences, plain language, and readable paragraphs. Do not repeat the user's question or add a long introduction. Keep the advice appropriate to the reported symptoms and their severity.

Reported symptoms:
${symptomDetails}
`.trim();

    try {
      const answer = await sendMessage([
        {
          role: "user",
          content: prompt,
        },
      ]);

      setAiUrgency(parseUrgency(answer));
      setAiGuidance(stripUrgencyLine(answer));
    } catch (error) {
      setAiError(
        error.message ||
          "Unable to get AI guidance right now."
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07110f",
        color: "#fff",
        paddingTop: 90,
        paddingBottom: 40,
        paddingLeft: 20,
        paddingRight: 20,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* BODY MAP */}

        <div
          style={{
            ...panelStyle,
            height: "fit-content",
            padding: 20,
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 20,
              fontSize: 28,
            }}
          >
            Symptom Body Map
          </h2>

          <p style={{ color: "rgba(255,255,255,0.65)" }}>
            Select the body regions where you are experiencing
            symptoms.
          </p>

          <svg
            viewBox="0 0 400 600"
            role="group"
            aria-label="Interactive body map"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          >
            {bodyRegions.map((region) => {
              const selected = selectedParts.includes(region.id);
              const hovered = hoveredPart === region.id;

              return (
                <path
                  key={region.id}
                  d={region.path}
                  role="button"
                  aria-label={region.id.replaceAll("-", " ")}
                  aria-pressed={selected}
                  tabIndex={0}
                  onClick={() => togglePart(region.id)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      togglePart(region.id);
                    }
                  }}
                  onMouseEnter={() =>
                    setHoveredPart(region.id)
                  }
                  onMouseLeave={() => setHoveredPart(null)}
                  style={{
                    fill: selected
                      ? "#10b981"
                      : hovered
                        ? "#0ea5e9"
                        : "rgba(255,255,255,0.08)",
                    stroke: selected
                      ? "#34d399"
                      : "rgba(255,255,255,0.2)",
                    strokeWidth: 2,
                    cursor: "pointer",
                    transition: "0.2s",
                    outline: "none",
                  }}
                />
              );
            })}
          </svg>

          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
            }}
          >
            Selected regions: {selectedParts.length}
          </p>
        </div>

        {/* NEW REPORT FORM AND SAVED REPORTS */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
          }}
        >
          {/* SELECTED SYMPTOMS */}

          <div style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>
              Selected Symptoms
            </h2>

            {selectedParts.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.5)" }}>
                Select a body region to describe your symptoms.
              </p>
            )}

            {selectedParts.map((part) => (
              <div
                key={part}
                style={{
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <h3 style={{ textTransform: "capitalize" }}>
                  {part.replaceAll("-", " ")}
                </h3>

                <label>
                  Severity: {severityMap[part] || 1}/10
                </label>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityMap[part] || 1}
                  onChange={(event) =>
                    updateSeverity(part, event.target.value)
                  }
                  style={{ width: "100%" }}
                />

                <textarea
                  aria-label={`Description for ${part}`}
                  placeholder="Describe what you are experiencing..."
                  maxLength={2000}
                  value={notesMap[part] || ""}
                  onChange={(event) =>
                    updateNotes(part, event.target.value)
                  }
                  style={{
                    boxSizing: "border-box",
                    width: "100%",
                    marginTop: 14,
                    minHeight: 90,
                    borderRadius: 14,
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff",
                    padding: 14,
                    resize: "vertical",
                    font: "inherit",
                  }}
                />

                <button
                  type="button"
                  onClick={() => togglePart(part)}
                  style={{
                    marginTop: 8,
                    background: "transparent",
                    border:
                      "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    color: "#fff",
                    padding: "7px 12px",
                    cursor: "pointer",
                  }}
                >
                  Remove region
                </button>
              </div>
            ))}

            {selectedParts.length > 0 && (
              <button
                type="button"
                onClick={submitSymptoms}
                disabled={saving}
                style={{
                  width: "100%",
                  minHeight: 52,
                  border: "none",
                  borderRadius: 16,
                  background: saving
                    ? "#376b5b"
                    : "linear-gradient(135deg,#10b981,#059669)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: saving ? "wait" : "pointer",
                }}
              >
                {saving
                  ? "Saving report..."
                  : "Save Symptom Report"}
              </button>
            )}

            {status && (
              <p
                role="status"
                style={{
                  marginBottom: 0,
                  color: status.includes("successfully")
                    ? "#6ee7b7"
                    : "#fbbf24",
                  overflowWrap: "anywhere",
                }}
              >
                {status}
              </p>
            )}
          </div>

          {/* SAVED REPORT HISTORY */}

          <div style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 0 }}>
                Your Saved Reports
              </h2>

              <button
                type="button"
                onClick={loadReports}
                disabled={loadingReports}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border:
                    "1px solid rgba(255,255,255,0.15)",
                  background: "transparent",
                  color: "#fff",
                  cursor: loadingReports ? "wait" : "pointer",
                }}
              >
                {loadingReports ? "Loading..." : "Refresh"}
              </button>
            </div>

            {loadingReports && (
              <p>Loading your reports...</p>
            )}

            {!loadingReports && reports.length === 0 && (
              <p style={{ color: "rgba(255,255,255,0.55)" }}>
                No saved reports yet. Your successfully saved
                reports will appear here.
              </p>
            )}

            {reports.map((report) => (
              <div
                key={report._id}
                style={{
                  marginTop: 16,
                  padding: 16,
                  borderRadius: 14,
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.025)",
                  minWidth: 0,
                  overflowWrap: "anywhere",
                }}
              >
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                  }}
                >
                  {formatDate(report.createdAt)}
                </p>

                {(report.symptoms || []).map(
                  (symptom, index) => (
                    <div
                      key={`${report._id}-${index}`}
                      style={{ marginBottom: 12 }}
                    >
                      <strong
                        style={{ textTransform: "capitalize" }}
                      >
                        {symptom.bodyPart.replaceAll("-", " ")}
                      </strong>

                      <p style={{ margin: "5px 0" }}>
                        Reported severity: {symptom.severity}/10
                      </p>

                      {symptom.notes && (
                        <p
                          style={{
                            margin: "5px 0",
                            color: "rgba(255,255,255,0.7)",
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {symptom.notes}
                        </p>
                      )}
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={() => askAI(report)}
                  disabled={aiLoading}
                  style={{
                    marginTop: 8,
                    padding: "11px 14px",
                    border: "none",
                    borderRadius: 10,
                    background: "#0d8b68",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: aiLoading ? "wait" : "pointer",
                    maxWidth: "100%",
                  }}
                >
                  {aiLoading && aiReportId === report._id
                    ? "Getting guidance..."
                    : "Ask AI about this report"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FULL-WIDTH AI GUIDANCE PANEL */}

        {aiReportId && (
          <div
            style={{
              gridColumn: "1 / -1",
              width: "100%",
              minWidth: 0,
              boxSizing: "border-box",
              ...panelStyle,
              padding: "clamp(18px, 3vw, 32px)",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 850,
                minWidth: 0,
                margin: "0 auto",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  marginBottom: 8,
                  fontSize: 25,
                }}
              >
                AI Health Guidance
              </h2>

              <p
                style={{
                  marginTop: 0,
                  marginBottom: 24,
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 14,
                }}
              >
                General information based on your saved symptom
                report.
              </p>

              {aiLoading && (
                <div
                  role="status"
                  style={{
                    padding: 18,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.04)",
                    color: "#a7f3d0",
                    lineHeight: 1.7,
                  }}
                >
                  Reviewing your report and preparing guidance...
                </div>
              )}

              {!aiLoading && aiError && (
                <div
                  role="alert"
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid rgba(251,191,36,0.25)",
                    background: "rgba(251,191,36,0.07)",
                    color: "#fcd34d",
                    lineHeight: 1.7,
                  }}
                >
                  {aiError}
                </div>
              )}

              {!aiLoading && aiUrgency && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    marginBottom: 24,
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.06)",
                    color:
                      aiUrgency.level === "emergency"
                        ? "#fca5a5"
                        : aiUrgency.level === "clinic"
                          ? "#fcd34d"
                          : "#6ee7b7",
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {aiUrgency.icon} {aiUrgency.label}
                </div>
              )}

              {!aiLoading && aiGuidance && (
                <div
                  style={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    padding: "clamp(16px, 2.5vw, 26px)",
                    borderRadius: 16,
                    background: "rgba(16,185,129,0.06)",
                    border:
                      "1px solid rgba(16,185,129,0.18)",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: 16,
                    lineHeight: 1.8,
                    overflowWrap: "anywhere",
                  }}
                >
                  {aiGuidance
                    .split(/\n\s*\n/)
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => {
                      const isHeading =
                        /^(WHAT THIS COULD MEAN|WHAT TO DO NOW|WHEN TO SEEK CARE|QUESTIONS)\s*:?\s*$/i.test(
                          paragraph
                        );

                      if (isHeading) {
                        return (
                          <h3
                            key={index}
                            style={{
                              marginTop: index === 0 ? 0 : 26,
                              marginBottom: 8,
                              fontSize: 14,
                              lineHeight: 1.5,
                              letterSpacing: "0.07em",
                              color: "#6ee7b7",
                            }}
                          >
                            {paragraph.replace(/:$/, "")}
                          </h3>
                        );
                      }

                      return (
                        <p
                          key={index}
                          style={{
                            margin: "0 0 16px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {paragraph}
                        </p>
                      );
                    })}

                  <div
                    style={{
                      marginTop: 28,
                      paddingTop: 16,
                      borderTop:
                        "1px solid rgba(255,255,255,0.1)",
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    AI guidance can be inaccurate and is not a
                    medical diagnosis. Seek a qualified health
                    professional for medical advice.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
