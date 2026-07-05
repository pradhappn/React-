import React from "react";

export default function DocumentList({ documents }) {
  if (!Array.isArray(documents) || documents.length === 0) return null;

  const renderName = (doc) => (typeof doc === "string" ? doc : doc.name);

  return (
    <div className="document-list">
      <h3>Uploaded Documents</h3>
      <ul>
        {documents.map((doc, i) => (
          <li key={i}>{renderName(doc)}</li>
        ))}
      </ul>
    </div>
  );
}
