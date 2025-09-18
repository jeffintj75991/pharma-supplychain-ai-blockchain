import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Truck } from "lucide-react";
import LoadingOverlay from "./LoadingOverlay";

const TransportRecordForm: React.FC = () => {
  const [batchId, setBatchId] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isoTimestamp = new Date(timestamp).toISOString();
    const transientValue = JSON.stringify({
      temperature: Number(temperature),
      humidity: Number(humidity),
      timestamp: isoTimestamp,
    });

    const payload = {
      chaincodeName: "pharma-cc",
      methodName: "RecordTransport",
      channelName: "pharmachannel",
      isTransient: true,
      transientKey: "transport",
      transientValue,
      inputParameters: [batchId],
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

      if (response.ok) {
        await response.json();
        toast.success("✅ Transport record submitted!");
        setBatchId("");
        setTemperature("");
        setHumidity("");
        setTimestamp("");
      } else {
        const errText = await response.text();
        toast.error(`❌ Server error: ${errText}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white rounded-xl shadow-lg p-6 relative">
      {loading && <LoadingOverlay message="Submitting transport..." />}
      <h2 className="text-2xl font-bold mb-6 text-green-700 flex items-center gap-2">
        <Truck className="w-6 h-6 text-green-500" /> Record Transport
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="number"
          placeholder="Temperature (°C)"
          value={temperature}
          onChange={(e) => setTemperature(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="number"
          placeholder="Humidity (%)"
          value={humidity}
          onChange={(e) => setHumidity(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          Submit Transport
        </button>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default TransportRecordForm;
