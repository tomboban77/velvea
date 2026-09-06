import "server-only";
import { prisma } from "./prisma";
import { t } from "./i18n-content";

export async function getCollectionOptions() {
  try {
    const rows = await prisma.collection.findMany({
      orderBy: [{ type: "asc" }, { position: "asc" }],
    });
    return rows.map((c) => ({ id: c.id, type: c.type, label: t(c.name, "en") }));
  } catch {
    return [];
  }
}
