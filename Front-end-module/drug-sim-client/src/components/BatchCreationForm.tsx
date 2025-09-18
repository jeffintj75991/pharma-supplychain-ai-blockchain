import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Pill } from "lucide-react";
import LoadingOverlay from "./LoadingOverlay";

const BatchCreationForm: React.FC = () => {
  const [batchId, setBatchId] = useState("");
  const [drugName, setDrugName] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      chaincodeName: "pharma-cc",
      methodName: "CreateBatch",
      channelName: "pharmachannel",
      isTransient: "false",
      transientKey: "",
      transientValue: "",
      inputParameters: [batchId, drugName, mfgDate, expDate],
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

      if (response.ok) {
        await response.json();
        toast.success("✅ Batch created successfully!");
        setBatchId("");
        setDrugName("");
        setMfgDate("");
        setExpDate("");
      } else {
        toast.error("❌ Failed to create batch (server error)");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 relative">
        {loading && <LoadingOverlay message="Creating batch..." />}

        <h2 className="text-3xl font-extrabold mb-8 text-blue-700 flex items-center gap-3">
          <Pill className="w-7 h-7 text-blue-500" /> Create Drug Batch
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch ID */}
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
            <Pill className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="ml-3 w-full text-lg bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Drug Name */}
          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
            <Pill className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Drug Name"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              className="ml-3 w-full text-lg bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Manufacturing Date */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
            <label className="text-gray-500 mb-1 block text-sm">Manufacturing Date</label>
            <input
              type="date"
              value={mfgDate}
              onChange={(e) => setMfgDate(e.target.value)}
              className="w-full text-lg bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
            <label className="text-gray-500 mb-1 block text-sm">Expiry Date</label>
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="w-full text-lg bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-3 text-lg font-semibold disabled:opacity-50 transition"
          >
            {loading && <Loader2 className="animate-spin w-6 h-6" />}
            Create Batch
          </button>
        </form>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default BatchCreationForm;
