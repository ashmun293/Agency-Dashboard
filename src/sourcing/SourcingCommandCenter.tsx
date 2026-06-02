import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  Bookmark,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Columns3,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe2,
  LayoutGrid,
  List,
  MapPin,
  MoreVertical,
  Phone,
  Play,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X
} from "lucide-react";
import { sourcingApi, type RuntimeSettings } from "./api";
import type { DashboardUiState } from "./types";

type FindingStatus = "Drafted" | "Needs Review";
type NavLabel = "Dashboard" | "Findings" | "Agents" | "Outreach" | "Approvals" | "Exports" | "Settings";

type Finding = {
  company: string;
  vertical: string;
  score: number;
  status: FindingStatus;
  evidence: number;
  action: "Review outreach" | "Review score";
};

type Approval = {
  company: string;
  score: number;
  status: FindingStatus;
  updated: string;
  action: string;
};

const navItems: Array<{ label: NavLabel; icon: typeof LayoutGrid }> = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Findings", icon: Search },
  { label: "Agents", icon: Bot },
  { label: "Outreach", icon: Send },
  { label: "Approvals", icon: ShieldCheck },
  { label: "Exports", icon: Download },
  { label: "Settings", icon: Settings }
];

const agents = [
  { label: "Scraper Agent", icon: Globe2, status: "Completed", detail: "200 results", tone: "blue" },
  { label: "Evidence Agent", icon: FileText, status: "Completed", detail: "200 enriched", tone: "purple" },
  { label: "Scoring Agent", icon: Star, status: "Completed", detail: "200 scored", tone: "amber" },
  { label: "Outreach Agent", icon: Send, status: "In Progress", detail: "143 drafted", tone: "cyan" },
  { label: "Compliance Guard", icon: ShieldCheck, status: "Monitoring", detail: "No auto-send", tone: "green" }
];

const findings: Finding[] = [
  { company: "Sunset Pilates", vertical: "Fitness Studios", score: 86, status: "Drafted", evidence: 18, action: "Review outreach" },
  { company: "Westside Dental Group", vertical: "Dental Practices", score: 82, status: "Drafted", evidence: 21, action: "Review outreach" },
  { company: "Silverlake Coffee Roasters", vertical: "Cafes", score: 78, status: "Needs Review", evidence: 14, action: "Review score" },
  { company: "Echo Park Veterinary", vertical: "Veterinary", score: 74, status: "Drafted", evidence: 16, action: "Review outreach" },
  { company: "Mar Vista Cleaners", vertical: "Dry Cleaning", score: 71, status: "Needs Review", evidence: 12, action: "Review score" },
  { company: "Larchmont Med Spa", vertical: "Med Spas", score: 68, status: "Drafted", evidence: 17, action: "Review outreach" },
  { company: "DTLA Chiropractic", vertical: "Chiropractors", score: 64, status: "Needs Review", evidence: 11, action: "Review score" },
  { company: "Venice Boardwalk Retail", vertical: "Retail", score: 58, status: "Drafted", evidence: 9, action: "Review outreach" }
];

const approvals: Approval[] = [
  { company: "Sunset Pilates", score: 86, status: "Drafted", updated: "May 12, 9:41 AM", action: "Review outreach" },
  { company: "Westside Dental Group", score: 82, status: "Drafted", updated: "May 12, 9:35 AM", action: "Review outreach" },
  { company: "Silverlake Coffee Roasters", score: 78, status: "Needs Review", updated: "May 12, 9:10 AM", action: "Review score" },
  { company: "Echo Park Veterinary", score: 74, status: "Drafted", updated: "May 12, 8:58 AM", action: "Review outreach" }
];

const rubric = [
  { label: "Automation Fit", value: 22, max: 25, color: "green" },
  { label: "Operational Complexity", value: 18, max: 20, color: "green" },
  { label: "Online Presence", value: 16, max: 20, color: "amber" },
  { label: "Growth Potential", value: 15, max: 20, color: "amber" },
  { label: "Budget Indicators", value: 15, max: 15, color: "green" }
];

const evidence = [
  { label: "Website - Services & Pricing", date: "May 12" },
  { label: "Instagram - Active Engagement", date: "May 11" },
  { label: "GMB - 278 Reviews (4.8&#9733;)", date: "May 10" },
  { label: "Job Posting - Hiring Instructor", date: "May 9" },
  { label: "Tech Stack - Mindbody", date: "May 8" }
];

const defaultUiState: DashboardUiState = {
  location: "Los Angeles, CA",
  verticals: ["home-services", "property-management-real-estate", "legal-professional-services"],
  limit: 200,
  providerName: "google",
  scoringName: "openai"
};

export function SourcingCommandCenter() {
  const [activeNav, setActiveNav] = useState<NavLabel>("Dashboard");
  const [activeApprovalTab, setActiveApprovalTab] = useState("All (143)");
  const [selectedCompany, setSelectedCompany] = useState("Sunset Pilates");
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<RuntimeSettings>();
  const [uiState, setUiState] = useState<DashboardUiState>(defaultUiState);
  const [hasLoadedUiState, setHasLoadedUiState] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const selectedFinding = findings.find((finding) => finding.company === selectedCompany) ?? findings[0];

  useEffect(() => {
    let ignore = false;

    async function loadSavedUiState() {
      try {
        const config = await sourcingApi.loadConfig();
        if (ignore) return;
        setSettings(config.settings);
        setUiState(config.uiState);
        setHasLoadedUiState(true);
      } catch {
        if (!ignore) setSaveStatus("error");
      }
    }

    void loadSavedUiState();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedUiState) return undefined;
    const timeoutId = window.setTimeout(() => {
      void saveUiState(uiState, "saved");
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [hasLoadedUiState, uiState]);

  function updateUiState(update: Partial<DashboardUiState>) {
    setSaveStatus("idle");
    setUiState((current) => ({ ...current, ...update }));
  }

  async function saveUiState(nextUiState = uiState, successStatus: "idle" | "saved" = "saved") {
    setSaveStatus("saving");
    try {
      const saved = await sourcingApi.saveUiState(nextUiState);
      setUiState((current) => (areUiStatesEqual(current, saved.uiState) ? current : saved.uiState));
      setSaveStatus(successStatus);
    } catch {
      setSaveStatus("error");
    }
  }

  async function runRealTest() {
    setIsRunning(true);
    try {
      await saveUiState(uiState, "saved");
      await sourcingApi.startRun({
        location: uiState.location,
        verticals: uiState.verticals,
        limit: Math.min(uiState.limit, 20),
        providerName: uiState.providerName,
        scoringName: uiState.scoringName
      });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="mock-shell">
      <aside className="mock-sidebar">
        <div className="mock-brand">
          <span>LA</span>
          <strong>LA Automations</strong>
          <ChevronDown size={16} />
        </div>

        <nav aria-label="Sourcing navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={item.label === activeNav ? "active" : ""} key={item.label} onClick={() => setActiveNav(item.label)} type="button">
                <Icon size={21} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mock-sidebar-status">
          <ShieldCheck size={30} />
          <div>
            <strong>Compliance Guard</strong>
            <span>No auto-send <i /></span>
          </div>
        </div>

        <div className="mock-user">
          <span>JS</span>
          <div>
            <strong>Jamie Smith</strong>
            <small>Owner</small>
          </div>
          <ChevronDown size={16} />
        </div>
      </aside>

      <main className="mock-workspace">
        <div className="mock-utility">
          <span />
          <button className="mock-icon-alert" aria-label="Notifications" type="button">
            <Bell size={18} />
            <i>3</i>
          </button>
          <button aria-label="Help" type="button">
            <CircleHelp size={18} />
          </button>
        </div>

        <section className="mock-run-card" aria-label="Run controls">
          <div className="mock-section-title">Run Controls</div>
          <div className="mock-run-grid">
            <MockSelect icon={MapPin} label="Location" tone="blue">
              <input aria-label="Location" value={uiState.location} onChange={(event) => updateUiState({ location: event.target.value })} />
            </MockSelect>
            <MockSelect icon={BriefcaseBusiness} label="Verticals" value={`${uiState.verticals.length} selected`} />
            <MockSelect icon={List} label="Limit">
              <input
                aria-label="Limit"
                max={200}
                min={1}
                type="number"
                value={uiState.limit}
                onChange={(event) => updateUiState({ limit: Math.max(1, Math.min(200, Number.parseInt(event.target.value, 10) || 1)) })}
              />
            </MockSelect>
            <MockSelect icon={Globe2} label="Provider">
              <select aria-label="Provider" value={uiState.providerName} onChange={(event) => updateUiState({ providerName: event.target.value as DashboardUiState["providerName"] })}>
                <option value="fixture">Fixture</option>
                <option value="google">Google</option>
              </select>
            </MockSelect>
            <MockSelect icon={Sparkles} label="Scoring Rules" wide>
              <select aria-label="Scoring Rules" value={uiState.scoringName} onChange={(event) => updateUiState({ scoringName: event.target.value as DashboardUiState["scoringName"] })}>
                <option value="rules">Rules</option>
                <option value="openai">OpenAI (gpt-4o)</option>
              </select>
            </MockSelect>
            <div className="mock-run-actions">
              <button className="mock-save" disabled={saveStatus === "saving"} onClick={() => void saveUiState()} type="button">
                <Bookmark size={19} />
                {saveStatus === "saving" ? "Saving" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Retry Save" : "Save Run"}
              </button>
              <button className="mock-run" disabled={isRunning} onClick={runRealTest} type="button">
                <Play size={18} />
                {isRunning ? "Running" : "Run Now"}
              </button>
            </div>
          </div>
          <div className="mock-save-note">
            {settings?.persistenceProvider === "supabase" ? "Saving to Supabase" : "Saving locally until the Supabase server key is added"}
          </div>
        </section>

        {activeNav === "Dashboard" && (
          <DashboardView
            activeApprovalTab={activeApprovalTab}
            selectedFinding={selectedFinding}
            onApprovalTabChange={setActiveApprovalTab}
            onSelectCompany={setSelectedCompany}
          />
        )}
        {activeNav === "Findings" && <FindingsView selectedFinding={selectedFinding} onSelectCompany={setSelectedCompany} />}
        {activeNav === "Agents" && <AgentsView />}
        {activeNav === "Outreach" && <OutreachView />}
        {activeNav === "Approvals" && <ApprovalsView activeTab={activeApprovalTab} onTabChange={setActiveApprovalTab} />}
        {activeNav === "Exports" && <ExportsView />}
        {activeNav === "Settings" && <SettingsView />}
      </main>
    </div>
  );
}

function DashboardView({
  activeApprovalTab,
  selectedFinding,
  onApprovalTabChange,
  onSelectCompany
}: {
  activeApprovalTab: string;
  selectedFinding: Finding;
  onApprovalTabChange: (tab: string) => void;
  onSelectCompany: (company: string) => void;
}) {
  return (
    <section className="mock-top-grid">
      <div className="mock-left-column">
        <AgentRow />
        <FindingsPanel selectedCompany={selectedFinding.company} onSelect={onSelectCompany} />
        <ApprovalsPanel activeTab={activeApprovalTab} onTabChange={onApprovalTabChange} />
      </div>
      <ProspectDrawer finding={selectedFinding} />
    </section>
  );
}

function AgentRow() {
  return (
    <div className="mock-agent-row">
      {agents.map((agent) => {
        const Icon = agent.icon;
        return (
          <article className={`mock-agent-card ${agent.tone}`} key={agent.label}>
            <Icon size={31} />
            <div>
              <strong>{agent.label}</strong>
              <span className={agent.status === "Completed" ? "completed" : "active"}>
                {agent.status === "Completed" && <Check size={13} />}
                {agent.status}
                {agent.status === "In Progress" && <i />}
              </span>
              <small>{agent.detail}</small>
            </div>
            {agent.label !== "Compliance Guard" && <ChevronRight size={18} />}
          </article>
        );
      })}
    </div>
  );
}

function FindingsView({ selectedFinding, onSelectCompany }: { selectedFinding: Finding; onSelectCompany: (company: string) => void }) {
  return (
    <section className="mock-tab-page mock-tab-split">
      <div className="mock-left-column">
        <FindingsPanel selectedCompany={selectedFinding.company} onSelect={onSelectCompany} />
      </div>
      <ProspectDrawer finding={selectedFinding} />
    </section>
  );
}

function AgentsView() {
  return (
    <section className="mock-tab-page">
      <AgentRow />
      <div className="mock-tab-grid">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <article className="mock-tab-card" key={agent.label}>
              <Icon size={32} />
              <div>
                <h3>{agent.label}</h3>
                <p>{agent.status} - {agent.detail}</p>
              </div>
              <span>{agent.label === "Compliance Guard" ? "Guarded" : "Open"}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function OutreachView() {
  return (
    <section className="mock-tab-page mock-tab-split">
      <div className="mock-panel mock-outreach-page">
        <header>
          <h2>Outreach</h2>
          <div className="mock-table-tools">
            <button type="button"><Sparkles size={18} />Regenerate</button>
            <button type="button"><Send size={18} />Draft Selected</button>
          </div>
        </header>
        <div className="mock-outreach-list">
          {approvals.map((approval) => (
            <article key={approval.company}>
              <div>
                <strong>{approval.company}</strong>
                <span>{approval.action}</span>
              </div>
              <StatusBadge status={approval.status} />
              <button type="button">Review</button>
            </article>
          ))}
        </div>
      </div>
      <ProspectDrawer finding={findings[0]} />
    </section>
  );
}

function ApprovalsView({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <section className="mock-tab-page">
      <ApprovalsPanel activeTab={activeTab} onTabChange={onTabChange} />
    </section>
  );
}

function ExportsView() {
  return (
    <section className="mock-tab-page">
      <div className="mock-panel mock-export-page">
        <header>
          <h2>Exports</h2>
          <div className="mock-table-tools">
            <button type="button"><Download size={18} />Download CSV</button>
            <button type="button"><FileText size={18} />View Summary</button>
          </div>
        </header>
        <div className="mock-tab-grid">
          {["Prospects CSV", "Run Summary", "CRM Payload", "Outreach Log"].map((item) => (
            <article className="mock-tab-card" key={item}>
              <FileText size={30} />
              <div>
                <h3>{item}</h3>
                <p>Updated May 12 from the latest sourcing run.</p>
              </div>
              <span>Ready</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SettingsView() {
  return (
    <section className="mock-tab-page">
      <div className="mock-panel mock-settings-page">
        <header>
          <h2>Settings</h2>
        </header>
        <div className="mock-settings-list">
          <article>
            <span>Provider</span>
            <strong>Google</strong>
          </article>
          <article>
            <span>Scoring Rules</span>
            <strong>OpenAI (gpt-4o)</strong>
          </article>
          <article>
            <span>Compliance Guard</span>
            <strong>No auto-send</strong>
          </article>
          <article>
            <span>Owner</span>
            <strong>Jamie Smith</strong>
          </article>
        </div>
      </div>
    </section>
  );
}

function MockSelect({
  icon: Icon,
  label,
  value,
  tone,
  wide = false,
  children
}: {
  icon: typeof MapPin;
  label: string;
  value?: string;
  tone?: "blue";
  wide?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`mock-select ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <div>
        <Icon size={18} className={tone === "blue" ? "blue" : ""} />
        {children ?? <strong>{value}</strong>}
        <ChevronDown size={16} />
      </div>
    </div>
  );
}

function areUiStatesEqual(first: DashboardUiState, second: DashboardUiState) {
  return (
    first.location === second.location &&
    first.limit === second.limit &&
    first.providerName === second.providerName &&
    first.scoringName === second.scoringName &&
    first.verticals.length === second.verticals.length &&
    first.verticals.every((vertical, index) => vertical === second.verticals[index])
  );
}

function FindingsPanel({ selectedCompany, onSelect }: { selectedCompany: string; onSelect: (company: string) => void }) {
  return (
    <section className="mock-panel mock-findings">
      <header>
        <h2>Findings (200)</h2>
        <div className="mock-table-tools">
          <button type="button"><Filter size={18} />Filters</button>
          <button type="button"><Columns3 size={18} />Columns<ChevronDown size={14} /></button>
          <label>
            <Search size={18} />
            <input placeholder="Search findings..." />
          </label>
        </div>
      </header>

      <table>
        <thead>
          <tr>
            <th><span className="mock-checkbox" /></th>
            <th>Company</th>
            <th>Vertical</th>
            <th>Score <ChevronDown size={12} /></th>
            <th>Status</th>
            <th>Evidence</th>
            <th>Next Action</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {findings.map((finding) => (
            <tr className={finding.company === selectedCompany ? "selected" : ""} key={finding.company} onClick={() => onSelect(finding.company)}>
              <td>
                <span className={`mock-checkbox ${finding.company === selectedCompany ? "checked" : ""}`}>
                  {finding.company === selectedCompany && <Check size={12} />}
                </span>
              </td>
              <td>{finding.company}</td>
              <td>{finding.vertical}</td>
              <td><ScoreCircle score={finding.score} /></td>
              <td><StatusBadge status={finding.status} /></td>
              <td><FileText size={16} />{finding.evidence}</td>
              <td>{finding.action === "Review outreach" ? <Eye size={16} /> : <Search size={17} />}{finding.action}</td>
              <td><MoreVertical size={18} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer>
        <span>1-8 of 200</span>
        <div className="mock-pagination">
          <button disabled type="button"><ChevronLeft size={17} /></button>
          <button className="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">25</button>
          <button type="button"><ChevronRight size={17} /></button>
        </div>
      </footer>
    </section>
  );
}

function ProspectDrawer({ finding }: { finding: Finding }) {
  const details = getProspectDetails(finding);
  const websiteUrl = externalUrl(details.website);
  return (
    <aside className="mock-drawer">
      <header>
        <div>
          <h2>
            {finding.company}
            <a aria-label={`Open ${finding.company} website`} className="mock-title-link" href={websiteUrl} rel="noreferrer" target="_blank">
              <ExternalLink size={15} />
            </a>
          </h2>
          <p>{finding.vertical} <span>&bull;</span> Los Angeles, CA</p>
        </div>
        <button aria-label="Close" type="button"><X size={18} /></button>
      </header>

      <div className="mock-contact-row">
        <a className="mock-contact-link" href={websiteUrl} rel="noreferrer" target="_blank"><Globe2 size={15} />{details.website}</a>
        <span><Phone size={15} />{details.phone}</span>
        <span><MapPin size={15} />{details.neighborhood}</span>
      </div>

      <section className="mock-rubric">
        <div className="mock-drawer-heading">
          <h3>Rubric Scores</h3>
          <span>Total <strong>{finding.score}</strong> / 100</span>
        </div>
        {details.rubric.map((item) => (
          <div className="mock-rubric-row" key={item.label}>
            <span>{item.label}</span>
            <div><i className={item.color} style={{ width: `${(item.value / item.max) * 100}%` }} /></div>
            <strong>{item.value} / {item.max}</strong>
          </div>
        ))}
      </section>

      <section className="mock-evidence">
        <div className="mock-drawer-heading">
          <h3>Evidence (Top 5)</h3>
          <a>View all ({finding.evidence})</a>
        </div>
        {details.evidence.map((item) => (
          <div key={item.label}>
            <span>
              <FileText size={16} />
              {item.label.includes("Instagram") ? (
                <a className="mock-evidence-link" dangerouslySetInnerHTML={{ __html: item.label }} href={details.socialUrl} rel="noreferrer" target="_blank" />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: item.label }} />
              )}
            </span>
            <time>{item.date}</time>
          </div>
        ))}
      </section>

      <section className="mock-workflow">
        <h3>Likely Workflow</h3>
        <div className="mock-flow-icons">
          <FlowStep icon={Globe2} label="Scrape" complete />
          <FlowStep icon={FileText} label="Enrich" complete />
          <FlowStep icon={Star} label="Score" complete amber />
          <FlowStep icon={Send} label="Draft" cyan />
          <FlowStep icon={User} label="Approve" />
          <FlowStep icon={Send} label="Send" />
        </div>
      </section>

      <section className="mock-draft">
        <div className="mock-drawer-heading">
          <h3>Outreach Draft</h3>
          <a><Sparkles size={14} />Regenerate</a>
        </div>
        <div className="mock-email">
          <strong>Subject: Quick idea to streamline {finding.company} operations</strong>
          <p>Hi {finding.company} team,</p>
          <p>I help {details.outreachCategory} in LA save 5-10 hours per week with AI automations for scheduling, follow-ups, and client communications.</p>
          <p>Open to a quick 15-min chat next week?</p>
          <p>Best,<br />Jamie</p>
        </div>
        <div className="mock-approval-note"><ShieldCheck size={17} />Human approval required</div>
        <div className="mock-draft-actions">
          <button type="button">Edit Draft</button>
          <button type="button">Request Changes</button>
          <button className="primary" type="button"><Send size={17} />Approve &amp; Send<ChevronDown size={14} /></button>
        </div>
      </section>
    </aside>
  );
}

function externalUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function getProspectDetails(finding: Finding) {
  if (finding.company === "Sunset Pilates") {
    return {
      website: "sunsetpilates.com",
      socialUrl: "https://www.instagram.com/sunsetpilates/",
      phone: "(323) 555-0147",
      neighborhood: "West Hollywood, CA",
      outreachCategory: "fitness studios",
      rubric,
      evidence
    };
  }

  const slug = finding.company.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 22);
  const scoreOffset = Math.max(0, finding.score - 58);
  const rubricValues = [
    { label: "Automation Fit", value: Math.min(25, 14 + Math.round(scoreOffset / 3)), max: 25, color: finding.score >= 72 ? "green" : "amber" },
    { label: "Operational Complexity", value: Math.min(20, 12 + Math.round(scoreOffset / 4)), max: 20, color: finding.score >= 70 ? "green" : "amber" },
    { label: "Online Presence", value: Math.min(20, 11 + Math.round(scoreOffset / 5)), max: 20, color: "amber" },
    { label: "Growth Potential", value: Math.min(20, 10 + Math.round(scoreOffset / 5)), max: 20, color: finding.score >= 78 ? "green" : "amber" },
    { label: "Budget Indicators", value: Math.min(15, 8 + Math.round(scoreOffset / 6)), max: 15, color: finding.score >= 74 ? "green" : "amber" }
  ];

  return {
    website: `${slug}.com`,
    socialUrl: `https://www.instagram.com/${slug}/`,
    phone: `(323) 555-${String(1000 + finding.score).slice(1)}`,
    neighborhood: finding.company.includes("Venice") ? "Venice, CA" : finding.company.includes("DTLA") ? "Downtown LA, CA" : "Los Angeles, CA",
    outreachCategory: finding.vertical.toLowerCase(),
    rubric: rubricValues,
    evidence: [
      { label: "Website - Services & Contact", date: "May 12" },
      { label: "GMB - Review Activity", date: "May 11" },
      { label: `${finding.vertical} workflow signals`, date: "May 10" },
      { label: "Directory - Local listing", date: "May 9" },
      { label: "Tech Stack - Intake form", date: "May 8" }
    ]
  };
}

function ApprovalsPanel({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = ["All (143)", "Draft (96)", "Needs Review (32)", "Approved (11)", "Sent (4)"];

  return (
    <section className="mock-panel mock-approvals">
      <header>
        <h2>Approvals Queue</h2>
        <nav>
          {tabs.map((tab) => (
            <button className={tab === activeTab ? "active" : ""} key={tab} onClick={() => onTabChange(tab)} type="button">{tab}</button>
          ))}
        </nav>
      </header>

      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Score</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Next Action</th>
            <th>Owner</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {approvals.map((approval) => (
            <tr key={approval.company}>
              <td>{approval.company}</td>
              <td><ScoreCircle score={approval.score} small /></td>
              <td><StatusBadge status={approval.status} /></td>
              <td>{approval.updated}</td>
              <td>{approval.action}</td>
              <td><span className="mock-owner">JS</span></td>
              <td><MoreVertical size={17} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer>
        <a>View all approvals <ChevronRight size={17} /></a>
      </footer>
    </section>
  );
}

function FlowStep({
  icon: Icon,
  label,
  complete = false,
  amber = false,
  cyan = false
}: {
  icon: typeof Globe2;
  label: string;
  complete?: boolean;
  amber?: boolean;
  cyan?: boolean;
}) {
  return (
    <div className={`mock-flow-step ${amber ? "amber" : ""} ${cyan ? "cyan" : ""}`}>
      <Icon size={24} />
      <small>{label}</small>
      {complete && <Check size={11} />}
    </div>
  );
}

function ScoreCircle({ score, small = false }: { score: number; small?: boolean }) {
  const tone = score >= 80 ? "green" : score >= 70 ? "lime" : score >= 60 ? "amber" : "orange";
  return <span className={`mock-score ${tone} ${small ? "small" : ""}`}>{score}</span>;
}

function StatusBadge({ status }: { status: FindingStatus }) {
  return <span className={`mock-status ${status === "Drafted" ? "drafted" : "review"}`}>{status}</span>;
}
