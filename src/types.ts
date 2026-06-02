import type { LucideIcon } from "lucide-react";

export type LeadSource = "Missed Call" | "Website Form" | "Google Ads" | "Facebook" | "Yelp";
export type LeadStatus = "new" | "responding" | "qualified" | "booked";
export type Urgency = "Emergency" | "Today" | "This week" | "Flexible";
export type Sender = "ai" | "customer";
export type ActivityState = "success" | "pending" | "warning";
export type IntegrationState = "connected" | "trial" | "optional" | "mocked";

export type Lead = {
  id: string;
  source: LeadSource;
  contact: string;
  phone: string;
  email: string;
  service: string;
  note: string;
  urgency: Urgency;
  address: string;
  receivedAt: string;
  age: string;
  status: LeadStatus;
  value: number;
};

export type Message = {
  id: string;
  sender: Sender;
  channel: "sms" | "voice" | "email" | "chat";
  body: string;
  time: string;
  deliveryState: "sent" | "delivered" | "read";
  stage: number;
};

export type Booking = {
  service: string;
  slot: string;
  duration: string;
  address: string;
  confirmationState: "not-started" | "held" | "booked";
};

export type Integration = {
  id: string;
  provider: string;
  state: IntegrationState;
  cost: string;
  limitNote: string;
  role: string;
  sourceUrl: string;
  icon: LucideIcon;
  color: string;
};

export type ActivityLog = {
  id: string;
  provider: string;
  eventLabel: string;
  detail: string;
  timestamp: string;
  state: ActivityState;
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon: LucideIcon;
};
