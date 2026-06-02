import type { BusinessCandidate } from "../types.js";

export const fixtureCandidates: BusinessCandidate[] = [
  {
    id: "fixture-pacific-coast-hvac",
    companyName: "Pacific Coast HVAC & Plumbing",
    website: "https://example.com/pacific-coast-hvac",
    industry: "HVAC and plumbing",
    vertical: "home-services",
    location: "Los Angeles, CA",
    estimatedSize: "25-50 employees",
    decisionMakerFound: true,
    targetRole: "Owner or Operations Manager",
    contactPath: "Website quote form and office phone",
    primaryWorkflow: "lead follow-up and appointment scheduling",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/pacific-coast-hvac",
        note: "Promotes emergency service, maintenance plans, online quote requests, and multiple service areas."
      },
      {
        sourceType: "review",
        sourceName: "Sample review signals",
        note: "Sample reviews mention missed callbacks and delayed arrival windows."
      },
      {
        sourceType: "job-posting",
        sourceName: "Sample hiring signal",
        note: "Sample dispatcher/coordinator hiring signal indicates daily scheduling volume."
      }
    ],
    signals: {
      clearOperationalPain: ["missed callbacks", "emergency service delays", "arrival-window coordination", "quote follow-up pressure"],
      repeatableWorkflow: ["quote requests", "service calls", "maintenance plan reminders", "dispatch scheduling"],
      digitalOrSemiDigitalProcess: ["online quote form", "email follow-up", "booking calendar", "CRM-ready lead capture"],
      enoughVolume: ["multiple service areas", "emergency jobs", "many review mentions", "dispatcher hiring"],
      budgetCapacity: ["high-ticket repairs", "maintenance plans", "multi-trade services", "paid ads implied"],
      decisionMakerAccess: ["owner-led business", "operations manager target", "direct web contact"],
      measurableBusinessOutcome: ["more booked calls", "faster quote response", "missed-call recovery", "review request automation"]
    }
  },
  {
    id: "fixture-westside-restoration",
    companyName: "Westside Restoration Response",
    website: "https://example.com/westside-restoration-response",
    industry: "Water damage restoration",
    vertical: "home-services",
    location: "Los Angeles, CA",
    estimatedSize: "20-40 employees",
    decisionMakerFound: true,
    targetRole: "General Manager",
    contactPath: "Emergency form, call line, and website contact page",
    primaryWorkflow: "emergency intake and claim document collection",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/westside-restoration-response",
        note: "Lists 24/7 intake, insurance claim coordination, photo uploads, and multiple restoration services."
      },
      {
        sourceType: "review",
        sourceName: "Sample review signals",
        note: "Sample reviews point to urgency, insurance paperwork, and status update expectations."
      }
    ],
    signals: {
      clearOperationalPain: ["urgent inbound calls", "claim paperwork", "customer status updates", "missed opportunity if response is slow"],
      repeatableWorkflow: ["damage intake", "photo collection", "insurance coordination", "appointment scheduling"],
      digitalOrSemiDigitalProcess: ["emergency intake form", "document uploads", "email-based claims", "job status updates"],
      enoughVolume: ["24/7 service", "multiple job types", "high-intent emergency traffic"],
      budgetCapacity: ["insurance-funded jobs", "high-ticket remediation", "commercial services"],
      decisionMakerAccess: ["general manager target", "contact form", "office line"],
      measurableBusinessOutcome: ["faster intake", "more captured emergency leads", "reduced admin paperwork", "cleaner claim updates"]
    }
  },
  {
    id: "fixture-bright-current-electric",
    companyName: "Bright Current Electric",
    website: "https://example.com/bright-current-electric",
    industry: "Electrical services",
    vertical: "home-services",
    location: "Los Angeles, CA",
    estimatedSize: "15-30 employees",
    decisionMakerFound: true,
    targetRole: "Operations Manager",
    contactPath: "Contact form and scheduling phone number",
    primaryWorkflow: "estimate requests and technician scheduling",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/bright-current-electric",
        note: "Offers panel upgrades, EV charger installs, troubleshooting, and commercial service requests."
      }
    ],
    signals: {
      clearOperationalPain: ["quote requests need triage", "permits and job details vary", "customer follow-up matters"],
      repeatableWorkflow: ["estimate intake", "site visit scheduling", "service reminders"],
      digitalOrSemiDigitalProcess: ["contact form", "email estimates", "photo requests"],
      enoughVolume: ["multiple service categories", "commercial and residential customers", "EV charger demand"],
      budgetCapacity: ["panel upgrades", "commercial jobs", "EV charger installs"],
      decisionMakerAccess: ["operations manager target", "direct contact form"],
      measurableBusinessOutcome: ["faster estimates", "better lead qualification", "fewer scheduling back-and-forths"]
    }
  },
  {
    id: "fixture-canyon-roofing-solar",
    companyName: "Canyon Roofing & Solar",
    website: "https://example.com/canyon-roofing-solar",
    industry: "Roofing and solar",
    vertical: "home-services",
    location: "Los Angeles, CA",
    estimatedSize: "30-75 employees",
    decisionMakerFound: true,
    targetRole: "Sales Manager",
    contactPath: "Estimate form and sales inquiry line",
    primaryWorkflow: "estimate qualification and proposal follow-up",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/canyon-roofing-solar",
        note: "Shows estimate forms, storm damage services, financing, and multiple sales consult workflows."
      }
    ],
    signals: {
      clearOperationalPain: ["proposal follow-up", "sales consult scheduling", "storm damage urgency"],
      repeatableWorkflow: ["roof inspections", "quote intake", "proposal reminders", "financing document collection"],
      digitalOrSemiDigitalProcess: ["estimate form", "financing forms", "email proposals"],
      enoughVolume: ["large service area", "paid lead channels implied", "high review count sample"],
      budgetCapacity: ["high-ticket roofs", "solar projects", "financing options"],
      decisionMakerAccess: ["sales manager target", "website contact"],
      measurableBusinessOutcome: ["more booked estimates", "faster proposal turnaround", "lead nurture automation"]
    }
  },
  {
    id: "fixture-echo-park-property-management",
    companyName: "Echo Park Property Management",
    website: "https://example.com/echo-park-property-management",
    industry: "Residential property management",
    vertical: "property-management-real-estate",
    location: "Los Angeles, CA",
    estimatedSize: "20-60 employees",
    decisionMakerFound: true,
    targetRole: "Managing Broker or Operations Manager",
    contactPath: "Owner inquiry form, tenant portal, and office email",
    primaryWorkflow: "tenant maintenance intake and owner reporting",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/echo-park-property-management",
        note: "Features tenant portal, owner statements, rental applications, maintenance requests, and vacancy listings."
      },
      {
        sourceType: "review",
        sourceName: "Sample review signals",
        note: "Sample tenant reviews mention delayed maintenance updates and communication loops."
      }
    ],
    signals: {
      clearOperationalPain: ["maintenance update delays", "owner reporting workload", "tenant communication pressure", "showing coordination"],
      repeatableWorkflow: ["maintenance tickets", "rental applications", "showing scheduling", "owner reports"],
      digitalOrSemiDigitalProcess: ["tenant portal", "online applications", "email updates", "document collection"],
      enoughVolume: ["many listed units", "tenant portal", "multiple neighborhoods", "recurring maintenance"],
      budgetCapacity: ["portfolio management fees", "multiple properties", "owner services"],
      decisionMakerAccess: ["managing broker target", "operations manager target", "contact page"],
      measurableBusinessOutcome: ["faster maintenance triage", "fewer tenant follow-ups", "cleaner owner reporting", "quicker showing scheduling"]
    }
  },
  {
    id: "fixture-metrolease-la",
    companyName: "MetroLease LA",
    website: "https://example.com/metrolease-la",
    industry: "Leasing and property management",
    vertical: "property-management-real-estate",
    location: "Los Angeles, CA",
    estimatedSize: "10-25 employees",
    decisionMakerFound: true,
    targetRole: "Leasing Director",
    contactPath: "Listing inquiry forms and office phone",
    primaryWorkflow: "renter inquiry response and showing scheduling",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "directory",
        sourceName: "Sample listing signals",
        note: "Sample listings indicate frequent renter inquiries and showing coordination."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/metrolease-la",
        note: "Includes online applications, unit availability, and inquiry forms."
      }
    ],
    signals: {
      clearOperationalPain: ["fast renter follow-up matters", "showing slots change", "application reminders"],
      repeatableWorkflow: ["listing inquiries", "showing scheduling", "application collection"],
      digitalOrSemiDigitalProcess: ["online listings", "application forms", "email and SMS coordination"],
      enoughVolume: ["multiple vacancies", "active listings", "daily inquiry potential"],
      budgetCapacity: ["leasing fees", "property portfolio", "management revenue"],
      decisionMakerAccess: ["leasing director target", "website contact"],
      measurableBusinessOutcome: ["more tours booked", "faster renter response", "higher application completion"]
    }
  },
  {
    id: "fixture-south-bay-hoa-rentals",
    companyName: "South Bay HOA & Rentals",
    website: "https://example.com/south-bay-hoa-rentals",
    industry: "HOA and rental management",
    vertical: "property-management-real-estate",
    location: "Los Angeles, CA",
    estimatedSize: "15-35 employees",
    decisionMakerFound: true,
    targetRole: "Community Manager",
    contactPath: "Resident portal and management contact form",
    primaryWorkflow: "resident request routing and board reporting",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "technology",
        sourceName: "Sample portal signal",
        note: "Sample public portal indicates structured resident requests and document workflows."
      }
    ],
    signals: {
      clearOperationalPain: ["resident request routing", "board packet preparation", "maintenance follow-up"],
      repeatableWorkflow: ["resident tickets", "document requests", "monthly reports"],
      digitalOrSemiDigitalProcess: ["resident portal", "email workflows", "PDF documents"],
      enoughVolume: ["multiple communities", "recurring monthly reporting"],
      budgetCapacity: ["management contracts", "HOA portfolios", "recurring fees"],
      decisionMakerAccess: ["community manager target", "contact form"],
      measurableBusinessOutcome: ["faster request triage", "less reporting admin", "clearer resident updates"]
    }
  },
  {
    id: "fixture-silver-lake-realty-group",
    companyName: "Silver Lake Realty Group",
    website: "https://example.com/silver-lake-realty-group",
    industry: "Residential real estate",
    vertical: "property-management-real-estate",
    location: "Los Angeles, CA",
    estimatedSize: "8-15 agents",
    decisionMakerFound: true,
    targetRole: "Broker Owner",
    contactPath: "Buyer/seller lead forms and agent emails",
    primaryWorkflow: "buyer lead qualification and appointment follow-up",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/silver-lake-realty-group",
        note: "Shows home valuation forms, buyer consult requests, and agent team pages."
      }
    ],
    signals: {
      clearOperationalPain: ["lead follow-up timing", "appointment nurture"],
      repeatableWorkflow: ["buyer forms", "seller valuation requests", "consult scheduling"],
      digitalOrSemiDigitalProcess: ["website forms", "email follow-ups"],
      enoughVolume: ["team page", "neighborhood focus"],
      budgetCapacity: ["commission-driven sales", "high-value transactions"],
      decisionMakerAccess: ["broker owner target", "visible team"],
      measurableBusinessOutcome: ["more consults booked", "faster lead response"]
    }
  },
  {
    id: "fixture-wilshire-client-intake-law",
    companyName: "Wilshire Client Intake Law Group",
    website: "https://example.com/wilshire-client-intake-law",
    industry: "Personal injury and employment law",
    vertical: "legal-professional-services",
    location: "Los Angeles, CA",
    estimatedSize: "25-75 employees",
    decisionMakerFound: true,
    targetRole: "Managing Partner or Intake Manager",
    contactPath: "Free consultation form, phone intake, and web chat",
    primaryWorkflow: "new client intake and document collection",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/wilshire-client-intake-law",
        note: "Uses consultation forms, web chat, multiple practice areas, and document-heavy case intake."
      },
      {
        sourceType: "job-posting",
        sourceName: "Sample hiring signal",
        note: "Sample intake coordinator posting suggests ongoing manual screening and CRM updates."
      }
    ],
    signals: {
      clearOperationalPain: ["intake screening load", "document collection", "follow-up windows", "case status questions"],
      repeatableWorkflow: ["consultation requests", "case qualification", "document intake", "appointment scheduling"],
      digitalOrSemiDigitalProcess: ["web chat", "consultation form", "email document collection", "CRM updates"],
      enoughVolume: ["multiple practice areas", "intake coordinator hiring", "paid lead likely"],
      budgetCapacity: ["high-value legal matters", "multi-attorney firm", "advertising-driven leads"],
      decisionMakerAccess: ["managing partner target", "intake manager target", "contact page"],
      measurableBusinessOutcome: ["faster intake response", "more qualified consults", "less manual CRM entry", "better document follow-up"]
    }
  },
  {
    id: "fixture-downtown-immigration-injury",
    companyName: "Downtown LA Immigration & Injury Law",
    website: "https://example.com/downtown-la-immigration-injury",
    industry: "Immigration and personal injury law",
    vertical: "legal-professional-services",
    location: "Los Angeles, CA",
    estimatedSize: "10-25 employees",
    decisionMakerFound: true,
    targetRole: "Office Manager",
    contactPath: "Consultation form and office email",
    primaryWorkflow: "consultation scheduling and client document reminders",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/downtown-la-immigration-injury",
        note: "Mentions free consultations, multilingual intake, document checklists, and case updates."
      }
    ],
    signals: {
      clearOperationalPain: ["consult scheduling", "document reminders", "multilingual follow-up"],
      repeatableWorkflow: ["new client forms", "document checklists", "appointment reminders"],
      digitalOrSemiDigitalProcess: ["consult form", "email reminders", "PDF collection"],
      enoughVolume: ["multiple practice areas", "consultation-focused site", "recurring document workflows"],
      budgetCapacity: ["legal service fees", "multi-staff office", "high-value cases"],
      decisionMakerAccess: ["office manager target", "contact page"],
      measurableBusinessOutcome: ["fewer missed consults", "faster document completion", "less admin follow-up"]
    }
  },
  {
    id: "fixture-ledgerworks-la",
    companyName: "LedgerWorks LA Accounting",
    website: "https://example.com/ledgerworks-la-accounting",
    industry: "Accounting and bookkeeping",
    vertical: "legal-professional-services",
    location: "Los Angeles, CA",
    estimatedSize: "8-20 employees",
    decisionMakerFound: true,
    targetRole: "Managing Partner",
    contactPath: "Client inquiry form and email",
    primaryWorkflow: "client onboarding and recurring document collection",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "website",
        sourceName: "Company website",
        url: "https://example.com/ledgerworks-la-accounting",
        note: "Lists bookkeeping, payroll, tax preparation, client portals, and monthly reporting."
      }
    ],
    signals: {
      clearOperationalPain: ["document chasing", "monthly reporting", "client onboarding"],
      repeatableWorkflow: ["monthly close", "receipt collection", "payroll reminders"],
      digitalOrSemiDigitalProcess: ["client portal", "spreadsheets", "PDF uploads"],
      enoughVolume: ["monthly client work", "multiple service lines"],
      budgetCapacity: ["recurring client revenue", "business clients", "tax services"],
      decisionMakerAccess: ["managing partner target", "contact form"],
      measurableBusinessOutcome: ["faster document collection", "cleaner reports", "less manual follow-up"]
    }
  },
  {
    id: "fixture-sunset-solo-handyman",
    companyName: "Sunset Solo Handyman",
    website: "https://example.com/sunset-solo-handyman",
    industry: "Handyman",
    vertical: "home-services",
    location: "Los Angeles, CA",
    estimatedSize: "1 employee",
    decisionMakerFound: false,
    targetRole: "Owner",
    contactPath: "Phone number only",
    primaryWorkflow: "basic job inquiries",
    isFixture: true,
    evidence: [
      {
        sourceType: "fixture",
        sourceName: "Sample fixture",
        note: "Fixture-only sample record for offline development; verify with live sources before outreach."
      },
      {
        sourceType: "directory",
        sourceName: "Sample directory listing",
        note: "Phone-only listing with no visible form, portal, team, hiring, or decision maker details."
      }
    ],
    signals: {
      clearOperationalPain: ["occasional missed calls"],
      repeatableWorkflow: ["small repair requests"],
      digitalOrSemiDigitalProcess: [],
      enoughVolume: [],
      budgetCapacity: [],
      decisionMakerAccess: [],
      measurableBusinessOutcome: ["faster callback"],
      disqualifiers: ["solo operator with low visible volume", "phone-only process", "no visible budget capacity"]
    }
  }
];
