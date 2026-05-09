export function SkeletonStat() {
  return <div className="skeleton skeleton-stat" aria-hidden="true" />;
}

export function SkeletonTask() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }} aria-hidden="true">
      <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton skeleton-text" style={{ width: '70%' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%' }} />
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return <div className="skeleton skeleton-card" aria-hidden="true" />;
}

export function SkeletonList({ count = 3, type = 'task' }) {
  const Comp = type === 'task' ? SkeletonTask : SkeletonCard;
  return Array.from({ length: count }, (_, i) => <Comp key={i} />);
}
