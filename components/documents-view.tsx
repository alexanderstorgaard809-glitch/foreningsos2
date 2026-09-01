"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyScreen } from "@/components/ui/empty-screen";
import { SearchInput } from "@/components/ui/search-input";

export type DocumentRow = {
  id: string;
  name: string;
  size: number;
  isImage: boolean;
  dateLabel: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const svgProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const fileIcon = (
  <svg {...svgProps}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const imageIcon = (
  <svg {...svgProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const downloadClass =
  "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-100";

export function DocumentsView({
  initialDocuments,
}: {
  initialDocuments: DocumentRow[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [query, setQuery] = useState("");

  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const filteredDocuments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialDocuments;
    return initialDocuments.filter((d) =>
      d.name.toLowerCase().includes(q)
    );
  }, [initialDocuments, query]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setMessage(null);

    const errors: string[] = [];
    let uploaded = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        setProgress({ done: i, total: files.length });

        if (files[i].size > 4 * 1024 * 1024) {
          errors.push(`${files[i].name} is larger than 4 MB and was skipped.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(data.error ?? `${files[i].name} failed to upload.`);
          continue;
        }
        uploaded++;
      }
    } finally {
      setUploading(false);
      setProgress({ done: 0, total: 0 });
      if (fileInputRef.current) fileInputRef.current.value = "";

      const parts: string[] = [];
      if (uploaded > 0) {
        parts.push(
          `Uploaded ${uploaded} file${uploaded === 1 ? "" : "s"}.`
        );
      }
      parts.push(...errors);
      if (parts.length > 0) {
        setMessage({ ok: errors.length === 0, text: parts.join(" ") });
      }

      if (uploaded > 0) router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file? This cannot be undone.")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-6">
      <form
        onSubmit={handleUpload}
        className="rounded-lg border border-neutral-200 bg-white p-6"
      >
        <p className="text-base font-semibold text-neutral-900">
          Upload files
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          PDFs, images and documents up to 10 MB each. Select several at
          once.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="block max-w-full cursor-pointer text-sm text-neutral-500 file:mr-3 file:rounded-md file:border file:border-neutral-200 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-900 file:shadow-sm hover:file:bg-neutral-100 focus:outline-none"
          />
          <Button type="submit" size="sm" disabled={uploading}>
            {uploading
              ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}...`
              : "Upload"}
          </Button>
        </div>
        {message && (
          <p
            className={`mt-3 rounded-md border px-3 py-2 text-sm ${
              message.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>

      {initialDocuments.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white">
          <EmptyScreen
            icon={fileIcon}
            title="No documents yet"
            description="Upload your bylaws, budgets and insurance policies — everything the board needs, kept in one place."
          />
        </div>
      ) : (
        <div className="space-y-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search files"
          />
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <p className="border-b border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-500">
              {query.trim()
                ? `${filteredDocuments.length} of ${initialDocuments.length} files`
                : `${initialDocuments.length} file${
                    initialDocuments.length === 1 ? "" : "s"
                  }`}
            </p>
            {filteredDocuments.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-500">
                No files match &ldquo;{query.trim()}&rdquo;
              </p>
            ) : (
              filteredDocuments.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0 hover:bg-neutral-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-neutral-500">
                {d.isImage ? imageIcon : fileIcon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-neutral-900">
                  {d.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {formatSize(d.size)} · {d.dateLabel}
                </p>
              </div>
              <a
                href={`/api/documents/${d.id}/download`}
                className={downloadClass}
              >
                Download
              </a>
              <button
                onClick={() => handleDelete(d.id)}
                className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
