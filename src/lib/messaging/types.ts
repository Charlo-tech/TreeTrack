export interface SendSMSInput {
  recipient: string;
  message: string;
  alert_id?: string;
}

export interface SendSMSResult {
  status: "sent" | "simulated" | "failed";
  provider_message_id?: string;
  channel: "sms";
  recipient: string;
}

export interface MessagingProvider {
  sendSMS(input: SendSMSInput): Promise<SendSMSResult>;
  // USSD is handled via route, but provider can optionally generate responses
  handleUSSD?(phoneNumber: string, text: string): Promise<string>;
}
