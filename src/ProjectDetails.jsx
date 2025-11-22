import API_URL from './config';
import React, { useEffect, useState } from "react";
import { authenticatedFetch } from "./api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function ProjectDetails({ project, onClose }) {
  const [details, setDetails] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (project) {
      fetchDetails(project.projectNumber);
      fetchHistory(project.projectNumber);
    }
  }, [project]);

  const fetchDetails = async (code) => {
  const res = await authenticatedFetch(`/get-data?project_code=${code}`);
  const json = await res.json();
  if (json.status === "success") setDetails(json.data);
};


  const fetchHistory = async (code) => {
  const res = await authenticatedFetch(`/get-project-history?project_code=${code}`);
  const json = await res.json();
  if (json.status === "success") setHistory(json.milestones || []);
};


  const chartData = (details?.["Milestone Chart"] || [])
  .map((d) => {
    const plannedTs = d.planned ? Number(new Date(d.planned).getTime()) : null;
    const actualTs = d.actual ? Number(new Date(d.actual).getTime()) : null;
    return {
      milestone: d.milestone || "",
      plannedValue: plannedTs !== null && Number.isFinite(plannedTs) ? plannedTs : null,
      actualValue: actualTs !== null && Number.isFinite(actualTs) ? actualTs : null,
    };
  })
  .filter((row) => row.plannedValue !== null || row.actualValue !== null); // need at least one numeric value


  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{project.projectNumber} - {project.projectName}</h2>
        <button onClick={onClose}>Close</button>
      </div>

      {details && (
        <>
          <h3 style={{ marginTop: 10 }}>Milestone Progress (Planned vs Actual)</h3>
          {chartData.length > 0 ? (
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
                  <XAxis dataKey="milestone" tick={{ fill: "#ffffff", fontSize: 11 }} />
                  <YAxis
  type="number"
  domain={["dataMin", "dataMax"]}
  tickFormatter={(t) => (t ? new Date(Number(t)).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "")}
  tick={{ fill: "#ffffff", fontSize: 11 }}
/>
<Tooltip
  formatter={(value) =>
    value
      ? new Date(Number(value)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "-"
  }
  contentStyle={{
    background: "rgba(21,100,191,0.9)",
    color: "white",
    border: "1px solid #fff",
  }}
/>
<Line type="monotone" dataKey="plannedValue" name="Planned" stroke="#ffcc00" dot={{ r: 4 }} connectNulls={false} />
<Line type="monotone" dataKey="actualValue" name="Actual" stroke="#00ff88" dot={{ r: 4 }} connectNulls={false} />

                  {/* <YAxis
                    tickFormatter={(t) =>
                      new Date(t).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                    }
                    tick={{ fill: "#ffffff", fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(t) =>
                      new Date(t).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    }
                    contentStyle={{
                      background: "rgba(21,100,191,0.9)",
                      color: "white",
                      border: "1px solid #fff",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="plannedValue" name="Planned" stroke="#ffcc00" dot />
                  <Line type="monotone" dataKey="actualValue" name="Actual" stroke="#00ff88" dot /> */}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>No milestone chart data.</p>
          )}

          <h3 style={{ marginTop: 20 }}>Full Milestone History</h3>
          <div style={{ overflowX: "auto", maxHeight: "50vh" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "#fff" }}>
              <thead style={{ background: "rgba(0,0,0,0.3)" }}>
                <tr>
                  {[
                    "Milestone_ID", "Project_Code", "Milestone", "Planned_Date",
                    "Actual_Date", "Status", "Responsible", "Delay_Days",
                    "Cost_Impact_Lakh", "Cost_Per_Day_Lakh", "Revenue_Delay_Days",
                    "Dynamic_Planned_Completion_Date", "Comments"
                  ].map((head) => (
                    <th key={head} style={{ padding: 8, borderBottom: "1px solid #eee", fontSize: 13 }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((row) => (
                    <tr key={row.Milestone_ID}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                          {val ?? "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" style={{ padding: 12, textAlign: "center" }}>
                      No milestones available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

