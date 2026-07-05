import React, { useRef, useState } from "react";
import { FaPlus, FaUpload, FaTimes } from "react-icons/fa";

export default function ApplicantPanel({
  applicant,
  onAdd,
  onUpload,
  onUploadComplete,
  onDeleteDoc,
}) {
  if (!applicant) return null;

  const hasDocs =
    Array.isArray(applicant.documents) && applicant.documents.length > 0;
  const inputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleChoose = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (!selectedFiles.length) return;
    if (typeof onUpload === "function") onUpload(selectedFiles);
    if (inputRef.current) inputRef.current.value = "";
    setSelectedFiles([]);
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  return (
    <div className="applicant-panel">
      <hr className="tabs-divider" />

      {!hasDocs ? (
        /* ── No documents yet ── */
        <div className="no-docs-state" id="no-docs-state">
          <p className="no-docs-text">No documents available</p>
          <button
            className="add-doc-btn"
            onClick={onAdd}
            id="add-doc-btn"
          >
            <FaPlus /> Add
          </button>
        </div>
      ) : (
        /* ── Documents exist ── */
        <div className="panel-grid">
          {/* Left sidebar — doc pills + Add button */}
          <div className="left-col" id="left-col">
            {applicant.documents.map((doc) => (
              <div
                key={doc.id}
                className="doc-pill"
                title={typeof doc === "string" ? doc : doc.name}
              >
                {typeof doc === "string" ? doc : doc.name}
              </div>
            ))}
            <button
              className="add-doc-left"
              onClick={onAdd}
              id="add-doc-left-btn"
            >
              <FaPlus /> Add
            </button>
          </div>

          {/* Right — uploader panel */}
          <div className="upload-card-right">
            <div className="upload-card" id="upload-card">
              {/* Hidden file input */}
              <input
                ref={inputRef}
                type="file"
                style={{ display: "none" }}
                multiple
                onChange={handleFileChange}
                id="file-input"
              />

              {/* Action buttons row */}
              <div className="uploader-actions" id="uploader-actions">
                <button
                  className="btn-choose"
                  onClick={handleChoose}
                  id="choose-btn"
                >
                  <FaPlus /> Choose
                </button>
                <button
                  className="btn-upload"
                  onClick={handleUpload}
                  id="upload-btn"
                  disabled={selectedFiles.length === 0}
                >
                  <FaUpload /> Upload
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancel}
                  id="cancel-btn"
                >
                  <FaTimes /> Cancel
                </button>
              </div>

              <hr className="card-divider" />

              {/* File list / drag-drop area */}
              {applicant.documents.length > 0 ? (
                <div className="file-list" id="file-list">
                  {applicant.documents.map((doc) => {
                    const docName = typeof doc === "string" ? doc : doc.name;
                    const docSize =
                      doc && typeof doc === "object" && doc.size
                        ? `${(doc.size / 1024).toFixed(3)} KB`
                        : null;
                    const status =
                      doc && typeof doc === "object"
                        ? doc.status || "Completed"
                        : null;

                    return (
                      <div
                        key={doc.id || docName}
                        className="file-item"
                        id={`file-item-${doc.id}`}
                      >
                        <div className="file-info">
                          <span className="file-name">{docName}</span>
                          <div className="file-meta">
                            {docSize && (
                              <span className="file-size">{docSize}</span>
                            )}
                            {status && (
                              <span
                                className={`status-badge status-${status.toLowerCase()}`}
                                id={`status-${doc.id}`}
                              >
                                {status}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="file-actions">
                          {status === "Pending" && (
                            <button
                              className="btn-complete"
                              onClick={() =>
                                onUploadComplete && onUploadComplete(doc.id)
                              }
                              title="Mark as completed"
                              id={`complete-btn-${doc.id}`}
                            >
                              <FaUpload />
                            </button>
                          )}
                          <button
                            className="btn-delete"
                            onClick={() =>
                              onDeleteDoc && onDeleteDoc(doc.id)
                            }
                            title="Remove file"
                            id={`delete-btn-${doc.id}`}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={`drop-area${isDragOver ? " drag-over" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  id="drop-area"
                >
                  <p className="drop-text">Drag and Drop files here.</p>
                </div>
              )}

              {/* Selected files preview (before uploading) */}
              {selectedFiles.length > 0 && (
                <div className="selected-preview" id="selected-preview">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="selected-file-item">
                      <span>{f.name}</span>
                      <span className="file-size-sm">
                        {(f.size / 1024).toFixed(3)} KB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drag and drop area shown when no docs but panel is open */}
      {!hasDocs && (
        <div
          className={`drop-area standalone${isDragOver ? " drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          id="drop-area-standalone"
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}
