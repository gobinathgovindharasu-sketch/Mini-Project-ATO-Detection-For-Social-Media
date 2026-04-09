"use client";

import { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

export default function StatsCard({
  label,
  value,
  icon,
  color = "text-ato-cyan",
}: Props) {
  return (
    <div className="bg-ato-card border border-ato-border rounded-lg p-4 flex items-center gap-4">
      <div className={`${color} opacity-80`}>{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-gray-500">
          {label}
        </div>
        <div className={`text-xl font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
}
