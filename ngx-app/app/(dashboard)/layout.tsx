import MarketBanner from '@/components/layout/MarketBanner';
import TickerStrip from '@/components/layout/TickerStrip';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketBanner />
      <TickerStrip />
      <div className="page">{children}</div>
    </>
  );
}
