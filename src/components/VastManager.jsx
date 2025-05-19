import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VastManager.css"; // Import your CSS
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VastManager = () => {
  const [editId, setEditId] = useState(null);
  const [customOffset, setCustomOffset] = useState(""); // for custom timeOffset
  const [showCustomOffsetInput, setShowCustomOffsetInput] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    duration: "",
    adUrl: "",
    timeOffset: "",
  });
  // Fetch VAST entries
  const fetchVasts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/vast/`);
      setVastAds(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching VASTs:", err);
    }
  };

  const [vastAds, setVastAds] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("name", name);
    console.log("value", value);
    if (name === "timeOffset") {
      if (value === "custom") {
        const defaultOffset = ""; // or keep it empty if preferred
        setCustomOffset(defaultOffset);
        setFormData((prev) => ({ ...prev, timeOffset: defaultOffset }));
        setShowCustomOffsetInput(true);
      } else {
        setCustomOffset(""); // Clear customOffset
        setShowCustomOffsetInput(false);
        setFormData((prev) => ({ ...prev, timeOffset: value }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitVast = async () => {
    try {
      let response;
      if (editId) {
        response = await axios.put(
          `${API_BASE_URL}/api/vast/${editId}`,
          formData
        );
        await fetchVasts();
      } else {
        response = await axios.post(
          `${API_BASE_URL}/api/vast/create`,
          formData
        );
        await fetchVasts();
      }
      // Optionally, you can skip the optimistic update below since fetchVasts will refresh the list
      setEditId(null);
      setFormData({ type: "", duration: "", adUrl: "" });
    } catch (error) {
      console.error("Failed to create VAST:", error);
    }
  };

  // Edit entry
  const handleEdit = (vast) => {
    setFormData({
      type: vast.type,
      duration: vast.duration,
      adUrl: vast.adUrl,
      timeOffset: vast.timeOffset,
    });
    if (!["start", "end"].includes(vast.timeOffset)) {
      setCustomOffset(vast.timeOffset);
    }
    setEditId(vast._id);
  };
  // Delete entry
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/vast/${id}`);
      fetchVasts();
    } catch (err) {
      console.error("Error deleting VAST:", err);
    }
  };

  useEffect(() => {
    fetchVasts();
  }, []);
  // When customOffset changes, update formData.timeOffset if "Other" is selected
  useEffect(() => {
    if (formData.timeOffset === customOffset && customOffset !== "") {
      setFormData((prev) => ({ ...prev, timeOffset: customOffset }));
    }
    // eslint-disable-next-line
  }, [customOffset]);

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);
  return (
    <div className="vast-container">
      <h2>Create VAST Ad</h2>

      <div className="form-row">
        <select name="type" value={formData.type} onChange={handleChange}>
          <option value="">Select Type</option>
          <option value="pre-roll">Pre-roll</option>
          <option value="mid-roll">Mid-roll</option>
          <option value="post-roll">Post-roll</option>
        </select>

        <input
          type="text"
          name="duration"
          placeholder="Duration (e.g. 00:00:05)"
          value={formData.duration}
          onChange={handleChange}
        />

        <select
          name="timeOffset"
          value={
            ["start", "end"].includes(formData.timeOffset)
              ? formData.timeOffset
              : "custom"
          }
          onChange={handleChange}
        >
          <option value="">Time Offset</option>
          <option value="start">Start</option>
          <option value="end">End</option>
          <option value="custom">Other...</option>
        </select>
        {showCustomOffsetInput && (
          <input
            type="text"
            name="customOffset"
            value={customOffset}
            onChange={(e) => {
              setCustomOffset(e.target.value);
              setFormData((prev) => ({ ...prev, timeOffset: e.target.value }));
            }}
            placeholder="Enter custom offset"
          />
        )}
        <input
          type="text"
          name="adUrl"
          placeholder="Ad Video URL"
          value={formData.adUrl}
          onChange={handleChange}
        />

        <button onClick={handleSubmitVast}>Create VAST</button>
      </div>

      <h3>Created VAST Ads</h3>
      <table className="vast-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Type</th>
            <th>Duration</th>
            <th>Time Offset</th>
            <th>Video</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vastAds.map((ad, index) => (
            <tr key={ad._id}>
              <td>{index + 1}</td>
              <td>{ad.type}</td>
              <td>{ad.duration}</td>
              <td>{ad.timeOffset}</td>
              <td>
                <a href={ad.adUrl} target="_blank" rel="noopener noreferrer">
                  View Video
                </a>
              </td>
              <td className="actions-cell">
                <a
                  href={ad.xmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn edit"
                  style={{ textDecoration: "none", padding: "6px 14px" }}
                >
                  View XML
                </a>
                <button
                  className="action-btn edit"
                  onClick={() => handleEdit(ad)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(ad._id)}
                  type="button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VastManager;
