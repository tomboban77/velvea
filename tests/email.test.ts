import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  constructedWith: [] as string[],
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
    constructor(key: string) {
      mocks.constructedWith.push(key);
    }
  },
}));

// email.ts -> tokens.ts -> prisma.ts; never construct a real client.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

// FROM / REPLY_TO / SITE are read once at import, so set them before loading.
process.env.RESEND_API_KEY = "re_test_key";
process.env.EMAIL_FROM = "Velvea <hello@velvea.ca>";
process.env.EMAIL_REPLY_TO = "Velvea Support <support@velvea.ca>";
process.env.NEXT_PUBLIC_SITE_URL = "https://www.velvea.ca/";

const { sendEmailVerification } = await import("@/lib/email");

beforeEach(() => {
  vi.resetAllMocks();
  mocks.constructedWith.length = 0;
  process.env.RESEND_API_KEY = "re_test_key";
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sendEmailVerification", () => {
  it("returns true when Resend accepts the message", async () => {
    mocks.send.mockResolvedValue({ data: { id: "em_1" }, error: null });

    await expect(
      sendEmailVerification({ email: "anna@example.com", token: "tok" })
    ).resolves.toBe(true);

    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("[email sent] id=em_1"));
  });

  it("returns false and logs when Resend reports an error in the resolved value", async () => {
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", statusCode: 403, message: "Domain is not verified" },
    });

    await expect(
      sendEmailVerification({ email: "anna@example.com", token: "tok" })
    ).resolves.toBe(false);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [message, context] = (console.error as unknown as ReturnType<typeof vi.fn>).mock
      .calls[0]!;
    expect(message).toBe("Email send rejected (validation_error 403): Domain is not verified");
    expect(context).toEqual({
      from: "Velvea <hello@velvea.ca>",
      to: "anna@example.com",
      subject: "Confirm your Velvea email",
    });
    expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining("[email sent]"));
  });

  it("omits the status code from the log when Resend does not supply one", async () => {
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: "application_error", message: "Something went wrong" },
    });

    await sendEmailVerification({ email: "anna@example.com", token: "tok" });

    expect(console.error).toHaveBeenCalledWith(
      "Email send rejected (application_error): Something went wrong",
      expect.any(Object)
    );
  });

  it("returns false and logs when the SDK throws", async () => {
    mocks.send.mockRejectedValue(new Error("ECONNRESET"));

    await expect(
      sendEmailVerification({ email: "anna@example.com", token: "tok" })
    ).resolves.toBe(false);

    expect(console.error).toHaveBeenCalledWith(
      "Email send failed:",
      expect.any(Error),
      expect.objectContaining({ to: "anna@example.com" })
    );
  });

  it("returns false without calling Resend when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;

    await expect(
      sendEmailVerification({ email: "anna@example.com", token: "tok" })
    ).resolves.toBe(false);

    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.constructedWith).toEqual([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[email not sent - RESEND_API_KEY missing]")
    );
  });

  it("builds the client with the API key and sends the expected payload", async () => {
    mocks.send.mockResolvedValue({ data: { id: "em_2" }, error: null });

    await sendEmailVerification({ email: "anna@example.com", token: "a b/c+d" });

    expect(mocks.constructedWith).toEqual(["re_test_key"]);
    const payload = mocks.send.mock.calls[0]![0];
    expect(payload.from).toBe("Velvea <hello@velvea.ca>");
    expect(payload.to).toBe("anna@example.com");
    expect(payload.subject).toBe("Confirm your Velvea email");
    // "Name <addr>" is reduced to the bare address for replyTo.
    expect(payload.replyTo).toBe("support@velvea.ca");
    // Site URL trailing slash is stripped and the token is URL-encoded.
    expect(payload.html).toContain(
      'href="https://www.velvea.ca/account/verify?token=a%20b%2Fc%2Bd"'
    );
    expect(payload.html).toContain('<html lang="en"');
    expect(payload.html).toContain("Confirm my email");
  });

  it("localises the subject and body for French", async () => {
    mocks.send.mockResolvedValue({ data: { id: "em_3" }, error: null });

    await sendEmailVerification({ email: "anna@example.com", token: "tok", locale: "fr-CA" });

    const payload = mocks.send.mock.calls[0]![0];
    expect(payload.subject).toBe("Confirmez votre courriel Velvea");
    expect(payload.html).toContain('<html lang="fr"');
    expect(payload.html).toContain("Confirmer mon courriel");
  });
});

describe("custom basket emails for a gift style request", () => {
  const req = {
    name: "Anna",
    email: "anna@example.com",
    phone: "",
    products: "Red roses, truffles and a framed photo",
    occasion: "Birthday",
    budget: "",
    neededBy: "",
    deliveryArea: "",
    locale: "fr",
    product: null,
    style: {
      slug: "keepsake-display-box",
      code: "VS-01",
      image: "/styles/keepsake-display-box.webp",
      nameEn: "Keepsake Display Box",
      nameLocal: "Coffret vitrine souvenir",
    },
  };

  it("tells the owner which style it is: code and name in the subject, photo and link in the body", async () => {
    mocks.send.mockResolvedValue({ data: { id: "em_1" }, error: null });
    const { sendCustomBasketNotice } = await import("@/lib/email");
    await sendCustomBasketNotice(req);

    const payload = mocks.send.mock.calls[0][0];
    expect(payload.to).toBe("hello@velvea.ca");
    expect(payload.subject).toBe("Style request VS-01: Keepsake Display Box, from Anna");
    expect(payload.html).toContain("https://www.velvea.ca/custom-basket?style=keepsake-display-box");
    expect(payload.html).toContain('src="https://www.velvea.ca/styles/keepsake-display-box.webp"');
    expect(payload.html).toContain("VS-01");
    expect(payload.html).toContain("Red roses, truffles and a framed photo");
  });

  it("confirms to the customer in their language, with the style, its code and the design-concept note", async () => {
    mocks.send.mockResolvedValue({ data: { id: "em_2" }, error: null });
    const { sendCustomBasketAck } = await import("@/lib/email");
    await sendCustomBasketAck(req);

    const payload = mocks.send.mock.calls[0][0];
    expect(payload.to).toBe("anna@example.com");
    expect(payload.html).toContain("Coffret vitrine souvenir");
    expect(payload.html).toContain("VS-01");
    expect(payload.html).toContain("concept de design");
  });

  it("leaves a general request untouched: no style line, the usual subject", async () => {
    mocks.send.mockResolvedValue({ data: { id: "em_3" }, error: null });
    const { sendCustomBasketNotice } = await import("@/lib/email");
    await sendCustomBasketNotice({ ...req, style: null });

    const payload = mocks.send.mock.calls[0][0];
    expect(payload.subject).toBe("Custom basket request from Anna");
    expect(payload.html).not.toContain("/styles/");
  });
});
