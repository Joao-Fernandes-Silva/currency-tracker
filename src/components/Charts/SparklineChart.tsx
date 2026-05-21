import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  positive?: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  const chartData = data.map((price, i) => ({ i, price }));
  return (
    <ResponsiveContainer width={80} height={36}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={positive ? 'var(--positive)' : 'var(--negative)'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
