import React, { useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Droplets, Loader2, Thermometer, Truck } from "lucide-react";
import { NavLink } from "react-router-dom";
import LoadingOverlay from "./LoadingOverlay";

const TransportRecordForm: React.FC = () => {
  const [batchId, setBatchId] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const observedAt = new Date(timestamp);
    const humidityValue = Number(humidity);
    const temperatureValue = Number(temperature);

    if (!Number.isFinite(observedAt.getTime())) {
      toast.error("Enter a valid date and time for this observation.");
      return;
    }
    if (humidityValue < 0 || humidityValue > 100) {
      toast.error("Humidity must be between 0% and 100%.");
      return;
    }

    setLoading(true);
    const transientValue = JSON.stringify({
      temperature: temperatureValue,
      humidity: humidityValue,
      timestamp: observedAt.toISOString(),
    });
    const payload = {
      chaincodeName: "pharma-cc",
      methodName: "RecordTransport",
      channelName: "pharmachannel",
      isTransient: true,
      transientKey: "transport",
      transientValue,
      inputParameters: [batchId.trim()],
    };

    try {
      const response = await fetch(
        "http://localhost:9000/pharma-app/v1.0/HLF/submitTransportTransactions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "The transport record could not be submitted.");
      }

      await response.json();
      toast.success("Transport record submitted.");
      setBatchId("");
      setTemperature("");
      setHumidity("");
      setTimestamp("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reach the API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content form-page">
      {loading && <LoadingOverlay message="Submitting transport record…" />}
      <div className="page-backline">
        <NavLink to="/" className="back-link"><ArrowLeft size={15} /> Overview</NavLink>
        <span className="page-step">SHIPMENT ACTIVITY <span>·</span> 02 OF 03</span>
      </div>
      <section className="page-intro form-intro">
        <div>
          <p className="eyebrow">CONDITION LOG</p>
          <h1>Record transport</h1>
          <p className="intro-copy">Add an observation from a shipment handoff or checkpoint.</p>
        </div>
        <span className="intro-icon tone-teal"><Truck size={23} /></span>
      </section>

      <div className="form-layout">
        <section className="form-card" aria-labelledby="transport-form-title">
          <div className="form-card-heading">
            <span className="form-section-number number-teal">02</span>
            <div>
              <h2 id="transport-form-title">Shipment conditions</h2>
              <p>Enter the sensor reading and the time it was observed.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="form-fields">
            <div className="field-group">
              <label htmlFor="transport-batch-id">Batch ID <span className="required-mark">*</span></label>
              <input
                id="transport-batch-id"
                className="text-input"
                type="text"
                placeholder="Enter the registered batch ID"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                autoComplete="off"
                required
              />
            </div>

            <div className="field-grid">
              <div className="field-group">
                <label htmlFor="temperature">Temperature <span className="required-mark">*</span></label>
                <div className="input-wrap">
                  <span className="input-leading"><Thermometer size={17} /></span>
                  <input
                    id="temperature"
                    className="text-input has-leading has-trailing"
                    type="number"
                    step="any"
                    placeholder="4.0"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    required
                  />
                  <span className="input-trailing">°C</span>
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="humidity">Relative humidity <span className="required-mark">*</span></label>
                <div className="input-wrap">
                  <span className="input-leading"><Droplets size={17} /></span>
                  <input
                    id="humidity"
                    className="text-input has-leading has-trailing"
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    placeholder="60"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    required
                  />
                  <span className="input-trailing">%</span>
                </div>
                <span className="field-hint">Enter a value from 0 to 100.</span>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="observed-at">Observed at <span className="required-mark">*</span></label>
              <input
                id="observed-at"
                className="text-input"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                required
              />
              <span className="field-hint">Use the local time shown by the monitoring device.</span>
            </div>

            <div className="form-footer">
              <span className="form-required-note"><span className="required-mark">*</span> Required fields</span>
              <button className="button button-teal" type="submit" disabled={loading}>
                {loading ? <Loader2 className="spin" size={17} /> : <Truck size={17} />}
                Submit record <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </section>

        <aside className="form-aside">
          <div className="aside-card aside-card-teal">
            <span className="aside-card-icon"><Thermometer size={18} /></span>
            <h3>Why log conditions?</h3>
            <p>Temperature and humidity observations help teams review how a shipment was handled.</p>
          </div>
          <div className="aside-card">
            <p className="eyebrow">GOOD TO KNOW</p>
            <div className="note-list">
              <div><span className="note-check">1</span><span>Confirm the batch ID before submitting.</span></div>
              <div><span className="note-check">2</span><span>Use the time the reading was taken.</span></div>
              <div><span className="note-check">3</span><span>Enter relative humidity as a percentage.</span></div>
            </div>
            <NavLink className="aside-link" to="/batch-details">Review a batch <ArrowRight size={15} /></NavLink>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TransportRecordForm;
