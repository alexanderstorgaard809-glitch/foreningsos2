"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type MaintenanceDetail = {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  reporter: string;
  description: string;
  createdAtLabel: string;
  completedAtLabel: string | null;
};

const categoryLabels: Record<string, string> = {
  plumbing: "Plumbing",
  electricity: "Electricity",
  common: "Common areas",
  other: "Other",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Normal",
  urgent: "Urgent",
};

const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  done: "Done",
};

const statusVariant: Record<string, "default" | "warning" | "success"> = {
  new: "default",
  in_progress: "warning",
  done: "success",
};

const inputClass =
  "h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

const labelClass = "mb-1.5 block text-sm font-medium text-neutral-900";

const textareaClass =
  "w-full rounded-md border border-neutral-200 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";

export function MaintenanceEditor({
  request,
}: {
  request: MaintenanceDetail;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(request.title);
  const [category, setCategory] = useState(request.category);
  const [priority, setPriority] = useState(request.priority);
  const [reporter, setReporter] = useState(request.reporter);
  const [description, setDescription] = useState(request.description);
  const [status, setStatus] = useState(request.status);
  const [completedAtLabel, setCompletedAtLabel] = useState(
    request.completedAtLabel
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function save(fields: Record<string, unknown>, key: string) {
    setBusy(key);
    try {
      const res = await fetch(`/api/maintenance/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Something went wrong");
        return false;
      }
      router.refresh();
      return true;
    } finally {
      setBusy(null);
    }
  }

  function changeStatus(newStatus: string) {
    setStatus(newStatus);
    setCompletedAtLabel(
      newStatus === "done"
        ? new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null
    );
    save({ status: newStatus }, "status");
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    await save(
      { title: title.trim(), category, priority, reporter, description },
      "details"
    );
  }

  async function handleDelete() {
    if (!confirm("Delete this request permanently?")) return;
    await fetch(`/api/maintenance/${request.id}`, { method: "DELETE" });
    router.push("/dashboard/maintenance");
  }

  return (
    <div>
      <Link
        href="/dashboard/maintenance"
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        Back to maintenance
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold text-neutral-900">
              {title}
            </h1>
            <Badge variant={statusVariant[status] ?? "default"}>
              {statusLabels[status] ?? status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {categoryLabels[category] ?? "Other"}
            {priority !== "medium"
              ? ` · ${priorityLabels[priority]} priority`
              : ""}
            {" · reported "}
            {request.createdAtLabel}
            {request.reporter ? ` by ${request.reporter}` : ""}
            {completedAtLabel ? ` · completed ${completedAtLabel}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {status === "new" && (
            <Button
              size="sm"
              disabled={busy === "status"}
              onClick={() => changeStatus("in_progress")}
            >
              Start working
            </Button>
          )}
          {status === "in_progress" && (
            <Button
              size="sm"
              disabled={busy === "status"}
              onClick={() => changeStatus("done")}
            >
              Mark as done
            </Button>
          )}
          {status === "done" && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy === "status"}
              onClick={() => changeStatus("in_progress")}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">Details</p>
        <form onSubmit={handleSaveDetails} className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="plumbing">Plumbing</option>
                <option value="electricity">Electricity</option>
                <option value="common">Common areas</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Reported by</label>
              <input
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={textareaClass}
              />
            </div>
          </div>
          <div className="mt-4">
            <Button type="submit" size="sm" disabled={busy === "details"}>
              {busy === "details" ? "Saving..." : "Save details"}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-base font-semibold text-neutral-900">Danger zone</p>
        <p className="mt-1 text-sm text-neutral-500">
          Deleting removes the request permanently, including its history.
        </p>
        <div className="mt-3">
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            Delete request
          </Button>
        </div>
      </div>
    </div>
  );
}
