import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'NISSI Communication — Les esprits de la com',
  description: 'Cabinet de conseil en stratégie de marque et en influence. NISSI Communication accompagne les organisations dans la structuration et le pilotage de leur visibilité.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-surface text-on-surface antialiased">
        <Providers>{children}</Providers>
        {/* Scroll reveal global — observe tous les éléments .reveal */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if(typeof IntersectionObserver==='undefined') return;
            var obs = new IntersectionObserver(function(entries){
              entries.forEach(function(e){
                if(e.isIntersecting){ e.target.classList.add('in-view'); obs.unobserve(e.target); }
              });
            }, { threshold: 0.12 });
            function init(){ document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); }); }
            if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
            else { init(); }
          })();
        ` }} />
      </body>
    </html>
  )
}
