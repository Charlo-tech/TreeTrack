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
    // Normalize: AT sends text like "1*2*hello", no serviceCode prefix. Trim and decode.
    const clean = (text ?? "").trim();
    const parts = clean ? clean.split("*") : [];
    const last = parts[parts.length - 1] ?? "";

    // Level 0 - main menu (AT spec: must start exactly with CON, no leading spaces/BOM)
    if (!clean || clean === "") {
      return [
        "CON TreeTrack - Report & Monitor",
        "1. Report tree loss",
        "2. Report fire",
        "3. Report illegal clearing",
        "4. Report tree health",
        "5. Check assigned plot",
        "6. Help",
      ].join("\n");
    }

    // Level 1 - submenu for 1-4
    if (clean === "1" || clean === "2" || clean === "3" || clean === "4") {
      const labels: Record<string, string> = {
        "1": "tree loss",
        "2": "fire",
        "3": "illegal clearing",
        "4": "tree health",
      };
      return [
        `CON Report ${labels[clean]} - describe location/plot:`,
        "e.g. C3 eastern edge",
        "0. Back",
      ].join("\n");
    }

    // Level 1 - check assigned plot
    if (clean === "5") {
      return `END Assigned plot for ${phoneNumber || "your number"}: C3 (18.2 ha) - Kiambu. Health 31/100 critical. Dial 1-4 to report.`;
    }

    // Level 1 - help
    if (clean === "6") {
      return `END TreeTrack Help: Dial *384*TREES# and pick 1-5. Reports are verified and create alerts. SMS to +254700725236 for field team.`;
    }

    // Back
    if (last === "0") {
      return [
        "CON TreeTrack - Report & Monitor",
        "1. Report tree loss",
        "2. Report fire",
        "3. Report illegal clearing",
        "4. Report tree health",
        "5. Check assigned plot",
        "6. Help",
      ].join("\n");
    }

    // Level 2 - has description -> finalize
    if (clean.includes("*") && parts.length >= 2) {
      const choice = parts[0];
      const labels: Record<string, string> = {
        "1": "tree loss",
        "2": "fire",
        "3": "illegal clearing",
        "4": "tree health",
      };
      const kind = labels[choice] ?? "report";
      // keep description short to stay <160 chars total
      return `END Thank you. Your ${kind} report queued for verification. Field team will follow up on ${phoneNumber || "your number"}. Ref: TT-${Date.now().toString().slice(-6)}`;
    }

    // Fallback
    return `END Thank you for using TreeTrack.`;
  }
}
