import fs from "node:fs/promises";
import type { GmailSendRequest, GmailSendResult, SenderSettings } from "../types.js";

type GmailTokenFile = {
  access_token?: string;
};

export class GmailSender {
  constructor(private readonly settings: SenderSettings) {}

  async send(request: GmailSendRequest): Promise<GmailSendResult> {
    if (this.settings.sendMode !== "live") {
      return {
        status: "would-send",
        provider: "test-mode",
        detail: `Test mode: Gmail API was not called. Would send to ${request.to}.`
      };
    }

    const token = await this.readAccessToken();
    const raw = buildRawMessage(request);
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw })
    });

    if (!response.ok) {
      return {
        status: "failed",
        provider: "gmail",
        detail: `Gmail API failed with ${response.status}: ${await response.text()}`
      };
    }

    const payload = (await response.json()) as { id?: string };
    return {
      status: "sent",
      provider: "gmail",
      messageId: payload.id,
      detail: `Sent with Gmail message id ${payload.id ?? "unknown"}.`
    };
  }

  private async readAccessToken(): Promise<string> {
    const raw = await fs.readFile(this.settings.gmailTokenPath, "utf8");
    const tokenFile = JSON.parse(raw) as GmailTokenFile;
    if (!tokenFile.access_token) {
      throw new Error(`Missing access_token in Gmail token file: ${this.settings.gmailTokenPath}`);
    }
    return tokenFile.access_token;
  }
}

function buildRawMessage(request: GmailSendRequest): string {
  const from = `${request.fromName} <${request.fromEmail}>`;
  const mime = [
    `From: ${from}`,
    `To: ${request.to}`,
    `Subject: ${request.subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    request.body
  ].join("\r\n");
  return Buffer.from(mime).toString("base64url");
}
