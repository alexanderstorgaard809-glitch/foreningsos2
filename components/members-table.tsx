"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyScreen } from "@/components/ui/empty-screen";

export type Member = {
  id: string;
  name: string;
  address: string;
  email: string | null;
  phone: string | null;
};

const emptyForm = { name: "", address: "", email: "", phone: "" };

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

export function MembersTable({ initialMembers }: { initialMembers: Member[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set(key: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(member: Member) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      address: member.address,
      email: member.email ?? "",
      phone: member.phone ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/members/${editingId}` : "/api/members",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Something went wrong");
        return;
      }
      cancelEdit();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this member?")) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-neutral-200 bg-white p-6"
      >
        <p className="text-base font-semibold text-neutral-900">
          {editingId ? "Edit member" : "Add member"}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              required
              placeholder="Jane Jensen"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <input
              required
              placeholder="Fællesvej 3"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Email{" "}
              <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Phone{" "}
              <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              placeholder="+45 12 34 56 78"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="submit" disabled={saving} size="sm">
            {saving ? "Saving..." : editingId ? "Save changes" : "Add member"}
          </Button>
          {editingId && (
            <Button variant="secondary" onClick={cancelEdit} size="sm">
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-500">
          {initialMembers.length} members
        </p>
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          {initialMembers.length === 0 ? (
            <EmptyScreen
              title="No members yet"
              description="Add your first member above. The member list is the foundation for dues, meetings and everything else."
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-200">
                <tr className="text-xs font-medium text-neutral-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Email</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {initialMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {member.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {member.address}
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                      {member.email ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                      {member.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => startEdit(member)}
                          className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
