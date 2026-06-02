import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleDollarSign,
  Clock3,
  Filter,
  Link2,
  ListChecks,
  Mail,
  MessageSquareText,
  MoreVertical,
  Paperclip,
  PhoneCall,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Smartphone,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import {
  activityByLead,
  bookingByLead,
  getLeadMessages,
  integrations,
  kpis,
  navItems,
  quickSetupSteps,
  seedLeads,
  sourceColors,
  sourceIcons
} from "../data";
import type { ActivityLog, Booking, Integration, Lead, LeadStatus } from "../types";

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  responding: "AI Responding",
  qualified: "Qualified",
  booked: "Booked"
};

const stageStatus: Record<number, LeadStatus> = {
  0: "new",
  1: "responding",
  2: "qualified",
  3: "qualified",
  4: "booked"
};

const slots = ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];
const stageOrder: LeadStatus[] = ["new", "responding", "qualified", "booked"];

function App() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedLeadId, setSelectedLeadId] = useState(seedLeads[0].id);
  const [leadStages, setLeadStages] = useState<Record<string, number>>({
    "lead-1": 4,
    "lead-2": 0,
    "lead-3": 0,
    "lead-4": 0,
    "lead-5": 0
  });

  const stage = leadStages[selectedLeadId] ?? 0;

  const leads = useMemo(
    () =>
      seedLeads.map((lead) => ({
        ...lead,
        status: stageStatus[leadStages[lead.id] ?? 0] ?? lead.status
      })),
    [leadStages]
  );
  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) ?? leads[0];

  const selectedBooking = bookingByLead[selectedLead.id];
  const messages = getLeadMessages(selectedLead, stage);
  const activities = getActivities(selectedLead, stage);
  const projectedKpis = getProjectedKpis(stage);

  function runAiResponse() {
    setLeadStages((current) => ({
      ...current,
      [selectedLead.id]: Math.min((current[selectedLead.id] ?? 0) + 1, 4)
    }));
  }

  function resetDemo() {
    setSelectedLeadId(seedLeads[0].id);
    setActiveNav("Dashboard");
    setLeadStages({
      "lead-1": 4,
      "lead-2": 0,
      "lead-3": 0,
      "lead-4": 0,
      "lead-5": 0
    });
  }

  return (
    <div className="app-shell">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <main className="workspace">
        <TopBar onRun={runAiResponse} onReset={resetDemo} stage={stage} selectedLead={selectedLead} />
        <WorkspaceRouter
          activeNav={activeNav}
          leads={leads}
          selectedLead={selectedLead}
          stage={stage}
          booking={selectedBooking}
          messages={messages}
          activities={activities}
          kpis={projectedKpis}
          onLeadSelect={setSelectedLeadId}
          onRun={runAiResponse}
        />
      </main>
    </div>
  );
}

function Sidebar({ activeNav, onNavChange }: { activeNav: string; onNavChange: (value: string) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Smartphone size={20} />
        </div>
        <div>
          <strong>AI Lead Response</strong>
          <span>Command Center</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === activeNav;
          return (
            <button
              aria-label={item.label}
              className={`nav-item ${isActive ? "active" : ""}`}
              key={item.label}
              onClick={() => onNavChange(item.label)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="business-card">
          <strong>Peak Home Services</strong>
          <span>HVAC · Plumbing · Electrical</span>
        </div>
        <button className="nav-item muted">
          <SettingsIcon />
          <span>Settings</span>
        </button>
        <button className="nav-item muted">
          <ChevronLeft size={18} />
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  );
}

function SettingsIcon() {
  return <CircleHelp size={18} />;
}

function TopBar({
  selectedLead,
  stage,
  onRun,
  onReset
}: {
  selectedLead: Lead;
  stage: number;
  onRun: () => void;
  onReset: () => void;
}) {
  return (
    <header className="topbar">
      <div className="business-select">
        <span>Business:</span>
        <button>
          Peak Home Services
          <ChevronDown size={16} />
        </button>
      </div>

      <label className="crm-search" aria-label="Search CRM">
        <Search size={16} />
        <input value="Search leads, contacts, jobs..." readOnly />
      </label>

      <div className="stack-strip" aria-label="Connected free trial stack">
        {integrations.slice(0, 7).map((integration) => (
          <StackChip integration={integration} key={integration.id} />
        ))}
      </div>

      <div className="top-actions">
        <button className="ghost-button" onClick={onReset}>
          <RotateCcw size={16} />
          Reset Demo
        </button>
        <button className="primary-button" onClick={onRun}>
          <Send size={16} />
          {stage >= 4 ? "Booked" : "Run AI Response"}
        </button>
      </div>

      <div className="trial-status">
        <span>Trial ends in 13 days</span>
        <div className="trial-meter">
          <span />
        </div>
      </div>

      <div className="utility-icons">
        <button aria-label="Help">
          <CircleHelp size={18} />
        </button>
        <button aria-label="Notifications" className="notification">
          <Bell size={18} />
          <span>3</span>
        </button>
        <button className="avatar" aria-label={`Lead selected: ${selectedLead.contact}`}>
          JS
        </button>
      </div>
    </header>
  );
}

function StackChip({ integration }: { integration: Integration }) {
  const Icon = integration.icon;
  return (
    <a className="stack-chip" href={integration.sourceUrl} target="_blank" rel="noreferrer" title={integration.limitNote}>
      <Icon size={18} style={{ color: integration.color }} />
      <span>{integration.provider}</span>
      <Check size={13} className={integration.state === "connected" ? "chip-ok" : "chip-soft"} />
      <small>{integration.state === "trial" ? "Trial" : integration.state === "mocked" ? "Mock" : "Free"}</small>
    </a>
  );
}

function WorkspaceRouter({
  activeNav,
  leads,
  selectedLead,
  stage,
  booking,
  messages,
  activities,
  kpis,
  onLeadSelect,
  onRun
}: {
  activeNav: string;
  leads: Lead[];
  selectedLead: Lead;
  stage: number;
  booking: Booking;
  messages: ReturnType<typeof getLeadMessages>;
  activities: ActivityLog[];
  kpis: ReturnType<typeof getProjectedKpis>;
  onLeadSelect: (id: string) => void;
  onRun: () => void;
}) {
  if (activeNav === "Setup") {
    return <SetupView integrations={integrations} />;
  }

  if (activeNav === "Dashboard") {
    return (
      <DashboardOverviewPage
        leads={leads}
        selectedLead={selectedLead}
        stage={stage}
        booking={booking}
        activities={activities}
        kpis={kpis}
        onLeadSelect={onLeadSelect}
        onRun={onRun}
      />
    );
  }

  if (activeNav === "Contacts") {
    return <ContactsPage leads={leads} selectedLead={selectedLead} onLeadSelect={onLeadSelect} />;
  }

  if (activeNav === "Pipeline") {
    return <PipelinePage leads={leads} selectedLead={selectedLead} onLeadSelect={onLeadSelect} />;
  }

  if (activeNav === "Conversations") {
    return <ConversationsPage leads={leads} selectedLead={selectedLead} messages={messages} onLeadSelect={onLeadSelect} onRun={onRun} stage={stage} />;
  }

  if (activeNav === "Automations") {
    return <AutomationsPage />;
  }

  if (activeNav === "Reports") {
    return <ReportsPage leads={leads} kpis={kpis} />;
  }

  return (
    <CrmDashboardView
      activeNav={activeNav}
      leads={leads}
      selectedLead={selectedLead}
      stage={stage}
      booking={booking}
      messages={messages}
      activities={activities}
      kpis={kpis}
      onLeadSelect={onLeadSelect}
      onRun={onRun}
    />
  );
}

function DashboardOverviewPage({
  leads,
  selectedLead,
  stage,
  booking,
  activities,
  kpis,
  onLeadSelect,
  onRun
}: {
  leads: Lead[];
  selectedLead: Lead;
  stage: number;
  booking: Booking;
  activities: ActivityLog[];
  kpis: ReturnType<typeof getProjectedKpis>;
  onLeadSelect: (id: string) => void;
  onRun: () => void;
}) {
  const pipelineValue = leads.reduce((total, lead) => total + lead.value, 0);
  const bookedValue = leads.filter((lead) => lead.status === "booked").reduce((total, lead) => total + lead.value, 0);
  const hotLeads = leads.filter((lead) => lead.urgency === "Today").length;
  const bookedLeads = leads.filter((lead) => lead.status === "booked").length;
  const responseSla = 92;
  const sourceOrder: Lead["source"][] = ["Missed Call", "Website Form", "Google Ads", "Facebook", "Yelp"];
  const sourceBreakdown = sourceOrder.map((source) => {
    const count = leads.filter((lead) => lead.source === source).length;
    return {
      source,
      count,
      value: leads.filter((lead) => lead.source === source).reduce((total, lead) => total + lead.value, 0),
      percent: Math.round((count / leads.length) * 100),
      color: sourceColors[source]
    };
  });
  let sourceCursor = 0;
  const sourceRingGradient = sourceBreakdown
    .map((item) => {
      const start = sourceCursor;
      sourceCursor += item.percent;
      return `${item.color} ${start}% ${sourceCursor}%`;
    })
    .join(", ");
  const stageBreakdown = [
    { status: "new" as LeadStatus, label: "New", color: "#94a3b8" },
    { status: "responding" as LeadStatus, label: "Contacted", color: "#f59e0b" },
    { status: "qualified" as LeadStatus, label: "Qualified", color: "#2563eb" },
    { status: "booked" as LeadStatus, label: "Booked", color: "#16a34a" }
  ].map((item) => ({
    ...item,
    count: leads.filter((lead) => lead.status === item.status).length,
    value: leads.filter((lead) => lead.status === item.status).reduce((total, lead) => total + lead.value, 0)
  }));
  const actionLabel = stage >= 4 ? "Review CRM Sync" : stage >= 2 ? "Confirm Booking Hold" : "Send AI Response";
  const SelectedSourceIcon = sourceIcons[selectedLead.source];
  const queueLeads = [...leads].sort((first, second) => {
    const urgencyRank = (lead: Lead) => (lead.urgency === "Today" ? 0 : lead.urgency === "This week" ? 1 : 2);
    return urgencyRank(first) - urgencyRank(second) || second.value - first.value;
  });
  const metricTiles = [
    { label: "Avg. Response Time", value: kpis[0].value, helper: "Target under 60s", delta: kpis[0].delta, icon: Clock3, tone: "teal" },
    { label: "Recovered Calls", value: kpis[1].value, helper: "Missed calls saved", delta: kpis[1].delta, icon: PhoneCall, tone: "blue" },
    { label: "Booked Jobs", value: String(bookedLeads || kpis[2].value), helper: `${booking.slot}`, delta: kpis[2].delta, icon: CalendarCheck, tone: "green" },
    {
      label: "Open Pipeline",
      value: pipelineValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      helper: `${hotLeads} same-day leads`,
      delta: "+21%",
      icon: CircleDollarSign,
      tone: "amber"
    }
  ];

  return (
    <div className="ops-dashboard">
      <section className="ops-titlebar">
        <div>
          <h1>Dashboard</h1>
          <p>AI lead response performance, booking pressure, and CRM sync health for today.</p>
        </div>
        <div className="ops-title-actions">
          <button>
            <CalendarCheck size={16} />
            Today
          </button>
          <button>
            <BarChart3 size={16} />
            Export
          </button>
        </div>
      </section>

      <section className="ops-kpi-band" aria-label="Dashboard metrics">
        {metricTiles.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className={`ops-metric ${metric.tone}`} key={metric.label}>
              <span className="ops-metric-icon">
                <Icon size={22} />
              </span>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>
                  <ArrowUpRight size={13} />
                  {metric.delta} <em>{metric.helper}</em>
                </small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="ops-grid">
        <article className="ops-panel sla-panel">
          <PanelTitle icon={<Target size={17} />} title="Response SLA" subtitle="How fast AI reaches new leads" />
          <div className="sla-body">
            <div className="sla-ring" style={{ "--sla": `${responseSla}%` } as CSSProperties}>
              <strong>{responseSla}%</strong>
              <span>Within 60s</span>
            </div>
            <div className="sla-breakdown">
              <SummaryStat label="Within 60s" value="34" helper="On track" tone="success" />
              <SummaryStat label="60s - 180s" value="2" helper="Watch" tone="warning" />
              <SummaryStat label="Over 180s" value="1" helper="Escalate" tone="danger" />
            </div>
          </div>
        </article>

        <article className="ops-panel source-panel">
          <PanelTitle icon={<PieIcon />} title="Lead Source Mix" subtitle="Where today's opportunities came from" />
          <div className="source-mix">
            <div className="source-ring" style={{ background: `conic-gradient(${sourceRingGradient})` }}>
              <span>{leads.length}</span>
              <small>Leads</small>
            </div>
            <div className="source-bars">
              {sourceBreakdown.map((item) => (
                <div className="source-bar-row" key={item.source}>
                  <div>
                    <span style={{ backgroundColor: item.color }} />
                    <strong>{item.source}</strong>
                  </div>
                  <em>{item.count}</em>
                  <i style={{ "--source-color": item.color, "--source-size": `${Math.max(item.percent, 6)}%` } as CSSProperties} />
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="ops-panel queue-panel">
          <PanelTitle icon={<ListChecks size={17} />} title="Lead Response Queue" subtitle={`${queueLeads.length} records ranked by urgency and value`} action="View all" />
          <div className="dashboard-queue">
            <div className="queue-head">
              <span>Lead</span>
              <span>Source</span>
              <span>Age</span>
              <span>Status</span>
              <span>SLA</span>
            </div>
            {queueLeads.map((lead, index) => {
              const SourceIcon = sourceIcons[lead.source];
              return (
                <button className={lead.id === selectedLead.id ? "selected" : ""} key={lead.id} onClick={() => onLeadSelect(lead.id)}>
                  <span>
                    <strong>{lead.contact}</strong>
                    <small>{lead.service}</small>
                  </span>
                  <span className="queue-source" style={{ color: sourceColors[lead.source] }}>
                    <SourceIcon size={17} />
                    {lead.source}
                  </span>
                  <em className={lead.urgency === "Today" ? "urgent" : ""}>{lead.age}</em>
                  <StagePill status={lead.status} />
                  <small>{index < 2 ? "18s" : index < 4 ? "45s" : "1m 12s"}</small>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="ops-panel selected-action-panel">
          <PanelTitle icon={<Zap size={17} />} title="Selected Lead" subtitle="Next best action" />
          <div className="selected-lead-top">
            <span className="record-avatar small">{selectedLead.contact.split(" ").map((part) => part[0]).join("")}</span>
            <div>
              <h2>{selectedLead.contact}</h2>
              <p>{selectedLead.service}</p>
            </div>
            <StagePill status={selectedLead.status} />
          </div>
          <div className="next-action-box">
            <MessageSquareText size={20} />
            <div>
              <strong>{actionLabel}</strong>
              <span>AI will qualify urgency, confirm address, offer a slot, and log the record.</span>
            </div>
            <button onClick={onRun}>{stage >= 4 ? "Open Sync" : "Run Now"}</button>
          </div>
          <div className="lead-facts">
            <Field label="Source" value={selectedLead.source} />
            <Field label="Phone" value={selectedLead.phone} />
            <Field label="Value" value={selectedLead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} />
            <Field label="Slot" value={booking.slot} />
            <Field label="Address" value={selectedLead.address} wide />
          </div>
          <div className="selected-source-card" style={{ "--source-color": sourceColors[selectedLead.source] } as CSSProperties}>
            <SelectedSourceIcon size={20} />
            <span>{selectedLead.source}</span>
            <strong>{selectedLead.urgency}</strong>
          </div>
        </aside>

        <article className="ops-panel pipeline-panel">
          <PanelTitle icon={<TrendingUp size={17} />} title="Pipeline Overview" subtitle="Open value by lead stage" />
          <div className="pipeline-blocks">
            {stageBreakdown.map((item) => (
              <div className="pipeline-block" key={item.status} style={{ "--stage-color": item.color } as CSSProperties}>
                <span>{item.label}</span>
                <strong>{item.count}</strong>
                <em>{item.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</em>
              </div>
            ))}
          </div>
          <div className="pipeline-total">
            <span>Total pipeline value</span>
            <strong>{pipelineValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</strong>
            <small>{bookedValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} already booked</small>
          </div>
        </article>

        <article className="ops-panel automation-panel">
          <PanelTitle icon={<Activity size={17} />} title="Recent Automation Activity" subtitle="Make, HubSpot, Calendar, and Sheets events" action="View all" />
          <div className="automation-feed">
            {(activities.length ? activities : getActivities(selectedLead, 4)).map((activity) => (
              <article key={activity.id}>
                <span className={`feed-dot ${activity.state}`} />
                <div>
                  <strong>{activity.eventLabel}</strong>
                  <small>{activity.detail}</small>
                </div>
                <time>{activity.timestamp}</time>
                <em>{activity.state === "success" ? "Success" : "Pending"}</em>
              </article>
            ))}
          </div>
        </article>
      </section>

      <footer className="ops-dashboard-footer">
        <span>All times in Central Time</span>
        <span>Auto-refresh on</span>
        <span>Mock data only - no live credentials connected</span>
      </footer>
    </div>
  );
}

function PanelTitle({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle: string; action?: string }) {
  return (
    <header className="ops-panel-title">
      <span>{icon}</span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action && <button>{action}</button>}
    </header>
  );
}

function SummaryStat({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: "success" | "warning" | "danger" }) {
  return (
    <div className={`summary-stat ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{helper}</small>
    </div>
  );
}

function PieIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9h-9z" fill="currentColor" opacity="0.22" />
      <path d="M14 3.3V10h6.7A8.5 8.5 0 0 0 14 3.3z" fill="currentColor" />
    </svg>
  );
}

function ContactsPage({ leads, selectedLead, onLeadSelect }: { leads: Lead[]; selectedLead: Lead; onLeadSelect: (id: string) => void }) {
  return (
    <div className="crm-secondary-page">
      <PageHeading title="Contacts" subtitle="Customer contact records created from missed calls, forms, ads, and social leads." />
      <section className="secondary-grid contacts-layout">
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2>Contact Directory</h2>
              <span>{leads.length} contacts synced from the lead response workflow</span>
            </div>
            <label className="table-search">
              <Search size={15} />
              <input value="Search contacts" readOnly />
            </label>
          </div>
          <div className="contact-list">
            {leads.map((lead) => (
              <button className={lead.id === selectedLead.id ? "selected" : ""} key={lead.id} onClick={() => onLeadSelect(lead.id)}>
                <span className="record-avatar small">{lead.contact.split(" ").map((part) => part[0]).join("")}</span>
                <span>
                  <strong>{lead.contact}</strong>
                  <small>{lead.phone} - {lead.email}</small>
                </span>
                <StagePill status={lead.status} />
              </button>
            ))}
          </div>
        </div>
        <div className="crm-card contact-profile">
          <div className="record-header inline">
            <span className="record-avatar">{selectedLead.contact.split(" ").map((part) => part[0]).join("")}</span>
            <div>
              <h2>{selectedLead.contact}</h2>
              <p>{selectedLead.email}</p>
            </div>
          </div>
          <div className="field-grid padded">
            <Field label="Phone" value={selectedLead.phone} wide />
            <Field label="Primary Service" value={selectedLead.service} />
            <Field label="Lead Source" value={selectedLead.source} />
            <Field label="Address" value={selectedLead.address} wide />
            <Field label="Lifecycle Stage" value={statusLabels[selectedLead.status]} status={selectedLead.status} />
            <Field label="Owner" value="Jordan S." />
          </div>
        </div>
      </section>
    </div>
  );
}

function PipelinePage({ leads, selectedLead, onLeadSelect }: { leads: Lead[]; selectedLead: Lead; onLeadSelect: (id: string) => void }) {
  const columns = [
    { status: "new" as LeadStatus, label: "New" },
    { status: "responding" as LeadStatus, label: "Contacted" },
    { status: "qualified" as LeadStatus, label: "Qualified" },
    { status: "booked" as LeadStatus, label: "Booked" }
  ];

  return (
    <div className="crm-secondary-page">
      <PageHeading title="Pipeline" subtitle="Board view of lead stages from capture through booked appointment." />
      <section className="pipeline-board">
        {columns.map((column) => {
          const columnLeads = leads.filter((lead) => lead.status === column.status);
          return (
            <article className="pipeline-column" key={column.status}>
              <header>
                <strong>{column.label}</strong>
                <span>{columnLeads.length}</span>
              </header>
              <div>
                {columnLeads.length === 0 ? (
                  <p className="empty-column">No records in this stage</p>
                ) : (
                  columnLeads.map((lead) => (
                    <button className={lead.id === selectedLead.id ? "selected" : ""} key={lead.id} onClick={() => onLeadSelect(lead.id)}>
                      <strong>{lead.contact}</strong>
                      <span>{lead.service}</span>
                      <em>{lead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</em>
                    </button>
                  ))
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ConversationsPage({
  leads,
  selectedLead,
  messages,
  onLeadSelect,
  onRun,
  stage
}: {
  leads: Lead[];
  selectedLead: Lead;
  messages: ReturnType<typeof getLeadMessages>;
  onLeadSelect: (id: string) => void;
  onRun: () => void;
  stage: number;
}) {
  return (
    <div className="crm-secondary-page">
      <PageHeading title="Conversations" subtitle="Unified inbox for AI text, voice follow-up, and human handoff." />
      <section className="secondary-grid conversations-layout">
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2>Conversation Inbox</h2>
              <span>Latest customer touchpoints</span>
            </div>
          </div>
          <div className="inbox-list">
            {leads.map((lead) => (
              <button className={lead.id === selectedLead.id ? "selected" : ""} key={lead.id} onClick={() => onLeadSelect(lead.id)}>
                <span>
                  <strong>{lead.contact}</strong>
                  <small>{lead.source} - {lead.service}</small>
                </span>
                <em>{lead.age}</em>
              </button>
            ))}
          </div>
        </div>
        <TextMessageConversation lead={selectedLead} messages={messages} onRun={onRun} stage={stage} />
      </section>
    </div>
  );
}

function TextMessageConversation({
  lead,
  messages,
  onRun,
  stage
}: {
  lead: Lead;
  messages: ReturnType<typeof getLeadMessages>;
  onRun: () => void;
  stage: number;
}) {
  return (
    <section className="crm-card text-thread-card">
      <div className="text-thread-header">
        <div>
          <span className="record-avatar small">{lead.contact.split(" ").map((part) => part[0]).join("")}</span>
          <div>
            <h2>{lead.contact}</h2>
            <p>
              {lead.phone} - {lead.source} - {lead.service}
            </p>
          </div>
        </div>
        <button className="compact-run" onClick={onRun}>
          <SparkleMark />
          {stage >= 4 ? "Synced" : "Advance AI"}
        </button>
      </div>

      <div className="sms-thread" aria-label={`Text message conversation with ${lead.contact}`}>
        {messages.map((message) => (
          <article className={`sms-message ${message.sender}`} key={message.id}>
            <div>
              <p>{message.body}</p>
              <span>{message.time}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="sms-composer">
        <input value={stage >= 4 ? "Appointment confirmed and CRM updated." : "Type a reply or let AI continue..."} readOnly />
        <button aria-label="Attach file">
          <Paperclip size={16} />
        </button>
        <button aria-label="Send message" onClick={onRun}>
          <Send size={17} />
        </button>
      </div>
    </section>
  );
}

function AutomationsPage() {
  const automationCards = [
    { title: "Missed Call Recovery", tool: "Vapi", state: "Active", detail: "Calls or texts back within 10 seconds." },
    { title: "Lead Intake Workflow", tool: "Make", state: "Active", detail: "Routes source, service, value, and urgency." },
    { title: "CRM Contact Sync", tool: "HubSpot", state: "Active", detail: "Creates contact, owner, stage, and notes." },
    { title: "Backup Lead Log", tool: "Google Sheets", state: "Active", detail: "Appends every AI action to a sheet." },
    { title: "Calendar Booking", tool: "Google Calendar", state: "Active", detail: "Checks slots and writes appointment events." },
    { title: "SMS Transport", tool: "Twilio", state: "Optional", detail: "Trial-limited fallback for SMS and phone tests." }
  ];

  return (
    <div className="crm-secondary-page">
      <PageHeading title="Automations" subtitle="Scenario-level view of what the AI lead response system runs behind the dashboard." />
      <section className="automation-grid">
        {automationCards.map((card) => (
          <article className="crm-card automation-card" key={card.title}>
            <div>
              <strong>{card.title}</strong>
              <StageBadge>{card.state}</StageBadge>
            </div>
            <span>{card.tool}</span>
            <p>{card.detail}</p>
          </article>
        ))}
      </section>
      <StackHealthCard />
    </div>
  );
}

function ReportsPage({ leads, kpis }: { leads: Lead[]; kpis: ReturnType<typeof getProjectedKpis> }) {
  const maxValue = Math.max(...leads.map((lead) => lead.value));

  return (
    <div className="crm-secondary-page">
      <PageHeading title="Reports" subtitle="Simple CRM reporting for speed-to-lead, booked jobs, and pipeline value." />
      <CrmMetricStrip kpis={kpis} pipelineValue={leads.reduce((total, lead) => total + lead.value, 0)} />
      <section className="secondary-grid two-columns">
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2>Pipeline by Lead</h2>
              <span>Estimated service value</span>
            </div>
          </div>
          <div className="bar-report">
            {leads.map((lead) => (
              <article key={lead.id}>
                <div>
                  <strong>{lead.contact}</strong>
                  <span>{lead.service}</span>
                </div>
                <div className="bar-track">
                  <span style={{ width: `${Math.max(12, (lead.value / maxValue) * 100)}%` }} />
                </div>
                <em>{lead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</em>
              </article>
            ))}
          </div>
        </div>
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2>Source Performance</h2>
              <span>Current demo lead mix</span>
            </div>
          </div>
          <div className="source-report">
            {leads.map((lead) => {
              const SourceIcon = sourceIcons[lead.source];
              return (
                <article key={lead.id}>
                  <SourceIcon size={18} style={{ color: sourceColors[lead.source] }} />
                  <span>{lead.source}</span>
                  <strong>{lead.status === "booked" ? "Booked" : "Open"}</strong>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function PageHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="crm-page-title">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="crm-page-actions">
        <button className="ghost-button">
          <Filter size={15} />
          Filter
        </button>
        <button className="ghost-button">
          <MoreVertical size={15} />
          More
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article>
      <div>
        <strong>{label}</strong>
        <span>{helper}</span>
      </div>
      <em>{value}</em>
    </article>
  );
}

function StackHealthCard() {
  return (
    <section className="crm-card stack-health-card">
      <div className="crm-card-header">
        <div>
          <h2>Stack Health</h2>
          <span>Free/trial tools currently represented in the mockup</span>
        </div>
      </div>
      <div className="stack-health-list">
        {integrations.slice(0, 7).map((integration) => (
          <article key={integration.id}>
            <span style={{ backgroundColor: integration.color }} />
            <div>
              <strong>{integration.provider}</strong>
              <small>{integration.limitNote}</small>
            </div>
            <em>{integration.state}</em>
          </article>
        ))}
      </div>
    </section>
  );
}

function StageBadge({ children }: { children: ReactNode }) {
  return <em className="automation-badge">{children}</em>;
}

function CrmDashboardView({
  activeNav,
  leads,
  selectedLead,
  stage,
  booking,
  messages,
  activities,
  kpis,
  onLeadSelect,
  onRun
}: {
  activeNav: string;
  leads: Lead[];
  selectedLead: Lead;
  stage: number;
  booking: Booking;
  messages: ReturnType<typeof getLeadMessages>;
  activities: ActivityLog[];
  kpis: ReturnType<typeof getProjectedKpis>;
  onLeadSelect: (id: string) => void;
  onRun: () => void;
}) {
  const pipelineValue = leads.reduce((total, lead) => total + lead.value, 0);
  const bookedCount = leads.filter((lead) => lead.status === "booked").length;

  return (
    <div className="crm-dashboard">
      <section className="crm-main">
        <div className="crm-page-title">
          <div>
            <h1>{activeNav === "Leads" ? "Leads" : activeNav}</h1>
            <p>AI-assisted lead response pipeline for Peak Home Services</p>
          </div>
          <div className="crm-page-actions">
            <button className="ghost-button">
              <Filter size={15} />
              Filter
            </button>
            <button className="ghost-button">
              <MoreVertical size={15} />
              Views
            </button>
          </div>
        </div>

        <CrmMetricStrip kpis={kpis} pipelineValue={pipelineValue} />
        <PipelineSummary leads={leads} selectedStatus={selectedLead.status} />

        <section className="crm-card crm-leads-card">
          <div className="crm-card-header">
            <div>
              <h2>Lead Records</h2>
              <span>
                {leads.length} total - {bookedCount} booked - synced to HubSpot and Sheets
              </span>
            </div>
            <label className="table-search">
              <Search size={15} />
              <input value="Search this view" readOnly />
            </label>
          </div>
          <LeadTable leads={leads} selectedLead={selectedLead} onLeadSelect={onLeadSelect} />
        </section>

        <section className="crm-lower-grid">
          <ActivityTimeline activities={activities} />
          <ConversationPreview lead={selectedLead} messages={messages} onRun={onRun} stage={stage} />
        </section>
      </section>

      <RecordPanel lead={selectedLead} booking={booking} activities={activities} stage={stage} onRun={onRun} />
    </div>
  );
}

function CrmMetricStrip({ kpis, pipelineValue }: { kpis: ReturnType<typeof getProjectedKpis>; pipelineValue: number }) {
  const metrics = [
    kpis[0],
    kpis[1],
    kpis[2],
    {
      ...kpis[3],
      label: "Est. Pipeline Value",
      value: pipelineValue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
      delta: "+21%"
    }
  ];

  return (
    <section className="crm-metrics">
      {metrics.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <article className="crm-metric" key={kpi.label}>
            <span className="crm-metric-icon">
              <Icon size={18} />
            </span>
            <div>
              <span>{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <small>{kpi.delta} this week</small>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function PipelineSummary({ leads, selectedStatus }: { leads: Lead[]; selectedStatus: LeadStatus }) {
  const stages = [
    { status: "new" as LeadStatus, label: "New", helper: "Needs first touch" },
    { status: "responding" as LeadStatus, label: "Contacted", helper: "AI in progress" },
    { status: "qualified" as LeadStatus, label: "Qualified", helper: "Ready to book" },
    { status: "booked" as LeadStatus, label: "Booked", helper: "Appointment set" },
    { status: "booked" as LeadStatus, label: "Won", helper: "Closed job" }
  ];

  return (
    <section className="pipeline-summary" aria-label="Pipeline stage summary">
      {stages.map((stageItem, index) => {
        const count = stageItem.label === "Won" ? 0 : leads.filter((lead) => lead.status === stageItem.status).length;
        const isSelected = selectedStatus === stageItem.status && stageItem.label !== "Won";
        return (
          <article className={isSelected ? "selected" : ""} key={`${stageItem.label}-${index}`}>
            <div>
              <strong>{stageItem.label}</strong>
              <span>{stageItem.helper}</span>
            </div>
            <em>{count}</em>
          </article>
        );
      })}
    </section>
  );
}

function LeadTable({ leads, selectedLead, onLeadSelect }: { leads: Lead[]; selectedLead: Lead; onLeadSelect: (id: string) => void }) {
  return (
    <div className="crm-table-wrap">
      <table className="crm-table">
        <thead>
          <tr>
            <th>Lead</th>
            <th>Source</th>
            <th>Service</th>
            <th>Value</th>
            <th>Stage</th>
            <th>Last Touch</th>
            <th>Owner</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const SourceIcon = sourceIcons[lead.source];
            return (
              <tr className={selectedLead.id === lead.id ? "selected" : ""} key={lead.id} onClick={() => onLeadSelect(lead.id)}>
                <td>
                  <button className="crm-lead-button">
                    <span className="source-dot" style={{ color: sourceColors[lead.source] }}>
                      <SourceIcon size={17} />
                    </span>
                    <span>
                      <strong>{lead.contact}</strong>
                      <small>{lead.phone}</small>
                    </span>
                  </button>
                </td>
                <td>{lead.source}</td>
                <td>{lead.service}</td>
                <td>{lead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}</td>
                <td>
                  <StagePill status={lead.status} />
                </td>
                <td>{lead.age}</td>
                <td>Jordan S.</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StagePill({ status }: { status: LeadStatus }) {
  return <span className={`stage-pill ${status}`}>{statusLabels[status]}</span>;
}

function RecordPanel({
  lead,
  booking,
  activities,
  stage,
  onRun
}: {
  lead: Lead;
  booking: Booking;
  activities: ActivityLog[];
  stage: number;
  onRun: () => void;
}) {
  return (
    <aside className="crm-record-panel">
      <div className="record-header">
        <span className="record-avatar">{lead.contact.split(" ").map((part) => part[0]).join("")}</span>
        <div>
          <h2>{lead.contact}</h2>
          <p>{lead.phone}</p>
        </div>
        <button aria-label="More record actions">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="record-actions">
        <button className="primary-button" onClick={onRun}>
          <Send size={15} />
          {stage >= 4 ? "Booked" : "Run AI Response"}
        </button>
        <button className="ghost-button">
          <Mail size={15} />
          Email
        </button>
      </div>

      <section className="record-section">
        <h3>Lead Details</h3>
        <div className="field-grid">
          <Field label="Source" value={lead.source} />
          <Field label="Stage" value={statusLabels[lead.status]} status={lead.status} />
          <Field label="Service" value={lead.service} />
          <Field label="Urgency" value={lead.urgency} />
          <Field label="Address" value={lead.address} wide />
          <Field label="Estimated Value" value={lead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} />
          <Field label="Owner" value="Jordan S." />
        </div>
      </section>

      <section className="record-section appointment-card">
        <h3>Next Appointment</h3>
        <div className={stage >= 4 ? "appointment-state booked" : "appointment-state"}>
          <CalendarCheck size={18} />
          <div>
            <strong>{stage >= 4 ? "Appointment booked" : "Slot prepared"}</strong>
            <span>{booking.slot}</span>
            <span>{booking.address}</span>
          </div>
        </div>
      </section>

      <section className="record-section">
        <h3>Integration Status</h3>
        <div className="mini-integration-grid">
          {integrations.slice(0, 6).map((integration) => (
            <span key={integration.id}>
              <CheckCircle2 size={14} />
              {integration.provider}
            </span>
          ))}
        </div>
      </section>

      <section className="record-section record-latest">
        <h3>Latest CRM Events</h3>
        {activities.slice(0, 3).map((activity) => (
          <div key={activity.id}>
            <strong>{activity.eventLabel}</strong>
            <span>{activity.timestamp}</span>
          </div>
        ))}
      </section>
    </aside>
  );
}

function Field({ label, value, status, wide = false }: { label: string; value: string; status?: LeadStatus; wide?: boolean }) {
  return (
    <div className={wide ? "field wide" : "field"}>
      <span>{label}</span>
      {status ? <StagePill status={status} /> : <strong>{value}</strong>}
    </div>
  );
}

function ActivityTimeline({ activities }: { activities: ActivityLog[] }) {
  return (
    <section className="crm-card timeline-card">
      <div className="crm-card-header">
        <div>
          <h2>Activity Timeline</h2>
          <span>CRM events created by the lead response workflow</span>
        </div>
      </div>
      <div className="timeline-list">
        {activities.map((activity) => (
          <article key={activity.id}>
            <span className={`timeline-dot ${activity.state}`} />
            <div>
              <strong>{activity.eventLabel}</strong>
              <p>{activity.detail}</p>
            </div>
            <time>{activity.timestamp}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConversationPreview({
  lead,
  messages,
  onRun,
  stage
}: {
  lead: Lead;
  messages: ReturnType<typeof getLeadMessages>;
  onRun: () => void;
  stage: number;
}) {
  return (
    <section className="crm-card conversation-preview-card">
      <div className="crm-card-header">
        <div>
          <h2>AI Conversation</h2>
          <span>
            {lead.source} - {lead.receivedAt}
          </span>
        </div>
        <button className="compact-run" onClick={onRun}>
          <SparkleMark />
          {stage >= 4 ? "Synced" : "Advance"}
        </button>
      </div>
      <div className="crm-message-list">
        {messages.slice(-4).map((message) => (
          <article key={message.id}>
            <span>{message.sender === "ai" ? "AI" : lead.contact.split(" ")[0]}</span>
            <p>{message.body}</p>
            <time>{message.time}</time>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardView({
  activeNav,
  leads,
  selectedLead,
  stage,
  booking,
  messages,
  activities,
  kpis,
  onLeadSelect,
  onRun
}: {
  activeNav: string;
  leads: Lead[];
  selectedLead: Lead;
  stage: number;
  booking: Booking;
  messages: ReturnType<typeof getLeadMessages>;
  activities: ActivityLog[];
  kpis: ReturnType<typeof getProjectedKpis>;
  onLeadSelect: (id: string) => void;
  onRun: () => void;
}) {
  return (
    <div className="dashboard">
      <section className="panel lead-panel">
        <PanelHeader title={activeNav === "Leads" ? "New Lead Response" : `${activeNav} Overview`} action={<Filter size={17} />} />
        <div className="tabs" role="tablist" aria-label="Lead filters">
          <button className="active">All (5)</button>
          <button>Unresponded (5)</button>
          <button>In Progress (0)</button>
          <button>Done</button>
        </div>
        <div className="lead-list">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} selected={lead.id === selectedLead.id} onClick={() => onLeadSelect(lead.id)} />
          ))}
        </div>
        <div className="panel-foot">
          <span>Showing 1-5 of 5</span>
          <RotateCcw size={17} />
        </div>
      </section>

      <section className="panel conversation-panel">
        <PanelHeader
          title="Conversation (AI Texting)"
          subtitle={`${selectedLead.source} · ${selectedLead.receivedAt}`}
          action={<MoreVertical size={18} />}
        />
        <div className="agent-status">
          <SparkleMark />
          <span>AI Agent: Peak AI Assistant (Text)</span>
          <strong>Active</strong>
        </div>
        <div className="conversation-stream" aria-label="AI conversation transcript">
          {messages.map((message) => (
            <div className={`message-row ${message.sender}`} key={message.id}>
              {message.sender === "ai" && <div className="bot-avatar">AI</div>}
              <div className="message-bubble">
                <p>{message.body}</p>
                <span>
                  {message.time}
                  {message.sender === "customer" && <Check size={13} />}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="composer">
          <input value={stage >= 4 ? "Appointment confirmed and CRM updated." : "Type a message..."} readOnly />
          <button aria-label="Attach file">
            <Paperclip size={16} />
          </button>
          <button aria-label="Email lead">
            <Mail size={16} />
          </button>
          <button aria-label="Send message" onClick={onRun}>
            <Send size={18} />
          </button>
        </div>
      </section>

      <aside className="right-column">
        <BookingPanel booking={booking} stage={stage} />
        <ActivityPanel activities={activities} />
      </aside>

      <aside className="panel stack-panel">
        <PanelHeader title="Free Trial Stack" />
        <div className="integration-list">
          {integrations.slice(0, 7).map((integration) => (
            <IntegrationRow key={integration.id} integration={integration} compact />
          ))}
        </div>
        <div className="monthly-cost">
          <span>Est. Monthly Cost (after trials)</span>
          <strong>~$15 / mo</strong>
        </div>
        <button className="wide-button">
          <Link2 size={16} />
          Manage Integrations
        </button>
      </aside>

      <section className="kpi-strip">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article className="kpi-card" key={kpi.label}>
              <Icon size={26} />
              <div>
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>
                  {kpi.delta} <em>vs yesterday</em>
                </small>
              </div>
              <svg viewBox="0 0 120 32" aria-hidden="true">
                <path d="M2 19 C18 31, 28 5, 43 15 S70 32, 87 17 S105 13, 118 16" />
              </svg>
            </article>
          );
        })}
      </section>

      <footer className="status-footer">
        <span>All times in Central Time (CT)</span>
        <span>Auto-refresh: On</span>
        <span>Data updates every 2 minutes</span>
      </footer>
    </div>
  );
}

function PanelHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="panel-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {action && <button aria-label={`${title} action`}>{action}</button>}
    </div>
  );
}

function LeadRow({ lead, selected, onClick }: { lead: Lead; selected: boolean; onClick: () => void }) {
  const SourceIcon = sourceIcons[lead.source];
  return (
    <button className={`lead-row ${selected ? "selected" : ""}`} onClick={onClick}>
      <span className="source-icon" style={{ background: sourceColors[lead.source] }}>
        <SourceIcon size={25} />
      </span>
      <span className="lead-main">
        <span>
          <strong>{lead.source}</strong>
          <small>· {lead.receivedAt}</small>
        </span>
        <em>{lead.contact}</em>
        <small>{lead.note}</small>
      </span>
      <span className="lead-meta">
        <small>{lead.age}</small>
        <em className={lead.status}>{statusLabels[lead.status]}</em>
      </span>
    </button>
  );
}

function BookingPanel({ booking, stage }: { booking: Booking; stage: number }) {
  const isBooked = stage >= 4;
  const isHeld = stage >= 3;

  return (
    <section className="panel booking-panel">
      <PanelHeader title="Booking" action={<CalendarCheck size={18} />} />
      <div className="booking-details">
        <div>
          <span>Service</span>
          <strong>{booking.service}</strong>
        </div>
        <div>
          <span>Address</span>
          <strong>{booking.address}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{booking.duration}</strong>
        </div>
      </div>

      <div className="slot-header">
        <div>
          <strong>Available Today</strong>
          <span>May 14, 2025</span>
        </div>
        <div>
          <button aria-label="Previous day">
            <ChevronLeft size={15} />
          </button>
          <button aria-label="Next day">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="slots">
        {slots.map((slot) => (
          <button className={slot === "2:00 PM" ? "selected" : ""} key={slot}>
            {slot}
          </button>
        ))}
      </div>

      <div className={`confirmation ${isBooked ? "booked" : isHeld ? "held" : ""}`}>
        <CheckCircle2 size={28} />
        <div>
          <strong>{isBooked ? "Appointment Booked" : isHeld ? "Appointment Held" : "Waiting for Qualification"}</strong>
          <span>{booking.slot}</span>
          <span>{booking.address}</span>
          <button>
            <CalendarCheck size={15} />
            View in Google Calendar
          </button>
        </div>
      </div>
    </section>
  );
}

function ActivityPanel({ activities }: { activities: ActivityLog[] }) {
  return (
    <section className="panel activity-panel">
      <PanelHeader title="CRM / Activity Log" action={<span>See all</span>} />
      <div className="activity-list">
        {activities.map((activity) => (
          <article className="activity-row" key={activity.id}>
            <span className={`activity-icon ${activity.provider.toLowerCase().replace(" ", "-")}`}>
              {activity.provider.slice(0, 1)}
            </span>
            <div>
              <strong>{activity.eventLabel}</strong>
              <span>{activity.detail}</span>
            </div>
            <small>{activity.timestamp}</small>
            {activity.state === "success" ? <CheckCircle2 size={17} /> : <MoreVertical size={17} />}
          </article>
        ))}
      </div>
    </section>
  );
}

function IntegrationRow({ integration, compact = false }: { integration: Integration; compact?: boolean }) {
  const Icon = integration.icon;
  return (
    <article className={`integration-row ${compact ? "compact" : ""}`}>
      <span className="integration-icon" style={{ backgroundColor: integration.color }}>
        <Icon size={compact ? 22 : 26} />
      </span>
      <div>
        <strong>{integration.provider}</strong>
        <span>
          {integration.state === "connected" ? "Connected" : integration.state === "trial" ? "Trial" : integration.state === "mocked" ? "Mocked" : "Optional"}
        </span>
        {!compact && <p>{integration.limitNote}</p>}
      </div>
      <small>{integration.cost}</small>
    </article>
  );
}

function SetupView({ integrations }: { integrations: Integration[] }) {
  return (
    <div className="setup-view" id="setup">
      <section className="setup-hero panel">
        <div>
          <h1>Free Trial Stack</h1>
          <p>Connect only what is needed for a credible demo, keep live credentials out of the mockup, and upgrade tools only when a client is ready to pilot.</p>
        </div>
        <div className="setup-summary">
          <strong>Mockup mode</strong>
          <span>No API keys required</span>
        </div>
      </section>

      <section className="setup-grid">
        <div className="panel setup-list-panel">
          <PanelHeader title="Tools To Connect" />
          <div className="setup-list">
            {integrations.map((integration) => (
              <IntegrationRow integration={integration} key={integration.id} />
            ))}
          </div>
        </div>

        <div className="panel launch-panel">
          <PanelHeader title="Build Checklist" />
          <ol className="checklist">
            {quickSetupSteps.map((step, index) => (
              <li key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="panel flow-panel">
          <PanelHeader title="Lead Flow" />
          <div className="flow-steps">
            {["Lead arrives", "AI qualifies", "Calendar booked", "HubSpot updated", "Sheets logged", "Owner alerted"].map((step, index) => (
              <div key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SparkleMark() {
  return (
    <span className="sparkle-mark" aria-hidden="true">
      <Sparkles size={16} />
    </span>
  );
}

function getActivities(lead: Lead, stage: number): ActivityLog[] {
  const existing = activityByLead[lead.id];
  if (existing && stage >= 4) return existing;

  if (stage >= 4) {
    return [
      {
        id: `${lead.id}-done-1`,
        provider: "HubSpot",
        eventLabel: "HubSpot Contact Created",
        detail: `${lead.contact} - ${lead.source}`,
        timestamp: lead.receivedAt,
        state: "success"
      },
      {
        id: `${lead.id}-done-2`,
        provider: "Google Sheets",
        eventLabel: "Google Sheets Row Logged",
        detail: `${lead.service} - ${lead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} est.`,
        timestamp: lead.receivedAt,
        state: "success"
      },
      {
        id: `${lead.id}-done-3`,
        provider: "Make",
        eventLabel: "Make Scenario Run",
        detail: "Lead Response Workflow",
        timestamp: lead.receivedAt,
        state: "success"
      }
    ];
  }

  const pending: ActivityLog[] = [
    {
      id: `${lead.id}-pending-1`,
      provider: "HubSpot",
      eventLabel: stage >= 3 ? "Contact Ready" : "Contact Pending",
      detail: `${lead.contact} - ${lead.source}`,
      timestamp: lead.receivedAt,
      state: stage >= 3 ? "success" : "pending"
    },
    {
      id: `${lead.id}-pending-2`,
      provider: "Google Sheets",
      eventLabel: stage >= 2 ? "Row Prepared" : "Waiting for Lead Details",
      detail: `${lead.service} - ${lead.value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} est.`,
      timestamp: lead.receivedAt,
      state: stage >= 2 ? "success" : "pending"
    },
    {
      id: `${lead.id}-pending-3`,
      provider: "Make",
      eventLabel: stage >= 1 ? "Scenario Running" : "Scenario Queued",
      detail: "Lead Response Workflow",
      timestamp: lead.receivedAt,
      state: stage >= 1 ? "success" : "pending"
    }
  ];

  return pending;
}

function getProjectedKpis(stage: number) {
  return kpis.map((kpi) => {
    if (kpi.label === "Booked Jobs") {
      return { ...kpi, value: stage >= 4 ? "8" : kpi.value };
    }
    if (kpi.label === "Recovered Missed Calls") {
      return { ...kpi, value: stage >= 1 ? "24" : kpi.value };
    }
    if (kpi.label === "Hot Leads Today") {
      return { ...kpi, value: stage >= 2 ? "13" : kpi.value };
    }
    return kpi;
  });
}

export default App;
