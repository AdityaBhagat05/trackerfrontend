

import { useState } from "react";
import "./data.css";
import { authenticatedFetch } from "./api";

export default function UpdateData() {
  const [formData, setFormData] = useState({
    projectCode: "",
    projectName: "",
    milestone: "",
    plannedDate: "",
    actualDate: "",
    status: "",
    responsible: "",
    costDay: "",
    revenueDelay: "",
    comments: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await authenticatedFetch("/update-form", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === "success") {
        setStatus("✅ " + result.message);
        setFormData({
          projectCode: "",
          projectName: "",
          milestone: "",
          plannedDate: "",
          actualDate: "",
          status: "",
          responsible: "",
          costDay: "",
          revenueDelay: "",
          comments: "",
        });
      } else {
        const errorMsg = result.detail || result.message || "Unknown error";
        setStatus("❌ " + errorMsg);
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="data-wrapper">
      <form className="data-box" onSubmit={handleSubmit}>
        <h2 className="data-title">Update Data</h2>

        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>{key.replace(/([A-Z])/g, " $1").trim()}</label>
            <input
              type={key.toLowerCase().includes("date") ? "date" : "text"}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              placeholder={`Enter ${key.replace(/([A-Z])/g, " $1").trim()}`}
            />
          </div>
        ))}

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {status && (
          <p style={{ color: status.startsWith("✅") ? "green" : "red" }}>
            {status}
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