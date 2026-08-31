type EmptyScreenProps = {
  title: string;
  description: string;
  icon?: React.ReactNode;
};

export function EmptyScreen({ title, description, icon }: EmptyScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400">
        {icon ?? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-neutral-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
    </div>
  );
}
