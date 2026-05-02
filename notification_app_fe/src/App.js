import React, { useEffect, useState } from "react";
import axios from "axios";

const AUTH = {
  email: "mr8476@srmist.edu.in",
  name: "Murry Shashank Raman",
  rollNo: "RA2311003010673",
  accessCode: "QkbpxH",
  clientID: "d799f98c-917b-42e9-8673-fe0e8353937d",
  clientSecret: "pzbrnXNtMcprbHwY"
};

// Priority weights — Placement is most important, Event is least
const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

// This is the core algorithm for Stage 1
// It scores each notification based on type weight + how recent it is
function getPriorityScore(notification) {
  const typeWeight = PRIORITY_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  // Normalize timestamp to a small number so recency helps but doesn't overpower type
  const recencyScore = timestamp / 1e12;
  return typeWeight + recencyScore;
}

function getTopN(notifications, n = 10) {
  return [...notifications]
    .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
    .slice(0, n);
}

function App() {
  const [notifications, setNotifications] = useState([]);
  const [priorityInbox, setPriorityInbox] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topN, setTopN] = useState(10);
  const [view, setView] = useState("all"); // "all" or "priority"

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setPriorityInbox(getTopN(notifications, topN));
    }
  }, [notifications, topN]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const authRes = await axios.post("/evaluation-service/auth", AUTH);
      const token = authRes.data.access_token;

      const res = await axios.get("/evaluation-service/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const typeColor = { Placement: "#4CAF50", Result: "#2196F3", Event: "#FF9800" };

  if (loading) return <div style={{ padding: "20px" }}>⏳ Loading notifications...</div>;
  if (error) return <div style={{ padding: "20px", color: "red" }}>❌ Error: {error}</div>;

  const displayList = view === "priority" ? priorityInbox : notifications;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>📢 Campus Notifications</h1>

      {/* Toggle buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setView("all")}
          style={{ marginRight: "10px", padding: "8px 16px",
            background: view === "all" ? "#333" : "#eee",
            color: view === "all" ? "white" : "black",
            border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setView("priority")}
          style={{ marginRight: "10px", padding: "8px 16px",
            background: view === "priority" ? "#333" : "#eee",
            color: view === "priority" ? "white" : "black",
            border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          ⭐ Priority Inbox
        </button>

        {/* Top N selector — only shows when in priority view */}
        {view === "priority" && (
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            style={{ padding: "8px", borderRadius: "4px" }}
          >
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
            <option value={20}>Top 20</option>
          </select>
        )}
      </div>

      {/* Notification cards */}
      {displayList.map((n) => (
        <div key={n.ID} style={{
          border: `2px solid ${typeColor[n.Type] || "#ccc"}`,
          margin: "10px 0", padding: "12px", borderRadius: "8px"
        }}>
          <span style={{
            background: typeColor[n.Type], color: "white",
            padding: "2px 8px", borderRadius: "4px", fontSize: "12px"
          }}>
            {n.Type}
          </span>
          <p style={{ margin: "8px 0" }}>{n.Message}</p>
          <small style={{ color: "#888" }}>{n.Timestamp}</small>
        </div>
      ))}
    </div>
  );
}

export default App;