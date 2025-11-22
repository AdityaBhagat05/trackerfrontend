import { useState } from "react";
import "./data.css";
import API_URL from './config';
import { authenticatedFetch } from "./api";


export default function EnterData() {
const [formData, setFormData] = useState({
projectNumber: "",
projectName: "",
outletCode: "",
location: "",
startDate: "",
endDate: "",
manager: "",
status: "",
projectType: "",
businessVertical: "",
region: "",
budgetedINR: "",
lastUpdate: "",
projectStage: "",
riskLevel: "",
remarks: "",
});

const [statusMessage, setStatusMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};



const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setStatusMessage("");

  try {
    const response = await authenticatedFetch("/submit-form", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.status === "success") {
      setStatusMessage("Data added successfully!");
      setFormData({
        projectNumber: "",
        projectName: "",
        outletCode: "",
        location: "",
        startDate: "",
        endDate: "",
        manager: "",
        status: "",
        projectType: "",
        businessVertical: "",
        region: "",
        budgetedINR: "",
        lastUpdate: "",
        projectStage: "",
        riskLevel: "",
        remarks: "",
      });
    } else {
      setStatusMessage(" Error: " + (result.detail || result.message || "Unknown error"));
    }
  } catch (error) {
    console.error(error);
    setStatusMessage("Could not connect to backend.");
  } finally {
    setLoading(false);
  }
};

return ( <div className="data-wrapper"> <form className="data-box" onSubmit={handleSubmit}> <h2 className="data-title">Enter Project Details</h2>
    {Object.entries({
      projectNumber: "Project Number",
      projectName: "Project Name",
      outletCode: "Outlet Code",
      location: "Location",
      startDate: "Start Date",
      endDate: "End Date",
      manager: "Manager",
      status: "Status",
      projectType: "Project Type",
      businessVertical: "Business Vertical",
      region: "Region",
      budgetedINR: "Budgeted INR",
      lastUpdate: "Last Update",
      projectStage: "Project Stage",
      riskLevel: "Risk Level",
      remarks: "Remarks",
    }).map(([key, label]) => (
      <div key={key}>
        <label>{label}</label>
        <input
          type={
            key.includes("Date") || key === "lastUpdate"
              ? "date"
              : key === "budgetedINR"
              ? "number"
              : "text"
          }
          name={key}
          value={formData[key]}
          onChange={handleChange}
          placeholder={`Enter ${label}`}
          required={["projectNumber", "projectName"].includes(key)}
        />
      </div>
    ))}

    <button type="submit" disabled={loading}>
      {loading ? "Submitting..." : "Submit"}
    </button>

    {statusMessage && (
      <p style={{ color: statusMessage.startsWith("✅") ? "green" : "red" }}>
        {statusMessage}
      </p>
    )}
    <p> </p>
      <button type="button" onClick={() => window.location.reload()}>
        Return to Login
      </button>
  </form>
</div>

);
}
