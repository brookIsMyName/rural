import { useState } from "react";

import {
  FRONT_POINTS,
  BACK_POINTS,
} from "../data/bodyMapData";

export default function BodyMap({
  onSubmit,
  isMobile,
}) {
  const [view, setView] = useState("front");

  const [selected, setSelected] = useState([]);

  const [severity, setSeverity] = useState(5);

  const [duration, setDuration] =
    useState("");

  const [feeling, setFeeling] =
    useState("");

  const points =
    view === "front"
      ? FRONT_POINTS
      : BACK_POINTS;

  const togglePoint = (point) => {
    const exists = selected.find(
      (p) => p.id === point.id
    );

    if (exists) {
      setSelected((prev) =>
        prev.filter((p) => p.id !== point.id)
      );
    } else {
      setSelected((prev) => [
        ...prev,
        point,
      ]);
    }
  };

  const sendBodyReport = () => {
    if (selected.length === 0) return;

    const bodySummary = `
BODY MAP REPORT

Pain Areas:
${selected.map((p) => `- ${p.label}`).join("\n")}

Pain Severity:
${severity}/10

Duration:
${duration || "Not specified"}

Feeling:
${feeling || "Not specified"}

The user selected these body areas visually on the body map.
`;

    onSubmit(bodySummary);

    setSelected([]);
    setSeverity(5);
    setDuration("");
    setFeeling("");
  };

  return (
    <div
      style={{
        background:
          "rgba(255,255,255,0.04)",
        border:
          "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h3
            style={{
              color: "#fff",
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            Symptom Body Map
          </h3>

          <p
            style={{
              color:
                "rgba(255,255,255,0.5)",
              fontSize: 13,
            }}
          >
            Tap where you feel pain or
            discomfort
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={() =>
              setView("front")
            }
            style={{
              background:
                view === "front"
                  ? "#10b981"
                  : "rgba(255,255,255,0.08)",

              border: "none",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Front
          </button>

          <button
            onClick={() =>
              setView("back")
            }
            style={{
              background:
                view === "back"
                  ? "#10b981"
                  : "rgba(255,255,255,0.08)",

              border: "none",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Back
          </button>
        </div>
      </div>

      {/* BODY SVG */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg
          width={isMobile ? 180 : 240}
          height={isMobile ? 420 : 500}
          viewBox="0 0 200 450"
        >
          {/* BODY */}

          <circle
            cx="100"
            cy="40"
            r="25"
            fill="rgba(255,255,255,0.08)"
          />

          <rect
            x="70"
            y="70"
            width="60"
            height="130"
            rx="30"
            fill="rgba(255,255,255,0.08)"
          />

          <rect
            x="45"
            y="75"
            width="20"
            height="120"
            rx="10"
            fill="rgba(255,255,255,0.08)"
          />

          <rect
            x="135"
            y="75"
            width="20"
            height="120"
            rx="10"
            fill="rgba(255,255,255,0.08)"
          />

          <rect
            x="75"
            y="200"
            width="20"
            height="160"
            rx="10"
            fill="rgba(255,255,255,0.08)"
          />

          <rect
            x="105"
            y="200"
            width="20"
            height="160"
            rx="10"
            fill="rgba(255,255,255,0.08)"
          />

          {/* POINTS */}

          {points.map((point) => {
            const active =
              selected.find(
                (p) => p.id === point.id
              );

            return (
              <g key={point.id}>
                {active && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="18"
                    fill="rgba(239,68,68,0.2)"
                  />
                )}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={active ? 10 : 7}
                  fill={
                    active
                      ? "#ef4444"
                      : "#10b981"
                  }
                  stroke="#fff"
                  strokeWidth="2"
                  style={{
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                  onClick={() =>
                    togglePoint(point)
                  }
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* SELECTED */}

      {selected.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {selected.map((s) => (
            <div
              key={s.id}
              style={{
                background:
                  "rgba(239,68,68,0.12)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                color: "#fff",
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 12,
              }}
            >
              {s.label}
            </div>
          ))}
        </div>
      )}

      {/* DETAILS */}

      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        <div>
          <label
            style={{
              color: "#fff",
              fontSize: 13,
              display: "block",
              marginBottom: 8,
            }}
          >
            Pain Severity ({severity}/10)
          </label>

          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
            style={{
              width: "100%",
            }}
          />
        </div>

        <input
          value={duration}
          onChange={(e) =>
            setDuration(e.target.value)
          }
          placeholder="How long have you felt this?"
          style={{
            background:
              "rgba(255,255,255,0.05)",
            border:
              "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px",
            color: "#fff",
            outline: "none",
          }}
        />

        <textarea
          value={feeling}
          onChange={(e) =>
            setFeeling(e.target.value)
          }
          placeholder="Describe the feeling (burning, sharp pain, numbness, pressure...)"
          rows={3}
          style={{
            background:
              "rgba(255,255,255,0.05)",
            border:
              "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px",
            color: "#fff",
            outline: "none",
            resize: "vertical",
          }}
        />

        <button
          onClick={sendBodyReport}
          disabled={selected.length === 0}
          style={{
            background:
              selected.length === 0
                ? "rgba(16,185,129,0.2)"
                : "linear-gradient(135deg,#10b981,#059669)",

            border: "none",

            borderRadius: 14,

            padding: "14px",

            color: "#fff",

            fontWeight: 700,

            cursor:
              selected.length === 0
                ? "not-allowed"
                : "pointer",
          }}
        >
          Send Symptom Report
        </button>
      </div>
    </div>
  );
}