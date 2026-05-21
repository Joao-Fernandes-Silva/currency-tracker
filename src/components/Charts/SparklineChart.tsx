import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineChartProps {
  data: number[];
  positive?: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  // Downsample for performance if data is too dense
  const step = Math.max(1, Math.floor(data.length / 40));
  const chartData = data
    .filter((_, i) => i % step === 0)
    .map((price, i) => ({ i, price }));

  const color = positive ? 'var(--positive)' : 'var(--negative)';

  return (
    <ResponsiveContainer width="100%" height={52}>
      <LineChart data={chartData} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div
                className="px-2 py-1 rounded text-xs shadow"
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                ${Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
