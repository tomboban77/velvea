"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, Badge } from "./ui";
import { setUserRole } from "@/lib/actions/admin";
import { formatDate } from "@/lib/utils";
import type { Role } from "@prisma/client";

type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: Date | string;
};

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "CUSTOMER", label: "Customer", hint: "No admin access." },
  {
    value: "STAFF",
    label: "Staff",
    hint: "Orders, products, content and moderation. No discounts, settings, refunds or deletions.",
  },
  { value: "ADMIN", label: "Admin", hint: "Full access, including settings and staff." },
];

export function StaffManager({ users, currentUserId }: { users: StaffUser[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function change(id: string, role: Role) {
    setError(null);
    setBusyId(id);
    start(async () => {
      try {
        await setUserRole({ id, role });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not change that role.");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet" />
        <ul className="space-y-1 text-sm text-ink-soft">
          {ROLES.map((r) => (
            <li key={r.value}>
              <span className="font-semibold text-ink">{r.label}</span> — {r.hint}
            </li>
          ))}
        </ul>
      </Card>

      {error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-shell">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/50 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-medium">Person</th>
              <th className="px-3 py-3 font-medium">Joined</th>
              <th className="px-3 py-3 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-cream/30">
                <td className="px-5 py-3">
                  <p className="font-medium text-ink">{u.name || "—"}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </td>
                <td className="px-3 py-3 text-muted">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-3">
                  {u.id === currentUserId ? (
                    <Badge tone="iris">You · {u.role}</Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => change(u.id, e.target.value as Role)}
                        className="field w-36"
                        disabled={pending && busyId === u.id}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {pending && busyId === u.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted" />
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
