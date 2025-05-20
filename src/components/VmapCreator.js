import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VmapCreator.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const timeOffsetOptions = [
  { label: "Start (Pre-roll)", value: "start" },
  { label: "Mid-roll (1 min)", value: "00:01:00.000" },
  { label: "End (Post-roll)", value: "end" },
];

const VmapCreator = () => {
  const [vastFiles, setVastFiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [vmapLinks, setVmapLinks] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/vast-schedule/all`)
      .then((res) => setVastFiles(Array.isArray(res.data) ? res.data : []));
  }, []);

  const handleSelect = (ad, idx, field, value) => {
    setSelected((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleAdd = (ad) => {
    setSelected((prev) => [
      ...prev,
      {
        adId: ad.adId || ad._id,
        vastLink: ad.vastLink,
        type: ad.type,
        timeOffset: ad.timeOffset,
      },
    ]);
  };

  const handleRemove = (idx) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
       const res = await axios.post(`${API_BASE_URL}/api/vmap-config/create`, {
        vastFiles: selected,
      });
      setSelected([]);
      setShowForm(false);

      // Add the new VMAP link to the top of the list
      const newVmap = {
        _id: res.data.vmapId,
        link: res.data.xmlLink,
        fileName: res.data.fileName,
      };
      setVmapLinks((prev) => [newVmap, ...prev]);

      // // Fetch all VMAP config links after creation
      // const linksRes = await axios.get(
      //   `${API_BASE_URL}/api/vmap-config/links/all`
      // );
      // // Do something with linksRes.data if needed
      // console.log("All VMAP links:", linksRes.data);
      // setVmapLinks(Array.isArray(linksRes.data) ? linksRes.data : []);
    } catch (e) {
      alert("Failed to create VMAP");
    }
    setLoading(false);
  };

  return (
    <div className="vmap-creator-container">
      <button
        className="vmap-creator-btn"
        onClick={() => setShowForm((f) => !f)}
      >
        {showForm ? "Hide VMAP Creator" : "Create VMAP"}
      </button>
      {showForm && (
        <div style={{ marginTop: 16 }}>
          <h4>Select VAST Files for VMAP</h4>
          <div>
            <strong>Available VASTs:</strong>
            <ul className="vmap-creator-list">
              {vastFiles.map((ad) => (
                <li key={ad._id || ad.adId}>
                  {ad.type} -{" "}
                  <a
                    href={ad.vastLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ad.vastLink}
                  </a>
                  <button
                    className="vmap-creator-btn vmap-creator-btn-add"
                    onClick={() => handleAdd(ad)}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 16 }}>
            <strong>Selected for VMAP:</strong>
            <table className="vmap-creator-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Time Offset</th>
                  <th>File</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((ad, idx) => (
                  <tr key={idx}>
                    <td>{ad.type}</td>
                    <td>{ad.timeOffset}</td>
                    <td>
                      <a
                        href={ad.vastLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ad.vastLink}
                      </a>
                    </td>
                    <td>
                      <button
                        className="vmap-creator-btn"
                        onClick={() => handleRemove(idx)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="vmap-creator-btn"
            style={{ marginTop: 16 }}
            onClick={handleSubmit}
            disabled={loading || selected.length === 0}
          >
            {loading ? "Creating..." : "Submit VMAP"}
          </button>
        </div>
      )}
      {/* VMAP AdTag Table */}
      {vmapLinks.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h4>VMAP AdTags</h4>
          <table className="vmap-creator-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>AdTag URL</th>
              </tr>
            </thead>
            <tbody>
              {vmapLinks.map((item, idx) => (
                <tr key={item._id || idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.link}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VmapCreator;
