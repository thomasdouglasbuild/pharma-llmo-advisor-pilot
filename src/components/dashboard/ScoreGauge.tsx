
interface ProgressCircleProps {
  value: number;
}

export const ProgressCircle = ({ value }: ProgressCircleProps) => {
  const percentage = Math.round(value * 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage > 75) return "#22c55e";
    if (percentage > 50) return "#facc15";
    return "#ef4444";
  };

  return (
    <div className="mx-auto h-40 w-40 relative">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: getColor() }}>
          {percentage}
        </span>
      </div>
    </div>
  );
};
