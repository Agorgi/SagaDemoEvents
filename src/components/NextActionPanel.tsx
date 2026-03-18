export function NextActionPanel({
  title,
  body,
  actionLabel,
  onAction
}: {
  title: string;
  body?: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <section className="surface-card-strong p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Best next move</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {body ? <p className="mt-2 text-sm text-app-muted">{body}</p> : null}
        </div>
        <button
          className="shrink-0 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      </div>
    </section>
  );
}
