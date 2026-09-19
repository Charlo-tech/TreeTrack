import type { MessagingProvider, SendSMSInput, SendSMSResult } from "./types";

export class AfricasTalkingProvider implements MessagingProvider {
  private username: string;
  private apiKey: string;
  private senderId?: string;

  constructor(opts: { username: string; apiKey: string; senderId?: string }) {
    this.username = opts.username;
    this.apiKey = opts.apiKey;
    this.senderId = opts.senderId;
  }

  async sendSMS(input: SendSMSInput): Promise<SendSMSResult> {
    try {
      const form = new URLSearchParams();
      form.set("username", this.username);
      form.set("to", input.recipient);
      form.set("message", input.message);
      if (this.senderId) form.set("from", this.senderId);

      const res = await fetch("https://api.africastalking.com/version1/messaging", {
        method: "POST",
        headers: {
          apiKey: this.apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: form.toString(),
      });

      if (!res.ok) throw new Error(`AT error ${res.status}`);
      const data = await res.json();
      const recipient = data?.SMSMessageData?.Recipients?.[0];
      return {
        status: recipient?.status === "Success" ? "sent" : "failed",
        provider_message_id: recipient?.messageId ?? `at_${Date.now()}`,
        channel: "sms",
        recipient: input.recipient,
      };
    } catch {
      return { status: "failed", channel: "sms", recipient: input.recipient };
    }
  }
}

export function getMessagingProvider(): MessagingProvider {
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  if (username && apiKey) {
    return new AfricasTalkingProvider({
      username,
      apiKey,
      senderId: process.env.AT_SENDER_ID,
    });
  }
  const { MockMessagingProvider } = require("./mock");
  return new MockMessagingProvider();
}
