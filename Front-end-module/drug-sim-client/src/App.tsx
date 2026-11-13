import { NavLink, Route, Routes } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  Boxes,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  PackagePlus,
  Pill,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import BatchCreationForm from "./components/BatchCreationForm";
import TransportRecordForm from "./components/TransportRecordForm";
import BatchDetails from "./components/BatchDetails";

type NavigationItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const navigation: NavigationItem[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Create batch", path: "/submit-batch", icon: PackagePlus },
  { label: "Record transport", path: "/record-transport", icon: Truck },
  { label: "Batch lookup", path: "/batch-details", icon: Search },
];

function Dashboard() {
  return (
    <div className="page-content">
      <section className="page-intro dashboard-intro">
        <div>
          <p className="eyebrow">SUPPLY CHAIN WORKSPACE</p>
          <h1>Keep every batch moving.</h1>
          <p className="intro-copy">
            Keep each batch traceable from manufacture through delivery.
          </p>
        </div>
        <NavLink className="button button-primary" to="/submit-batch">
          <PackagePlus size={17} aria-hidden="true" />
          Create a batch
        </NavLink>
      </section>

      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <div className="welcome-kicker">
            <ShieldCheck size={15} aria-hidden="true" />
            TRACEABILITY, BUILT IN
          </div>
          <h2 id="welcome-title">A clearer picture of every shipment.</h2>
          <p>
            Record handling conditions, review stability results, and keep batch
            activity connected to its ledger record.
          </p>
          <NavLink className="welcome-link" to="/batch-details">
            Find a batch <ArrowRight size={16} aria-hidden="true" />
          </NavLink>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-center"><Pill size={32} strokeWidth={1.6} /></div>
          <div className="art-node node-top"><Boxes size={17} /></div>
          <div className="art-node node-right"><Truck size={17} /></div>
          <div className="art-node node-bottom"><FlaskConical size={17} /></div>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <p className="eyebrow">GET STARTED</p>
          <h2>Choose your next step</h2>
        </div>
        <span className="section-note">Three tools, one batch record</span>
      </div>

      <section className="workflow-grid" aria-label="Supply chain actions">
        <WorkflowCard
          number="01"
          title="Create a batch"
          description="Register a product with its batch ID, manufacture date, and expiry date."
          icon={PackagePlus}
          to="/submit-batch"
          tone="blue"
        />
        <WorkflowCard
          number="02"
          title="Record transport"
          description="Add a handoff with observed temperature, humidity, and time."
          icon={Truck}
          to="/record-transport"
          tone="teal"
        />
        <WorkflowCard
          number="03"
          title="Review a batch"
          description="Look up batch details and available stability and audit records."
          icon={ClipboardList}
          to="/batch-details"
          tone="violet"
        />
      </section>

      <section className="process-strip" aria-label="Batch tracking process">
        <div className="process-heading">
          <span className="process-icon"><ArrowDownRight size={18} /></span>
          <div>
            <p className="eyebrow">THE TRACKING FLOW</p>
            <h2>From production to proof</h2>
          </div>
        </div>
        <div className="process-steps">
          <ProcessStep icon={Pill} title="Manufacture" detail="Create the batch" />
          <span className="process-connector" aria-hidden="true" />
          <ProcessStep icon={Truck} title="Move" detail="Log conditions" />
          <span className="process-connector" aria-hidden="true" />
          <ProcessStep icon={ShieldCheck} title="Verify" detail="Review the record" />
        </div>
      </section>
    </div>
  );
}

function WorkflowCard({
  number,
  title,
  description,
  icon: Icon,
  to,
  tone,
}: {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  tone: "blue" | "teal" | "violet";
}) {
  return (
    <NavLink className="workflow-card" to={to}>
      <div className="workflow-card-top">
        <span className={`workflow-icon tone-${tone}`}><Icon size={20} /></span>
        <span className="workflow-number">{number}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="card-action">Open tool <ArrowRight size={15} /></span>
    </NavLink>
  );
}

function ProcessStep({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="process-step">
      <span className="process-step-icon"><Icon size={17} /></span>
      <div><strong>{title}</strong><span>{detail}</span></div>
    </div>
  );
}

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label="Pharma Portal overview">
          <span className="brand-mark"><Pill size={21} strokeWidth={2.2} /></span>
          <span className="brand-name">pharma<span>track</span></span>
        </NavLink>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) => `nav-item${isActive ? " nav-item-active" : ""}`}
            >
              <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
              <span>{label}</span>
              {path === "/" && <span className="nav-active-dot" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="sidebar-note-icon"><ShieldCheck size={17} /></span>
          <div>
            <strong>Batch-first tracking</strong>
            <span>Activity stays connected to its batch.</span>
          </div>
        </div>
        <div className="sidebar-footer">PHARMA SUPPLY CHAIN · 2026</div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark"><Pill size={19} /></span>
            <span className="brand-name">pharma<span>track</span></span>
          </div>
          <div className="breadcrumb"><span>PharmaTrack</span><span className="breadcrumb-divider">/</span><strong>Workspace</strong></div>
          <div className="topbar-caption">Pharmaceutical batch tracking</div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/submit-batch" element={<BatchCreationForm />} />
          <Route path="/record-transport" element={<TransportRecordForm />} />
          <Route path="/batch-details" element={<BatchDetails />} />
        </Routes>

        <footer className="app-footer">
          <span>PharmaTrack</span>
          <span>Supply chain visibility for every batch</span>
        </footer>
      </main>
      <ToastContainer position="top-right" autoClose={3200} theme="light" />
    </div>
  );
}

export default App;
