import API_URL from './config';
import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { authenticatedFetch } from "./api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import ProjectDetails from "./ProjectDetails";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalProjects: 0,
    completedProjects: 0,
    pendingProjects: 0,
    activeProjects: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/get-all-projects");
      const json = await res.json();
      if (json.status === "success") {
        setProjects(json.projects || []);
        setSummary(json.summary || summary);
      } else {
        console.error("Failed to fetch projects", json);
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(p.projectNumber).includes(term) ||
      (p.projectName || "").toLowerCase().includes(term) ||
      (p.manager || "").toLowerCase().includes(term)
    );
  });

  // Pie chart for project status distribution
  const pieData = [
    { name: "Completed", value: summary.completedProjects },
    { name: "Active", value: summary.activeProjects },
    { name: "Planned", value: summary.pendingProjects },
  ];
  const pieColors = ["#00c49f", "#0088fe", "#ffbb28"];

  // Date line graph data (project introduced)
  // const dateGraph = projects
  //   .filter((p) => p.startDate)
  //   .map((p) => ({
  //     name: p.projectName || `#${p.projectNumber}`,
  //     startDate: new Date(p.startDate).getTime(),
  //   }));
  // Date line graph data (project introduced)
const dateGraph = projects
  .filter((p) => p.startDate) // keep only records with startDate
  .map((p) => {
    const ts = Number(new Date(p.startDate).getTime());
    return {
      name: p.projectName || `#${p.projectNumber}`,
      startDate: Number.isFinite(ts) ? ts : null,
    };
  })
  .filter((x) => x.startDate !== null) // drop invalid timestamp rows
  .sort((a, b) => a.startDate - b.startDate); // optional: show chronological order

  return (
    <div className="dashboard-wrapper">
      <h1 className="dashboard-title">Projects Dashboard</h1>

      {/* Summary cards */}
      <div className="cards-row">
        <div className="card">
          <div className="card-value">{summary.totalProjects}</div>
          <div className="card-label">Total Projects</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.completedProjects}</div>
          <div className="card-label">Completed Projects</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.pendingProjects}</div>
          <div className="card-label">Planned / Pending Projects</div>
        </div>
        <div className="card">
          <div className="card-value">{summary.activeProjects}</div>
          <div className="card-label">Active Projects</div>
        </div>
      </div>

      {/* Charts section */}
      <div className="charts-row">
        {/* Pie Chart */}
        <div className="chart-box">
          <h3>Project Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(21,100,191,0.9)",
                  color: "white",
                  border: "1px solid #fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Project Introduction Dates */}
        <div className="chart-box">
          <h3>Project Start Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={dateGraph}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#ffffff", fontSize: 11 }}
                interval={0}
                angle={-35}
                textAnchor="end"
              />
              <YAxis
  type="number"
  domain={["dataMin", "dataMax"]}
  tickFormatter={(t) =>
    t ? new Date(Number(t)).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : ""
  }
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
<Line
  type="monotone"
  dataKey="startDate"
  stroke="#00e6ff"
  strokeWidth={2}
  dot={{ r: 3 }}
  connectNulls={false}
/>

              {/* <YAxis
                tickFormatter={(t) =>
                  new Date(t).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })
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
              <Line type="monotone" dataKey="startDate" stroke="#00e6ff" strokeWidth={2} dot /> */}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project list and details */}
      <div className="list-and-details">
        <div className="left-list">
          <div className="list-header">
            <h3>Projects</h3>
            <div>
              <input
                placeholder="Search by code, name or manager"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={fetchAllProjects} disabled={loading}>
                Refresh
              </button>
            </div>
          </div>

          <div className="projects-table">
            <div className="projects-row projects-row-head">
              <div>Code</div>
              <div>Name</div>
              <div>Status</div>
            </div>

            {filteredProjects.map((p) => (
              <div
                key={p.projectNumber}
                className={`projects-row ${
                  selectedProject && selectedProject.projectNumber === p.projectNumber ? "selected" : ""
                }`}
                onClick={() => setSelectedProject(p)}
              >
                <div>{p.projectNumber}</div>
                <div className="project-name-cell" title={p.projectName}>
                  {p.projectName}
                </div>
                <div>{p.status || "-"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-details">
          {selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
            />
          ) : (
            <div style={{ padding: 20 }}>
              <h3>Select a project to view details & milestone history</h3>
            </div>
          )}
        </div>
      </div>
      <p>
      </p>
      <button 
        type="button" 
        onClick={() => window.location.reload()}
        style={{ 
          display: 'inline-block', 
          width: '300px', 
          marginTop: '20px', 
          padding: '10px 20px' 
        }}
      >
        Return to Login
      </button>
    </div>
  );
}

