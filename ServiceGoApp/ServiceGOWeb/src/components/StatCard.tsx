interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
