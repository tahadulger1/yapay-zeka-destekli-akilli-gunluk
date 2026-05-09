export default function StatCard({ icon, value, label, variant = 'primary' }) {
  return (
    <article className="stat-card animate-slide-up" aria-label={`${label}: ${value}`}>
      <div className="stat-card-header">
        <div className={`stat-icon ${variant}`}>{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </article>
  );
}
