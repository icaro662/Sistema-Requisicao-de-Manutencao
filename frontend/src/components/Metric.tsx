import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface MetricProps {
  label: string;
  value: number;
  icon: ReactNode;
  tone: string;
}

export default function Metric({ label, value, icon, tone }: MetricProps) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <ArrowUpRight className="metric-arrow" size={16} />
    </div>
  );
}
