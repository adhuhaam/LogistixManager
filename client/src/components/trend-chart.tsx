import { useEffect, useRef } from "react";

interface TrendChartProps {
  data: number[];
  color: string;
  className?: string;
}

export default function TrendChart({ data, color, className = "" }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate points
    const width = rect.width;
    const height = rect.height;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight,
    }));

    // Draw area fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color + "00");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Highlight last point
      if (index === points.length - 1) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }, [data, color]);

  return (
    <div className={`chart-container ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-16"
        style={{ width: "100%", height: "64px" }}
      />
    </div>
  );
}
