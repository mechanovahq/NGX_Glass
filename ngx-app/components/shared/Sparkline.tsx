interface Props {
  up?: boolean;
  className?: string;
}

/** Simple decorative sparkline SVG (static) */
export default function Sparkline({ up = true, className = '' }: Props) {
  const color = up ? 'var(--accent-light)' : 'var(--red)';
  const points = up
    ? '0,16 8,12 16,14 24,8 32,10 40,4 48,6'
    : '0,4 8,8 16,6 24,12 32,10 40,14 48,16';

  return (
    <svg
      className={`sparkline ${className}`}
      width="48"
      height="20"
      viewBox="0 0 48 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.8"
      />
    </svg>
  );
}
