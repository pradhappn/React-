import "../styles/Dashboard.css";
import { useState } from "react";
import { FaPlus, FaArrowLeft, FaArrowRight, FaTimes, FaTrash, FaCheck } from "react-icons/fa";
import AddApplicantModal from "../components/AddApplicantModal";
import ApplicantPanel from "../components/ApplicantPanel";

export default function Dashboard() {
  const [applicants, setApplicants] = useState([]);
  const [active, setActive] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const createApplicant = (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    setApplicants((current) => {
      const exists = current.find((a) => a.name === trimmed);
      if (exists) {
        setActive(exists.id);
        setShowAddModal(false);
        return current;
      }
      const newApplicant = { id: Date.now(), name: trimmed, documents: [] };
      setActive(newApplicant.id);
      setShowAddModal(false);
      return [...current, newApplicant];
    });
  };

  const removeApplicant = (id) => {
    setApplicants((s) => {
      const remaining = s.filter((a) => a.id !== id);
      if (active === id) {
        setActive(remaining.length ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const activeApplicant = applicants.find((item) => item.id === active) || null;

  const openDocModal = () => {
    setDocName("");
    setShowDocModal(true);
  };
  const closeDocModal = () => setShowDocModal(false);

  const saveDoc = () => {
    const name = docName.trim();
    if (!name || !active) return;
    // New doc added via modal — status "Pending" until uploaded
    const newDoc = { id: Date.now(), name, size: null, status: "Pending" };
    setApplicants((list) =>
      list.map((a) =>
        a.id === active ? { ...a, documents: [...a.documents, newDoc] } : a
      )
    );
    closeDocModal();
  };

  const handleUploadFiles = (files) => {
    if (!files || files.length === 0 || !active) return;
    const newDocs = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: "Pending",
    }));
    setApplicants((list) =>
      list.map((a) =>
        a.id === active ? { ...a, documents: [...a.documents, ...newDocs] } : a
      )
    );
  };

  const handleUploadComplete = (docId) => {
    if (!active) return;
    setApplicants((list) =>
      list.map((a) =>
        a.id === active
          ? {
              ...a,
              documents: a.documents.map((d) =>
                d.id === docId ? { ...d, status: "Completed" } : d
              ),
            }
          : a
      )
    );
  };

  const handleDeleteDoc = (docId) => {
    if (!active) return;
    setApplicants((list) =>
      list.map((a) =>
        a.id === active
          ? { ...a, documents: a.documents.filter((d) => d.id !== docId) }
          : a
      )
    );
  };

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        {/* Header */}
        <div className="top-section">
          <h1>Document Upload</h1>
          <button
            className="add-btn"
            id="add-applicant-btn"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus /> Add Applicant
          </button>
        </div>

        <hr className="section-divider" />

        {/* Tabs */}
        {applicants.length > 0 && (
          <div className="tabs" id="applicant-tabs">
            {applicants.map((item) => (
              <div
                key={item.id}
                className={`tab-holder${item.id === active ? " active" : ""}`}
              >
                <button
                  className={`tab${item.id === active ? " active" : ""}`}
                  onClick={() => setActive(item.id)}
                  id={`tab-${item.id}`}
                >
                  {item.name}
                </button>
                <button
                  className="tab-trash"
                  onClick={() => removeApplicant(item.id)}
                  aria-label={`Remove ${item.name}`}
                  id={`remove-tab-${item.id}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Active Applicant Panel */}
        {activeApplicant && (
          <ApplicantPanel
            applicant={activeApplicant}
            onAdd={openDocModal}
            onUpload={handleUploadFiles}
            onUploadComplete={handleUploadComplete}
            onDeleteDoc={handleDeleteDoc}
          />
        )}

        {/* Bottom Navigation */}
        <div className="bottom-buttons">
          <button className="back" id="back-btn">
            <FaArrowLeft /> Back
          </button>
          <button className="next" id="next-btn">
            Next <FaArrowRight />
          </button>
        </div>
      </div>

      {/* Add Applicant Modal */}
      <AddApplicantModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={createApplicant}
      />

      {/* Add Document Modal */}
      {showDocModal && (
        <div
          className="modal-backdrop"
          onClick={closeDocModal}
          id="doc-modal-backdrop"
        >
          <div
            className="modal-panel"
            onClick={(e) => e.stopPropagation()}
            id="doc-modal"
          >
            <div className="modal-header">
              <h2>Add</h2>
              <button
                className="modal-close"
                onClick={closeDocModal}
                id="doc-modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <label htmlFor="doc-name-input">Document Name</label>
              <input
                id="doc-name-input"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveDoc()}
                placeholder=""
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button
                className="modal-save"
                onClick={saveDoc}
                id="doc-modal-save"
              >
                <FaCheck /> Save
              </button>
              <button
                className="modal-cancel"
                onClick={closeDocModal}
                id="doc-modal-cancel"
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
