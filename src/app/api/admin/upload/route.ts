import { NextRequest, NextResponse } from "next/server";
import { getVerifiedAdmin } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

/** Cloudinary folders the admin UI may write into: "velvea" or one level below it. */
const FOLDER_PATTERN = /^velvea(\/[a-z0-9-]{1,40})?$/;

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Vercel rejects a request body over 4.5MB before the function runs, and the
 * rejection is not JSON — an 8MB limit here only turned "too large" into an
 * unexplained "upload failed". The browser downscales anything bigger before
 * it gets here.
 */
const MAX_BYTES = 4 * 1024 * 1024; // 4MB

export async function POST(req: NextRequest) {
  // Re-reads the role from the database so a demoted user's still-valid token
  // cannot keep uploading; STAFF need the products permission like elsewhere.
  const admin = await getVerifiedAdmin();
  if (!admin || !can(admin.role, "products:write")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: "Image uploads are not configured. Add Cloudinary keys to .env." },
      { status: 503 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = (form.get("folder") as string) || "velvea";
    if (!FOLDER_PATTERN.test(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 4MB)" }, { status: 413 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are allowed" }, { status: 415 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    const result = await uploadImage(dataUri, folder);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
