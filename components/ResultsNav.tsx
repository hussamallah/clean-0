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
    { path: '/your-id', label: '✨ Your ID' },
    { path: '/summary', label: '📋 Summary' },
    { path: '/conflict-patterns', label: '🔍 Explore Conflict Pattern' },
    { path: '/existential-circuits', label: '🧠 Existential Circuits' },
    { path: '/results', label: '📊 Full Analysis' },
    { path: '/arctyps-duals', label: '🎭 Archetype Duals' },
    { path: '/compatibility', label: '🤝 Compatibility Report' },
  ];

  const pagesToShow = allPages.filter(page => page.path !== currentPage);

  return (
    <div className="mt-6" style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center'}}>
      {pagesToShow.map(page => {
        let href = `${page.path}${q}`;
        if ((page.path === '/compatibility' || page.path === '/arctyps-duals') && rid) {
          href = `${page.path}?ridA=${rid}`;
        }
        return (
          <CTAButton key={page.path} href={href}>
            {page.label}
          </CTAButton>
        );
      })}
    </div>
  );
}
