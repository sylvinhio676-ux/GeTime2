import React, { useMemo } from 'react';

const defaultData = [45, 60, 52, 70, 68, 85, 90];

export default function ChartPlaceholder({ title = 'Graphique', subtitle = '' }) {
  const points = useMemo(() => {
    const values = defaultData;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = 200 / (values.length - 1);

    return values
      .map((value, index) => {
        const normalized = 80 - ((value - min) / range) * 60 - 10;
        return `${index * step},${normalized}`;
      })
      .join(' ');
  }, []);

  const fillPath = useMemo(() => {
    const values = defaultData;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = 200 / (values.length - 1);

    const path = values
      .map((value, index) => {
        const normalized = 80 - ((value - min) / range) * 60 - 10;
        return `${index * step},${normalized}`;
      })
      .join(' ');

    return `M0,80 L${path} L200,80 Z`;
  }, []);

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Derniers 7 jours</div>
      </div>

      <div className="w-full h-48 rounded-md bg-gradient-to-br from-card to-surface-elevated overflow-hidden">
        <svg className="w-full h-full p-4" viewBox="0 0 200 80" preserveAspectRatio="none">
          <path d={fillPath} fill="rgba(102, 115, 252, 0.12)" />
          <polyline
            fill="none"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
            points={points}
          />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full" /> <span>Utilisation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" /> <span>Croissance</span>
        </div>
      </div>
    </div>
  );
}
