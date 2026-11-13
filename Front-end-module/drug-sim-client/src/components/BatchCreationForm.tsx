import React, { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Loader2, PackagePlus, Pill, ShieldCheck, Truck } from "lucide-react";
import { NavLink } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";

const BatchCreationForm: React.FC = () => {
  const [batchId, setBatchId] = useState("");
  const [drugName, setDrugName] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expDate <= mfgDate) {
      toast.error("Expiry date must be later than the manufacture date.");
      return;
    }

    setLoading(true);
    const payload = {
      chaincodeName: "pharma-cc",
      methodName: "CreateBatch",
      channelName: "pharmachannel",
      isTransient: false,
      inputParameters: [batchId.trim(), drugName.trim(), mfgDate, expDate],
    };

    try {
      const response = await fetch(
        "http://localhost:9000/pharma-app/v1.0/HLF/submitTransactions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "The batch could not be created.");
      }

      await response.json();
      toast.success("Batch created and submitted to the ledger.");
      setBatchId("");
      setDrugName("");
      setMfgDate("");
      setExpDate("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reach the API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content form-page">
      {loading && <LoadingOverlay message="Creating batch…" />}
      <div className="page-backline">
        <NavLink to="/" className="back-link"><ArrowLeft size={15} /> Overview</NavLink>
        <span className="page-step">BATCH REGISTRATION <span>·</span> 01 OF 03</span>
      </div>
      <section className="page-intro form-intro">
        <div>
          <p className="eyebrow">NEW LEDGER RECORD</p>
          <h1>Create a batch</h1>
          <p className="intro-copy">Start a traceable record for a pharmaceutical product.</p>
        </div>
        <span className="intro-icon tone-blue"><PackagePlus size={23} /></span>
      </section>

      <div className="form-layout">
        <section className="form-card" aria-labelledby="batch-form-title">
          <div className="form-card-heading">
            <span className="form-section-number">01</span>
            <div>
              <h2 id="batch-form-title">Batch information</h2>
              <p>Enter the product details exactly as they appear on the packaging.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-fields">
            <div className="field-group">
              <label htmlFor="batch-id">Batch ID <span className="required-mark">*</span></label>
              <div className="input-wrap">
                <span className="input-leading"><PackagePlus size={17} /></span>
                <input
                  id="batch-id"
                  className="text-input has-leading"
                  type="text"
                  placeholder="e.g. BATCH-2026-001"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <span className="field-hint">Use a unique identifier that your team can recognize.</span>
            </div>

            <div className="field-group">
              <label htmlFor="drug-name">Product name <span className="required-mark">*</span></label>
              <div className="input-wrap">
                <span className="input-leading"><Pill size={17} /></span>
                <input
                  id="drug-name"
                  className="text-input has-leading"
                  type="text"
                  placeholder="e.g. Product name or compound"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="manufacture-date">Manufacture date <span className="required-mark">*</span></label>
                <input
                  id="manufacture-date"
                  className="text-input"
                  type="date"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  max={expDate || undefined}
                  required
                />
              </div>
              <div className="field-group">
                <label htmlFor="expiry-date">Expiry date <span className="required-mark">*</span></label>
                <input
                  id="expiry-date"
                  className="text-input"
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  min={mfgDate || undefined}
                  required
                />
              </div>
            </div>

            <div className="form-footer">
              <span className="form-required-note"><span className="required-mark">*</span> Required fields</span>
              <button className="button button-primary" type="submit" disabled={loading}>
                {loading ? <Loader2 className="spin" size={17} /> : <PackagePlus size={17} />}
                Create batch <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </section>

        <aside className="form-aside">
          <div className="aside-card aside-card-blue">
            <span className="aside-card-icon"><ShieldCheck size={18} /></span>
            <h3>Recorded on the ledger</h3>
            <p>Creating a batch submits its identity and dates to the supply chain ledger.</p>
          </div>
          <div className="aside-card">
            <p className="eyebrow">NEXT STEP</p>
            <div className="next-step-row">
              <span className="next-step-icon"><Truck size={16} /></span>
              <div><strong>Record a handoff</strong><span>Capture shipment conditions as they happen.</span></div>
            </div>
            <NavLink className="aside-link" to="/record-transport">Go to transport <ArrowRight size={15} /></NavLink>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BatchCreationForm;
