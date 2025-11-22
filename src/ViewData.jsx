import API_URL from './config';
import { useState, useEffect } from "react";
import "./data.css";
import { authenticatedFetch } from "./api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function ViewData() {
  const [projectCode, setProjectCode] = useState("");
  const [data, setData] = useState(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTotalProjects();
  }, []);

  const fetchTotalProjects = async () => {
    try {
      const response = await authenticatedFetch("/get-total-projects");
      const result = await response.json();
      if (result.status === "success") {
        setTotalProjects(result.total_projects);
      }
    } catch (err) {
      console.error("Failed to fetch total projects", err);
    }
  };

  const fetchData = async () => {
    if (!projectCode.trim()) {
      setError("Please enter a project code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(`/get-data?project_code=${projectCode}`);
      const result = await response.json();

      if (result.status === "success") {
        const formatted = {
          projectCode: result.data["Project Code"] || "",
          projectName: result.data["Project Name"] || "",
          milestonesTotal: result.data["Milestones Total"] || "",
          completed: result.data["Completed"] || "",
          delayed: result.data["Delayed"] || "",
          pending: result.data["Pending"] || "",
          totalCostImpact: result.data["Total Cost Impact (₹ Lakh)"] || "",
          revenueDelay: result.data["Revenue Delay (Days)"] || "",
          milestonesCompleted: result.data["% Milestones Complete"] || "",
          chartData: result.data["Milestone Chart"] || [],
        };
        setData(formatted);
      } else {
        setError(result.message || "Project not found.");
        setData(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data from server.");
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="data-wrapper">
        <div className="data-box">
          <h2 className="data-title">Search Project</h2>
          <p>Total Projects in Database: <strong>{totalProjects}</strong></p>
          <label>Enter Project Code</label>
          <input
            type="text"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value)}
            placeholder="e.g., 101"
          />
          <button type="button" onClick={fetchData} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
          <p> </p>
          <button type="button" onClick={() => window.location.reload()}>
            Return to Login
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="data-wrapper">
      <div className="data-box">
        <h2 className="data-title">Project Details</h2>

        <label>Project Code</label>
        <input value={data.projectCode} disabled />

        <label>Project Name</label>
        <input value={data.projectName} disabled />

        <label>Milestones Total</label>
        <input value={data.milestonesTotal} disabled />

        <label>Completed</label>
        <input value={data.completed} disabled />

        <label>Delayed</label>
        <input value={data.delayed} disabled />

        <label>Pending</label>
        <input value={data.pending} disabled />

        <label>Total Cost Impact (₹ Lakh)</label>
        <input value={data.totalCostImpact} disabled />

        <label>Revenue Delay (Days)</label>
        <input value={data.revenueDelay} disabled />

        <label>% Milestones Complete</label>
        <input value={data.milestonesCompleted} disabled />

        <h3 style={{ marginTop: "20px" }}>Milestone Progress (Planned vs Actual)</h3>
        {/* {data.chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="milestone" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="planned" stroke="#8884d8" name="Planned Date" />
              <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="Actual Date" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No milestone date data available.</p>
        )} */}
        {data.chartData.length > 0 ? (
  <div className="chart-container">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data.chartData.map((d) => ({
          ...d,
          plannedValue: new Date(d.planned).getTime(),
          actualValue: new Date(d.actual).getTime(),
        }))}
        margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="milestone" tick={{ fill: "#212020ff", fontSize: 12 }}/>
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "#212020ff", fontSize: 12 }}
          tickFormatter={(timestamp) =>
            new Date(timestamp).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })
          }
          label={{
            value: "Date",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          labelStyle={{ fontWeight: "bold" }}
          formatter={(value) =>
            new Date(value).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          }
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="plannedValue"
          stroke="#8e7cc3"
          name="Planned Date"
          dot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="actualValue"
          stroke="#82ca9d"
          name="Actual Date"
          dot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
) : (
  <p>No milestone date data available.</p>
)}

        <p> </p>
        <button type="button" onClick={() => setData(null)}>
          Search Another Project
        </button>
        <p> </p>
        <button type="button" onClick={() => window.location.reload()}>
          Return to Login
        </button>
      </div>
    </div>
  );
}
