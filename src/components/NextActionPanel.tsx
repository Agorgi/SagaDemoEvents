export function NextActionPanel({
  title,
  body,
  actionLabel,
  onAction
}: {
  title: string;
  body: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <section className="surface-card-strong p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-app-muted">Best next move</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-[56ch] text-sm leading-6 text-app-muted">{body}</p>
      <button
        className="mt-5 rounded-2xl bg-app-purple px-4 py-3 text-sm font-semibold text-white transition hover:bg-app-purple-hover"
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </section>
  );
}

