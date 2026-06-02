import {
  Bot,
  CalendarDays,
  ClipboardCheck,
  FileSpreadsheet,
  Flame,
  Gauge,
  Globe2,
  Headphones,
  KanbanSquare,
  Megaphone,
  MessageSquareText,
  Phone,
  PlugZap,
  RadioTower,
  RefreshCw,
  Search,
  Settings,
  Sheet,
  Sparkles,
  Timer,
  UsersRound,
  Workflow,
  Zap
} from "lucide-react";
import type { ActivityLog, Booking, Integration, Kpi, Lead, Message } from "./types";

export const navItems = [
  { label: "Dashboard", icon: Gauge },
  { label: "Leads", icon: MessageSquareText },
  { label: "Contacts", icon: UsersRound },
  { label: "Pipeline", icon: KanbanSquare },
  { label: "Conversations", icon: RadioTower },
  { label: "Automations", icon: Workflow },
  { label: "Reports", icon: ClipboardCheck },
  { label: "Setup", icon: Settings }
];

export const seedLeads: Lead[] = [
  {
    id: "lead-1",
    source: "Missed Call",
    contact: "Tom Miller",
    phone: "+1 (615) 555-0199",
    email: "tom.miller@email.com",
    service: "AC not cooling",
    note: "HVAC not cooling",
    urgency: "Today",
    address: "1234 Maple Dr, Nashville, TN 37203",
    receivedAt: "10:32 AM",
    age: "Now",
    status: "new",
    value: 725
  },
  {
    id: "lead-2",
    source: "Website Form",
    contact: "Sarah Johnson",
    phone: "+1 (615) 555-0142",
    email: "sarah.j@email.com",
    service: "AC tune-up",
    note: "Looking for AC tune-up",
    urgency: "This week",
    address: "91 Oak Ridge Ct, Franklin, TN 37064",
    receivedAt: "9:48 AM",
    age: "44m ago",
    status: "new",
    value: 189
  },
  {
    id: "lead-3",
    source: "Google Ads",
    contact: "Derek Lee",
    phone: "+1 (615) 555-0128",
    email: "dlee@email.com",
    service: "Water heater replacement",
    note: "Replace water heater",
    urgency: "Today",
    address: "542 Pine St, Nashville, TN 37211",
    receivedAt: "9:15 AM",
    age: "1h ago",
    status: "new",
    value: 1850
  },
  {
    id: "lead-4",
    source: "Facebook",
    contact: "Mike Davis",
    phone: "+1 (615) 555-0174",
    email: "mike.davis@email.com",
    service: "Electrical panel upgrade",
    note: "Electrical panel upgrade",
    urgency: "This week",
    address: "18 Charlotte Ave, Nashville, TN 37209",
    receivedAt: "8:42 AM",
    age: "1h 30m ago",
    status: "new",
    value: 3200
  },
  {
    id: "lead-5",
    source: "Yelp",
    contact: "Amanda Lee",
    phone: "+1 (615) 555-0156",
    email: "amanda.lee@email.com",
    service: "Leaking kitchen sink",
    note: "Leaking kitchen sink",
    urgency: "Today",
    address: "77 Belmont Blvd, Nashville, TN 37212",
    receivedAt: "8:05 AM",
    age: "2h ago",
    status: "new",
    value: 420
  }
];

export const sourceIcons = {
  "Missed Call": Phone,
  "Website Form": Globe2,
  "Google Ads": Search,
  Facebook: Megaphone,
  Yelp: Flame
};

export const sourceColors = {
  "Missed Call": "#16a34a",
  "Website Form": "#2563eb",
  "Google Ads": "#f59e0b",
  Facebook: "#1877f2",
  Yelp: "#dc2626"
};

export const baseMessages: Record<string, Message[]> = {
  "lead-1": [
    {
      id: "m1",
      sender: "ai",
      channel: "sms",
      body: "Hi! Thanks for calling Peak Home Services. Sorry we missed your call. How can we help you today?",
      time: "10:33 AM",
      deliveryState: "sent",
      stage: 0
    },
    {
      id: "m2",
      sender: "customer",
      channel: "sms",
      body: "Hi, our AC stopped cooling this morning.",
      time: "10:33 AM",
      deliveryState: "read",
      stage: 0
    },
    {
      id: "m3",
      sender: "ai",
      channel: "sms",
      body: "I'm sorry to hear that. Let's get some quick details so I can help. What type of service do you need?",
      time: "10:33 AM",
      deliveryState: "sent",
      stage: 1
    },
    {
      id: "m4",
      sender: "customer",
      channel: "sms",
      body: "AC not cooling.",
      time: "10:33 AM",
      deliveryState: "read",
      stage: 1
    },
    {
      id: "m5",
      sender: "ai",
      channel: "sms",
      body: "Got it. Is this urgent or can it wait a day or two?",
      time: "10:33 AM",
      deliveryState: "sent",
      stage: 1
    },
    {
      id: "m6",
      sender: "customer",
      channel: "sms",
      body: "It's pretty urgent. It's 90 in here.",
      time: "10:34 AM",
      deliveryState: "read",
      stage: 2
    },
    {
      id: "m7",
      sender: "ai",
      channel: "sms",
      body: "Understood. What is your address?",
      time: "10:34 AM",
      deliveryState: "sent",
      stage: 2
    },
    {
      id: "m8",
      sender: "customer",
      channel: "sms",
      body: "1234 Maple Dr, Nashville, TN 37203",
      time: "10:34 AM",
      deliveryState: "read",
      stage: 2
    },
    {
      id: "m9",
      sender: "ai",
      channel: "sms",
      body: "Great, I have that. Would you like the earliest available appointment today?",
      time: "10:34 AM",
      deliveryState: "sent",
      stage: 3
    },
    {
      id: "m10",
      sender: "customer",
      channel: "sms",
      body: "Yes please.",
      time: "10:34 AM",
      deliveryState: "read",
      stage: 3
    },
    {
      id: "m11",
      sender: "ai",
      channel: "sms",
      body: "You're all set. I've booked the earliest slot below. We'll see you soon!",
      time: "10:34 AM",
      deliveryState: "delivered",
      stage: 4
    }
  ]
};

export const bookingByLead: Record<string, Booking> = {
  "lead-1": {
    service: "AC Not Cooling",
    slot: "Today, 2:00 PM - 4:00 PM",
    duration: "120 minutes",
    address: "1234 Maple Dr, Nashville, TN 37203",
    confirmationState: "booked"
  },
  "lead-2": {
    service: "AC Tune-up",
    slot: "Tomorrow, 10:00 AM - 11:00 AM",
    duration: "60 minutes",
    address: "91 Oak Ridge Ct, Franklin, TN 37064",
    confirmationState: "held"
  },
  "lead-3": {
    service: "Water Heater Replacement",
    slot: "Today, 3:00 PM - 5:00 PM",
    duration: "120 minutes",
    address: "542 Pine St, Nashville, TN 37211",
    confirmationState: "held"
  },
  "lead-4": {
    service: "Electrical Panel Upgrade",
    slot: "Friday, 9:00 AM - 11:00 AM",
    duration: "120 minutes",
    address: "18 Charlotte Ave, Nashville, TN 37209",
    confirmationState: "not-started"
  },
  "lead-5": {
    service: "Kitchen Sink Leak",
    slot: "Today, 5:00 PM - 6:00 PM",
    duration: "60 minutes",
    address: "77 Belmont Blvd, Nashville, TN 37212",
    confirmationState: "held"
  }
};

export const activityByLead: Record<string, ActivityLog[]> = {
  "lead-1": [
    {
      id: "a1",
      provider: "HubSpot",
      eventLabel: "HubSpot Contact Created",
      detail: "Tom Miller - lead source: Missed Call",
      timestamp: "10:34 AM",
      state: "success"
    },
    {
      id: "a2",
      provider: "Google Sheets",
      eventLabel: "Google Sheets Row Logged",
      detail: "Lead_2025-05-14_1032",
      timestamp: "10:34 AM",
      state: "success"
    },
    {
      id: "a3",
      provider: "Make",
      eventLabel: "Make Scenario Run",
      detail: "Lead Response Workflow",
      timestamp: "10:34 AM",
      state: "success"
    }
  ]
};

export const integrations: Integration[] = [
  {
    id: "vapi",
    provider: "Vapi",
    state: "connected",
    cost: "$0 / mo test",
    limitNote: "Build plan, usage-based call minutes; good for voice agent demos.",
    role: "Voice AI for missed-call response and call transfer.",
    sourceUrl: "https://vapi.ai/pricing",
    icon: Bot,
    color: "#00b894"
  },
  {
    id: "make",
    provider: "Make",
    state: "connected",
    cost: "$0 / mo",
    limitNote: "Free plan: 1,000 credits/month, 2 active scenarios, 15-minute scheduled interval.",
    role: "Routes leads between forms, CRM, calendar, sheets, and alerts.",
    sourceUrl: "https://www.make.com/en/pricing",
    icon: Workflow,
    color: "#7c3aed"
  },
  {
    id: "hubspot",
    provider: "HubSpot",
    state: "connected",
    cost: "$0 / mo",
    limitNote: "Free CRM for lead/contact management, forms, meetings, and basic pipeline tracking.",
    role: "Primary lead record and sales pipeline view.",
    sourceUrl: "https://www.hubspot.com/products/crm/lead-management",
    icon: PlugZap,
    color: "#ff5c35"
  },
  {
    id: "sheets",
    provider: "Google Sheets",
    state: "connected",
    cost: "$0 / mo",
    limitNote: "No additional API cost inside quota; useful as an audit log.",
    role: "Transparent backup log of every lead and AI action.",
    sourceUrl: "https://developers.google.com/workspace/sheets/api/limits",
    icon: Sheet,
    color: "#16a34a"
  },
  {
    id: "calendar",
    provider: "Google Calendar",
    state: "connected",
    cost: "$0 / mo",
    limitNote: "Quota-limited calendar reads/writes for booking slots.",
    role: "Appointment availability and confirmation events.",
    sourceUrl: "https://developers.google.com/calendar/api/guides/quota",
    icon: CalendarDays,
    color: "#2563eb"
  },
  {
    id: "openai",
    provider: "OpenAI",
    state: "mocked",
    cost: "API billed",
    limitNote: "Used for qualification, summaries, and response generation in a real build.",
    role: "Reasoning layer for lead qualification and CRM summaries.",
    sourceUrl: "https://openai.com/api/pricing/",
    icon: Sparkles,
    color: "#111827"
  },
  {
    id: "twilio",
    provider: "Twilio",
    state: "trial",
    cost: "Trial 30d",
    limitNote: "Optional SMS/phone testing; trial accounts are restricted to verified recipients.",
    role: "Fallback SMS/telephony transport when not using Vapi-native channels.",
    sourceUrl: "https://www.twilio.com/docs/usage/trials",
    icon: RefreshCw,
    color: "#f43f5e"
  },
  {
    id: "vercel",
    provider: "Vercel",
    state: "optional",
    cost: "$0 Hobby",
    limitNote: "Free Hobby plan is enough to host the static mockup.",
    role: "Shareable deployment for client demos.",
    sourceUrl: "https://vercel.com/pricing",
    icon: Zap,
    color: "#111827"
  }
];

export const kpis: Kpi[] = [
  { label: "Avg. Response Time", value: "38s", delta: "+18%", trend: "up", icon: Timer },
  { label: "Recovered Missed Calls", value: "23", delta: "+27%", trend: "up", icon: Phone },
  { label: "Booked Jobs", value: "7", delta: "+40%", trend: "up", icon: CalendarDays },
  { label: "Hot Leads Today", value: "12", delta: "+33%", trend: "up", icon: Flame }
];

export const quickSetupSteps = [
  "Create Vapi assistant and test phone number",
  "Create Make webhook scenario for new lead events",
  "Connect HubSpot contact and deal creation",
  "Append every event to Google Sheets",
  "Check Google Calendar availability before booking",
  "Add OpenAI key only when moving past mocked responses",
  "Use Twilio only for optional SMS/phone transport testing"
];

export function getLeadMessages(lead: Lead, stage: number): Message[] {
  const messages = baseMessages[lead.id];
  if (messages) return messages.filter((message) => message.stage <= stage);

  const fallbackMessages: Message[] = [
    {
      id: `${lead.id}-m1`,
      sender: "ai",
      channel: lead.source === "Website Form" ? "email" : "sms",
      body: `Hi ${lead.contact.split(" ")[0]}, this is Peak Home Services. I saw your ${lead.source.toLowerCase()} request for ${lead.service}. Are you still looking for help?`,
      time: lead.receivedAt,
      deliveryState: "sent",
      stage: 0
    },
    {
      id: `${lead.id}-m2`,
      sender: "customer",
      channel: "sms",
      body: "Yes, I still need help.",
      time: lead.receivedAt,
      deliveryState: "read",
      stage: 1
    },
    {
      id: `${lead.id}-m3`,
      sender: "ai",
      channel: "sms",
      body: `Got it. Is this urgent today, or should I find the next available ${lead.service.toLowerCase()} slot?`,
      time: lead.receivedAt,
      deliveryState: "sent",
      stage: 2
    },
    {
      id: `${lead.id}-m4`,
      sender: "customer",
      channel: "sms",
      body: lead.urgency === "Today" ? "Today if possible." : "This week works.",
      time: lead.receivedAt,
      deliveryState: "read",
      stage: 3
    },
    {
      id: `${lead.id}-m5`,
      sender: "ai",
      channel: "sms",
      body: `Perfect. I have ${lead.address}. I can hold ${bookingByLead[lead.id].slot}.`,
      time: lead.receivedAt,
      deliveryState: "delivered",
      stage: 4
    }
  ];

  return fallbackMessages.filter((message) => message.stage <= stage);
}
