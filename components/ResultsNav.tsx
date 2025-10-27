import { useSearchParams } from 'next/navigation';
import CTAButton from '@/components/CTAButton';

interface ResultsNavProps {
  currentPage: string;
}

export default function ResultsNav({ currentPage }: ResultsNavProps) {
  const searchParams = useSearchParams();
  const rid = searchParams.get('rid') || searchParams.get('ridA');
  const q = rid ? `?rid=${rid}` : '';

  const allPages = [
    { path: '/your-id', label: '✨ Your ID', tier: 'Free' },
    { path: '/summary', label: '📋 Summary', tier: 'Free' },
    { path: '/results', label: '📊 Full Analysis', tier: 'Free' },
    { path: '/arctyps-duals', label: '🎭 Archetype Duals', tier: 'Free' },
    // { type: 'divider' },
    // { path: '/conflict-patterns', label: '🔍 Explore Conflict Pattern', tier: 'Paid' },
    // { path: '/existential-circuits', label: '🧠 Existential Circuits', tier: 'Paid' },
    // { path: '/compatibility', label: '🤝 Compatibility Report', tier: 'Paid' },
  ];

  const pagesToShow = allPages.filter((page: any) => page.path !== currentPage);

  return (
    <div className="mt-6" style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center', alignItems: 'center'}}>
      {pagesToShow.map((page: any, index) => {
        // if (page.type === 'divider') {
        //   return <div key={`divider-${index}`} className="h-6 w-px bg-white/20"></div>;
        // }
        let href = `${page.path}${q}`;
        if ((page.path === '/compatibility' || page.path === '/arctyps-duals') && rid) {
          href = `${page.path}?ridA=${rid}`;
        }
        return (
          <CTAButton key={page.path} href={href} tier={page.tier}>
            {page.label}
          </CTAButton>
        );
      })}
    </div>
  );
}
