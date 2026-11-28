import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendOwnerAlert: vi.fn(),
  adminRecipient: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendOwnerAlert: mocks.sendOwnerAlert,
  adminRecipient: mocks.adminRecipient,
}));

const { POST } = await import("@/app/api/resend/webhook/route");

const KEY = Buffer.from("resend-test-signing-key");
const SECRET = `whsec_${KEY.toString("base64")}`;

function sign(id: string, timestamp: string, body: string, key = KEY): string {
  return `v1,${createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64")}`;
}

function request(
  payload: unknown,
  opts: { signature?: string; timestamp?: string; unsigned?: boolean } = {}
): NextRequest {
  const body = JSON.stringify(payload);
  const id = "msg_1";
  const timestamp = opts.timestamp ?? String(Math.floor(Date.now() / 1000));
  const headers: Record<string, string> = opts.unsigned
    ? {}
    : {
        "svix-id": id,
        "svix-timestamp": timestamp,
        "svix-signature": opts.signature ?? sign(id, timestamp, body),
      };
  return new Request("https://www.velvea.ca/api/resend/webhook", {
    method: "POST",
    headers,
    body,
  }) as unknown as NextRequest;
}

const bounced = {
  type: "email.bounced",
  data: {
    to: ["Anna@Example.com"],
    subject: "Your Velvea order VLV-1001",
    bounce: { message: "The recipient's mailbox does not exist." },
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  process.env.RESEND_WEBHOOK_SECRET = SECRET;
  mocks.adminRecipient.mockReturnValue("owner@velvea.ca");
  mocks.sendOwnerAlert.mockResolvedValue(true);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.RESEND_WEBHOOK_SECRET;
});

describe("POST /api/resend/webhook", () => {
  it("returns 503 when RESEND_WEBHOOK_SECRET is missing", async () => {
    delete process.env.RESEND_WEBHOOK_SECRET;
    const res = await POST(request(bounced));
    expect(res.status).toBe(503);
    expect(mocks.sendOwnerAlert).not.toHaveBeenCalled();
  });

  it("rejects an unsigned request", async () => {
    const res = await POST(request(bounced, { unsigned: true }));
    expect(res.status).toBe(400);
    expect(mocks.sendOwnerAlert).not.toHaveBeenCalled();
  });

  it("rejects a signature made with another key", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = sign("msg_1", timestamp, JSON.stringify(bounced), Buffer.from("someone-else"));
    const res = await POST(request(bounced, { signature, timestamp }));
    expect(res.status).toBe(400);
    expect(mocks.sendOwnerAlert).not.toHaveBeenCalled();
  });

  it("rejects a correctly signed but stale request (replay)", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000) - 60 * 60);
    const res = await POST(request(bounced, { timestamp }));
    expect(res.status).toBe(400);
    expect(mocks.sendOwnerAlert).not.toHaveBeenCalled();
  });

  it("accepts any matching entry when several signatures are sent (secret rotation)", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify(bounced);
    const signature = `${sign("msg_1", timestamp, body, Buffer.from("old-key"))} ${sign("msg_1", timestamp, body)}`;
    const res = await POST(request(bounced, { signature, timestamp }));
    expect(res.status).toBe(200);
    expect(mocks.sendOwnerAlert).toHaveBeenCalledTimes(1);
  });

  it("alerts the owner about a bounce with the recipient, subject and reason", async () => {
    const res = await POST(request(bounced));
    expect(res.status).toBe(200);
    expect(mocks.sendOwnerAlert).toHaveBeenCalledTimes(1);
    const [subject, text] = mocks.sendOwnerAlert.mock.calls[0]!;
    expect(subject).toBe("Email to anna@example.com bounced");
    expect(text).toContain('"Your Velvea order VLV-1001"');
    expect(text).toContain("The recipient's mailbox does not exist.");
  });

  it.each(["email.complained", "email.delivery_delayed", "email.failed", "email.suppressed"])(
    "alerts on %s",
    async (type) => {
      const res = await POST(request({ ...bounced, type }));
      expect(res.status).toBe(200);
      expect(mocks.sendOwnerAlert).toHaveBeenCalledTimes(1);
    }
  );

  it.each(["email.sent", "email.delivered", "email.opened"])("acknowledges %s without alerting", async (type) => {
    const res = await POST(request({ ...bounced, type }));
    expect(res.status).toBe(200);
    expect(mocks.sendOwnerAlert).not.toHaveBeenCalled();
  });

  it("does not alert about mail to the owner inbox, which would loop", async () => {
    const res = await POST(
      request({ ...bounced, data: { ...bounced.data, to: ["Owner@velvea.ca"], subject: "[Velvea alert] x" } })
    );
    expect(res.status).toBe(200);
    expect(mocks.sendOwnerAlert).not.toHaveBeenCalled();
  });
});
