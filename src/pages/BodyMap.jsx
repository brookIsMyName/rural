import { useState } from "react";
import { bodyRegions } from "../data/bodyMapData";
import { API_BASE } from "../config/api";

export default function BodyMap() {
  const [selectedParts, setSelectedParts] =
    useState([]);

  const [hoveredPart, setHoveredPart] =
    useState(null);

  const [severityMap, setSeverityMap] =
    useState({});

  const [notesMap, setNotesMap] =
    useState({});

  const togglePart = (part) => {
    setSelectedParts((prev) => {
      if (prev.includes(part)) {
        return prev.filter((p) => p !== part);
      }

      return [...prev, part];
    });
  };

  const updateSeverity = (part, value) => {
    setSeverityMap((prev) => ({
      ...prev,
      [part]: value,
    }));
  };

  const updateNotes = (part, value) => {
    setNotesMap((prev) => ({
      ...prev,
      [part]: value,
    }));
  };

  const submitSymptoms = async () => {
    const payload = {
      symptoms: selectedParts.map((part) => ({
        bodyPart: part,
        severity: severityMap[part] || 1,
        notes: notesMap[part] || "",
      })),
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/symptoms`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      console.log(data);

      alert("Symptoms submitted");
    } catch (err) {
      console.error(err);

      alert("Submission failed");
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
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "minmax(320px,450px) 1fr",
          gap: 30,
        }}
      >
        {/* BODY */}

        <div
          style={{
            background:
              "rgba(255,255,255,0.04)",
            border:
              "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            padding: 20,
            height: "fit-content",
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

          <svg
            viewBox="0 0 400 600"
            style={{
              width: "100%",
              height: "auto",
            }}
          >
            {bodyRegions.map((region) => {
              const selected =
                selectedParts.includes(
                  region.id
                );

              const hovered =
                hoveredPart === region.id;

              return (
                <path
                  key={region.id}
                  d={region.path}
                  onClick={() =>
                    togglePart(region.id)
                  }
                  onMouseEnter={() =>
                    setHoveredPart(region.id)
                  }
                  onMouseLeave={() =>
                    setHoveredPart(null)
                  }
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
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* PANEL */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div
            style={{
              background:
                "rgba(255,255,255,0.04)",
              border:
                "1px solid rgba(255,255,255,0.08)",
              borderRadius: 24,
              padding: 24,
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              Selected Symptoms
            </h2>

            {selectedParts.length === 0 && (
              <p
                style={{
                  color:
                    "rgba(255,255,255,0.5)",
                }}
              >
                Tap body regions to begin.
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
                <h3
                  style={{
                    textTransform:
                      "capitalize",
                  }}
                >
                  {part.replace("-", " ")}
                </h3>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <label>
                    Severity:
                  </label>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={
                      severityMap[part] ||
                      1
                    }
                    onChange={(e) =>
                      updateSeverity(
                        part,
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                    }}
                  />

                  <div>
                    Level:{" "}
                    {severityMap[part] ||
                      1}
                  </div>
                </div>

                <textarea
                  placeholder="Describe symptoms..."
                  value={
                    notesMap[part] || ""
                  }
                  onChange={(e) =>
                    updateNotes(
                      part,
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    marginTop: 14,
                    minHeight: 90,
                    borderRadius: 14,
                    border:
                      "1px solid rgba(255,255,255,0.1)",
                    background:
                      "rgba(255,255,255,0.04)",
                    color: "#fff",
                    padding: 14,
                    resize: "vertical",
                  }}
                />
              </div>
            ))}

            {selectedParts.length > 0 && (
              <button
                onClick={submitSymptoms}
                style={{
                  width: "100%",
                  height: 52,
                  border: "none",
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg,#10b981,#059669)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Submit Symptoms
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}