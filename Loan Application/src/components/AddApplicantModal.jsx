import React, { useState, useEffect } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

export default function AddApplicantModal({ visible, onClose, onSave }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (visible) setName("");
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      id="add-applicant-backdrop"
    >
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        id="add-applicant-modal"
      >
        <div className="modal-header">
          <h2>Add Applicant</h2>
          <button
            className="modal-close"
            onClick={onClose}
            id="add-applicant-close"
          >
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <label htmlFor="applicant-name-input">Name</label>
          <input
            id="applicant-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSave(name)}
            placeholder="Enter applicant name"
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button
            className="modal-save"
            onClick={() => onSave(name)}
            id="add-applicant-save"
          >
            <FaCheck /> Save
          </button>
          <button
            className="modal-cancel"
            onClick={onClose}
            id="add-applicant-cancel"
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
