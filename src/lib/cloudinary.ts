import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfig() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

export async function uploadImage(
  dataUri: string,
  folder = "velvea"
): Promise<UploadResult> {
  ensureConfig();
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    url: res.secure_url,
    publicId: res.public_id,
    width: res.width,
    height: res.height,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfig();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    /* ignore */
  }
}
