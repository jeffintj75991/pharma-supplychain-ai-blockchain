import React, { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, ClipboardList, Loader2, Search, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";

type BatchRecord = Record<string, unknown>;
type BatchDetailsResponse = {
  batch?: BatchRecord;
  transport?: unknown[] | Record<string, unknown>;
  predictions?: unknown[] | Record<string, unknown>;
  audits?: unknown[] | Record<string, unknown>;
};

const BatchDetails: React.FC = () => {
  const [batchId, setBatchId] = useState("");
  const [result, setResult] = useState<BatchDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = batchId.trim();
    if (!query) {
      toast.error("Enter a batch ID to search.");
      return;
    }

    setLoading(true);
    setResult(null);
    const params = new URLSearchParams({
      channelName: "pharmachannel",
      chaincodeName: "pharma-cc",
      methodName: "GetBatchDetails",
      value: query,
    });

    try {
      const response = await fetch(
        `http://localhost:9000/pharma-app/v1.0/HLF/getTransactions?${params.toString()}`
      );
      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Batch details could not be loaded.");
      }
      const data = (await response.json()) as BatchDetailsResponse;
      setResult(data);
      toast.success("Batch record loaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reach the API.");
    } finally {
      setLoading(false);
    }
  };

  const batch = result?.batch ?? (result && !("batch" in result) ? result as BatchRecord : null);
  const status = typeof batch?.status === "string" ? batch.status : "Status unavailable";

  return (
    <div className="page-content form-page lookup-page">
      {loading && <LoadingOverlay message="Looking up batch…" />}
      <div className="page-backline">
        <NavLink to="/" className="back-link"><ArrowLeft size={15} /> Overview</NavLink>
        <span className="page-step">BATCH REVIEW <span>·</span> 03 OF 03</span>
      </div>
      <section className="page-intro form-intro">
        <div>
          <p className="eyebrow">LEDGER LOOKUP</p>
          <h1>Review a batch</h1>
          <p className="intro-copy">Search by batch ID to see its record and available activity.</p>
        </div>
        <span className="intro-icon tone-violet"><Search size={23} /></span>
      </section>

      <section className="lookup-card">
        <form className="lookup-form" onSubmit={handleFetch}>
          <label htmlFor="lookup-batch-id">Batch ID</label>
          <div className="lookup-controls">
            <div className="input-wrap lookup-input-wrap">
              <span className="input-leading"><Search size={17} /></span>
              <input
                id="lookup-batch-id"
                className="text-input has-leading"
                type="text"
                placeholder="Enter a batch ID"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? <Loader2 className="spin" size={17} /> : <Search size={17} />}
              Search batch
            </button>
          </div>
          <span className="field-hint">The ID must match the batch registered on the ledger.</span>
        </form>
      </section>

      {!result && !loading && (
        <section className="empty-state">
          <span className="empty-state-icon"><ClipboardList size={24} /></span>
          <h2>Your batch record will appear here</h2>
          <p>Search for a batch to review its product details, handling activity, and available analysis.</p>
        </section>
      )}

      {result && batch && (
        <div className="result-content">
          <section className="batch-summary-card">
            <div className="batch-summary-main">
              <span className="batch-summary-icon"><ClipboardList size={20} /></span>
              <div>
                <span className="summary-label">BATCH RECORD</span>
                <h2>{String(batch.drugName || "Unnamed product")}</h2>
                <span className="batch-id-text">{String(batch.batchId || batchId.trim())}</span>
              </div>
            </div>
            <span className={`status-pill ${statusClass(status)}`}>
              <span className="status-dot" />{status}
            </span>
          </section>

          <section className="details-card">
            <div className="details-card-heading">
              <div><h2>Product details</h2><p>Information registered for this batch.</p></div>
              <span className="details-heading-icon"><ShieldCheck size={18} /></span>
            </div>
            <dl className="detail-grid">
              {Object.entries(batch).map(([key, value]) => {
                if (key === "status" || key === "batchId" || key === "drugName") return null;
                const expired = key.toLowerCase().includes("exp") && isExpired(value);
                return (
                  <div className={`detail-item${expired ? " detail-item-alert" : ""}`} key={key}>
                    <dt>{humanize(key)}{expired && <span className="expiry-flag">Expired</span>}</dt>
                    <dd>{formatValue(value)}</dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section className="activity-section">
            <div className="details-card-heading activity-heading">
              <div><h2>Batch activity</h2><p>Transport observations and analysis associated with this batch.</p></div>
              <span className="activity-count">{activityCount(result)} records</span>
            </div>
            <div className="activity-grid">
              <ActivityPanel title="Transport" items={result.transport} tone="teal" />
              <ActivityPanel title="Predictions" items={result.predictions} tone="blue" />
              <ActivityPanel title="Audits" items={result.audits} tone="violet" />
            </div>
          </section>
        </div>
      )}

      {result && !batch && (
        <section className="empty-state empty-state-error">
          <span className="empty-state-icon"><Search size={23} /></span>
          <h2>No batch details returned</h2>
          <p>Check the batch ID and try the lookup again.</p>
          <button className="text-action" type="button" onClick={() => setResult(null)}>
            Search again <ArrowRight size={15} />
          </button>
        </section>
      )}
    </div>
  );
};

function ActivityPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: unknown[] | Record<string, unknown> | undefined;
  tone: "teal" | "blue" | "violet";
}) {
  const records = Array.isArray(items) ? items : [];
  const error =
    items && !Array.isArray(items) && typeof items.error === "string"
      ? items.error
      : null;
  return (
    <div className="activity-panel">
      <div className="activity-panel-heading">
        <span className={`activity-marker tone-${tone}`} />
        <h3>{title}</h3>
        <span className="activity-number">{records.length}</span>
      </div>
      {records.length ? (
        <div className="activity-list">
          {records.map((record, index) => (
            <pre className="activity-record" key={`${title}-${index}`}>{formatValue(record)}</pre>
          ))}
        </div>
      ) : error ? (
        <p className="activity-empty activity-error">{error}</p>
      ) : (
        <p className="activity-empty">No {title.toLowerCase()} records are available.</p>
      )}
    </div>
  );
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("reject") || normalized.includes("not approved")) return "status-warning";
  if (normalized.includes("approv")) return "status-success";
  return "status-neutral";
}

function humanize(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

function isExpired(value: unknown) {
  if (typeof value !== "string") return false;
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T23:59:59` : value;
  const parsed = Date.parse(dateValue);
  return Number.isFinite(parsed) && parsed < Date.now();
}

function activityCount(result: BatchDetailsResponse) {
  return [result.transport, result.predictions, result.audits].reduce(
    (count, records) => count + (Array.isArray(records) ? records.length : 0),
    0
  );
}

export default BatchDetails;
