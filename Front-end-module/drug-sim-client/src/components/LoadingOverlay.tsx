import React from "react";
import { LoaderCircle } from "lucide-react";

const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Processing…" }) => (
  <div className="loading-overlay" role="status" aria-live="polite">
    <div className="loading-card">
      <LoaderCircle className="loading-spinner" size={31} aria-hidden="true" />
      <p>{message}</p>
    </div>
  </div>
);

export default LoadingOverlay;
