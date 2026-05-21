import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DataPoint {
  date: string;
  rate?: number;
  price?: number;
  [key: string]: unknown;
}

interface LineChartComponentProps {
  data: DataPoint[];
  dataKey: string;
  color?: string;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-sm shadow-lg"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
        }}
      >
        <p style={{ color: 'var(--text-secondary)' }} className="text-xs mb-1">{label}</p>
        <p className="font-semibold">{Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
      </div>
    );
  }
  return null;
};

export default function LineChartComponent({ data, dataKey, color = '#38bdf8', label }: LineChartComponentProps) {
  return (
    <div className="w-full h-64">
      {label && (
        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tickFormatter={(val) => val.slice(5)}
          />
          <YAxis
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(val) =>
              val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(val < 1 ? 4 : 2)
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
