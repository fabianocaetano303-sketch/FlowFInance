export default function Loading() {
  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="h-8 w-40 bg-surface-container-lowest rounded animate-pulse" />
      <div className="h-24 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
      <div className="h-10 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
        <div className="h-14 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
      </div>
      <div className="h-20 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
      <div className="h-20 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
      <div className="h-20 bg-surface-container-lowest border border-outline-variant rounded-lg animate-pulse" />
    </div>
  );
}
