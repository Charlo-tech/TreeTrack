import type { MessagingProvider, SendSMSInput, SendSMSResult } from "./types";

export class MockMessagingProvider implements MessagingProvider {
  async sendSMS(input: SendSMSInput): Promise<SendSMSResult> {
    await new Promise((r) => setTimeout(r, 80));
    return {
      status: "simulated",
      provider_message_id: `mock_${Date.now()}`,
      channel: "sms",
      recipient: input.recipient,
    };
  }

  async handleUSSD(phoneNumber: string, text: string): Promise<string> {
    const parts = text ? text.split("*") : [];
    const last = parts[parts.length - 1] ?? "";
    // Simple USSD flow for *384*TREES#
    if (!text || text === "") {
      return `CON TreeTrack — Report & Monitor
1. Report tree loss
2. Report fire
3. Report illegal clearing
4. Report tree health
5. Check assigned plot
6. Help`;
    }
    if (["1","2","3","4"].includes(last)) {
      const labels: Record<string,string> = { "1":"tree loss", "2":"fire", "3":"illegal clearing", "4":"tree health"};
      return `CON Report ${labels[last]} — describe location:
0. Back`;
    }
    if (text.includes("*") && parts.length>=2) {
      return `END Thank you. Your report has been queued for verification. Field team will follow up on ${phoneNumber}.`;
    }
    return `END Thank you for using TreeTrack.`;
  }
}
