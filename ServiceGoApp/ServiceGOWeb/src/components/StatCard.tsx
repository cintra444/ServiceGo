interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
  icon?: React.ReactNode;
}

export function StatCard({ label, value, tone = "default", icon }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <div className="stat-card-head">
        <span>{label}</span>
        {icon ? <div className="stat-card-icon">{icon}</div> : null}
      </div>
      <strong>{value}</strong>
    </article>
  );
}
