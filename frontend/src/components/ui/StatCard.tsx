import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: number; // positive = up, negative = down, 0 = neutral
  trendLabel?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  subtitle?: string;
  index?: number;
}

const colorMap = {
  default: { value: 'text-white', icon: 'text-zinc-400 bg-zinc-800', border: 'border-zinc-800' },
  success: { value: 'text-emerald-400', icon: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/20' },
  warning: { value: 'text-amber-400', icon: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/20' },
  danger:  { value: 'text-red-400', icon: 'text-red-400 bg-red-500/10', border: 'border-red-500/20' },
  info:    { value: 'text-blue-400', icon: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/20' },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'default',
  subtitle,
  index = 0,
}: StatCardProps) {
  const c = colorMap[color];
  const TrendIcon = trend === undefined ? Minus : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend === undefined ? 'text-zinc-500' : trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-zinc-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`bg-[#0f1f4a]/80 border rounded-2xl p-5 hover:border-white/10 transition-all duration-200 card-hover ${c.border}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{label}</p>
        {Icon && (
          <div className={`p-2 rounded-xl ${c.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <p className={`text-3xl font-black mb-1 ${c.value}`}>{value}</p>

      {subtitle && <p className="text-xs text-zinc-600 mb-2">{subtitle}</p>}

      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{Math.abs(trend)}% {trendLabel ?? (trend >= 0 ? 'increase' : 'decrease')}</span>
        </div>
      )}
    </motion.div>
  );
}
