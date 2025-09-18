import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2, Search } from "lucide-react";
import LoadingOverlay from "./LoadingOverlay";

// Define type for batch data
type BatchData = Record<string, string | number | boolean | null>;

const BatchDetails: React.FC = () => {
  const [batchId, setBatchId] = useState<string>("");
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim()) {
      toast.error("⚠️ Please enter a Batch ID");
      return;
    }

    const url = `http://localhost:9000/pharma-app/v1.0/HLF/getTransactions?channelName=pharmachannel&chaincodeName=pharma-cc&methodName=GetBatch&value=${batchId}`;

    try {
      setLoading(true);
      setBatchData(null);

      const res = await fetch(url);
      if (res.ok) {
        const data: BatchData = await res.json();
        setBatchData(data);
        toast.success("✅ Batch details fetched!");
      } else {
        toast.error("❌ Error fetching batch details");
      }
    } catch (err) {
      console.error(err);
      toast.error("⚠️ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg relative">
      {loading && <LoadingOverlay message="Fetching batch details..." />}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-indigo-700">
        <Search className="w-6 h-6 text-indigo-500" /> Pharma Batch Lookup
      </h2>

      <form onSubmit={handleFetch} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter Batch ID"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="border border-gray-300 rounded-md p-2 flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          Get Details
        </button>
      </form>

      {batchData && (
        <div className="overflow-x-auto rounded-md">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 border-b text-left">Key</th>
                <th className="px-3 py-2 border-b text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(batchData).map(([key, value]) => (
                <tr
                  key={key}
                  className={`border-b ${
                    key.toLowerCase().includes("expiry") &&
                    value &&
                    new Date(value.toString()) < new Date()
                      ? "bg-red-100"
                      : ""
                  }`}
                >
                  <td className="px-3 py-2 font-medium">{key}</td>
                  <td className="px-3 py-2">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default BatchDetails;
