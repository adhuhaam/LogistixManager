import { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface InteractiveChartProps {
  data: number[];
  color: string;
  label: string;
  className?: string;
}

export default function InteractiveChart({ data, color, label, className = "" }: InteractiveChartProps) {
  const chartRef = useRef<ChartJS<"line", number[], string>>(null);

  const chartData = {
    labels: data.map((_, index) => `Week ${index + 1}`),
    datasets: [
      {
        label,
        data,
        borderColor: color,
        backgroundColor: `${color}20`,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => `${context[0].label}`,
          label: (context: any) => `${label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 1000,
    },
  } as const;

  return (
    <div className={`relative h-16 w-full ${className}`}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}