import { Routes, Route, NavLink } from "react-router-dom";
import BatchCreationForm from "./components/BatchCreationForm";
import TransportRecordForm from "./components/TransportRecordForm";
import BatchDetails from "./components/BatchDetails";
import { Pill, Truck, Search } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md shadow-md z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Pill className="w-6 h-6 text-blue-600" /> Pharma Portal
          </h1>
          <nav className="flex gap-6">
            {["Home", "Submit Batch", "Record Transport", "Batch Details"].map(
              (label, i) => {
                const path =
                  label === "Home"
                    ? "/"
                    : "/" + label.toLowerCase().replace(/\s+/g, "-");
                return (
                  <NavLink
                    key={i}
                    to={path}
                    className={({ isActive }) =>
                      `hover:text-blue-600 ${
                        isActive ? "text-blue-700 font-semibold underline" : ""
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                );
              }
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 max-w-6xl mx-auto">
        <Routes>
          {/* Home Dashboard */}
          <Route
            path="/"
            element={
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card: Submit Batch */}
                <NavLink to="/submit-batch">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center gap-3">
                    <Pill className="w-10 h-10 text-blue-600" />
                    <h3 className="text-xl font-semibold">Submit Batch</h3>
                    <p className="text-gray-500 text-center text-sm">
                      Create a new drug batch with manufacturing and expiry details.
                    </p>
                  </div>
                </NavLink>

                {/* Card: Record Transport */}
                <NavLink to="/record-transport">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center gap-3">
                    <Truck className="w-10 h-10 text-green-600" />
                    <h3 className="text-xl font-semibold">Record Transport</h3>
                    <p className="text-gray-500 text-center text-sm">
                      Log temperature and humidity during transport.
                    </p>
                  </div>
                </NavLink>

                {/* Card: Batch Details */}
                <NavLink to="/batch-details">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all flex flex-col items-center gap-3">
                    <Search className="w-10 h-10 text-indigo-600" />
                    <h3 className="text-xl font-semibold">Batch Details</h3>
                    <p className="text-gray-500 text-center text-sm">
                      Lookup batch information and transport history.
                    </p>
                  </div>
                </NavLink>
              </div>
            }
          />

          {/* Pages */}
          <Route path="/submit-batch" element={<BatchCreationForm />} />
          <Route path="/record-transport" element={<TransportRecordForm />} />
          <Route path="/batch-details" element={<BatchDetails />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-gray-700 text-center py-4 mt-auto">
        &copy; {new Date().getFullYear()} Pharma Portal. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
