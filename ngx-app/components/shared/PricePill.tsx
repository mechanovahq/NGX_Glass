interface Props {
  value: number;
  suffix?: string;
  decimals?: number;
}

export default function PricePill({ value, suffix = '%', decimals = 2 }: Props) {
  const up = value >= 0;
  const text = (up ? '+' : '') + value.toFixed(decimals) + suffix;
  return (
    <span className={`pill ${up ? 'pill-up' : 'pill-dn'}`}>{text}</span>
  );
}
