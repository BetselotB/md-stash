import React, { useEffect, useRef, useState } from 'react';
import { Pill } from '../ui/Pill';
import gsap from 'gsap';

interface ReceiptItem {
  id: string;
  name: string;
  details: string;
  stamp: string;
  isHostOnly?: boolean;
}

const RECEIPT_ITEMS: ReceiptItem[] = [
  {
    id: 'accounts',
    name: 'Accounts',
    details: 'No user sign-up, email addresses, or passwords required.',
    stamp: 'None',
  },
  {
    id: 'cookies',
    name: 'Cookies',
    details: 'Zero HTTP cookies set, stored, or sent anywhere.',
    stamp: 'None',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    details: 'No Google Analytics, PostHog, telemetry, or tracking pixels.',
    stamp: 'None',
  },
  {
    id: 'contents',
    name: 'Your file contents',
    details: '0 bytes transmitted. Markdown notes live in local IndexedDB only.',
    stamp: 'None',
  },
  {
    id: 'ip',
    name: 'IP address stored by us',
    details:
      'Static web host may keep standard HTTP server access logs (IP, timestamp, requested file) for asset delivery. We operate zero custom servers and store no IP logs.',
    stamp: 'Host only',
    isHostOnly: true,
  },
  {
    id: 'scripts',
    name: 'Third-party scripts',
    details: '100% self-hosted. Zero external font CDNs or remote telemetry libraries.',
    stamp: 'None',
  },
];

export const CollectionReceipt: React.FC = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !receiptRef.current) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document.querySelectorAll('.receipt-stamp').forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const stamps = receiptRef.current.querySelectorAll('.receipt-stamp');
    gsap.set(stamps, { opacity: 0, scale: 1.6, rotation: -8 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            setAnimated(true);

            gsap.to(stamps, {
              opacity: 1,
              scale: 1,
              rotation: (i) => (i % 2 === 0 ? -4 : 3),
              duration: 0.35,
              stagger: 0.16,
              ease: 'back.out(2)',
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(receiptRef.current);

    return () => {
      observer.disconnect();
    };
  }, [animated]);

  return (
    <section className="py-20 sm:py-28 bg-cream text-ink border-t border-line-ink/40 relative">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <Pill>Itemised accounting</Pill>
          <h2 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
            What we collect.
          </h2>
          <p className="text-sm sm:text-base text-ink/75 font-sans leading-relaxed">
            An honest receipt of everything your browser touches when using MDstash.
          </p>
        </div>

        {/* Paper Receipt Card */}
        <div
          ref={receiptRef}
          className="max-w-xl mx-auto bg-[#F4EFE4] text-ink border-2 border-line-ink rounded-t-2xl shadow-xl relative select-none"
          style={{
            backgroundImage: 'radial-gradient(var(--ink) 0.5px, transparent 0.5px)',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0',
          }}
        >
          {/* Subtle paper grain overlay inside card */}
          <div className="absolute inset-0 bg-[#F4EFE4]/90 rounded-t-2xl pointer-events-none" />

          {/* Receipt Interior Content */}
          <div className="relative z-10 p-6 sm:p-10 font-mono text-xs sm:text-sm space-y-6">
            {/* Top Receipt Header */}
            <div className="text-center space-y-1.5 border-b border-dashed border-ink/30 pb-6">
              <div className="font-display text-2xl text-ink">
                MD<span className="text-orange">stash</span>
              </div>
              <div className="text-[11px] text-ink/70 font-sans">
                Transparency receipt · local client edition
              </div>
              <div className="text-[10px] text-ink/50 pt-1">
                Store: browser sandbox · Cashier: your device
              </div>
            </div>

            {/* Itemized Rows */}
            <div className="divide-y divide-dashed divide-ink/20 space-y-4 pt-1">
              {RECEIPT_ITEMS.map((item) => (
                <div key={item.id} className="pt-4 flex items-start justify-between gap-4">
                  <div className="space-y-1 max-w-[280px] sm:max-w-sm">
                    <div className="font-display text-sm sm:text-base text-ink font-bold">
                      {item.name}
                    </div>
                    <p className="font-sans text-[11px] sm:text-xs text-ink/70 leading-relaxed">
                      {item.details}
                    </p>
                  </div>

                  {/* Stamp Graphic */}
                  <div className="shrink-0 pt-0.5">
                    <div
                      className={`receipt-stamp px-2.5 py-1 rounded-md border-2 font-display text-xs sm:text-sm font-bold tracking-wide uppercase transition-transform shadow-xs ${
                        item.isHostOnly
                          ? 'border-[#C27835] text-[#C27835] bg-[#F4EFE4]'
                          : 'border-[#2F6B48] text-[#2F6B48] bg-[#F4EFE4]'
                      }`}
                    >
                      {item.stamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total / Accounting Footer */}
            <div className="pt-6 border-t-2 border-dashed border-ink/30 space-y-2">
              <div className="flex justify-between font-display text-sm sm:text-base text-ink">
                <span>Total items tracked</span>
                <span className="font-mono font-bold">0</span>
              </div>
              <div className="flex justify-between font-display text-sm sm:text-base text-ink">
                <span>Personal data harvested</span>
                <span className="font-mono font-bold">0 bytes</span>
              </div>
            </div>

            {/* Faux Barcode Graphic */}
            <div className="pt-4 flex flex-col items-center justify-center gap-2 border-t border-dashed border-ink/20">
              <div className="flex items-center gap-[2px] h-8 opacity-70" aria-hidden="true">
                {[
                  3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 3, 1, 2, 1, 3, 4, 2, 1, 3, 2, 4,
                  1, 2, 3, 1, 4, 2,
                ].map((w, i) => (
                  <span
                    key={i}
                    className="bg-ink h-full block"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <div className="font-sans text-[10px] text-ink/60 text-center">
                Thank you for owning your markdown.
              </div>
            </div>
          </div>

          {/* Jagged / Zigzag Bottom Edge */}
          <div className="w-full overflow-hidden leading-none relative z-10 -mb-[1px]">
            <svg
              viewBox="0 0 600 24"
              preserveAspectRatio="none"
              className="w-full h-4 sm:h-5 text-cream fill-current block"
              aria-hidden="true"
            >
              <polygon
                points="
                  0,24 0,0
                  20,20 40,0 60,20 80,0 100,20 120,0 140,20 160,0 180,20 200,0
                  220,20 240,0 260,20 280,0 300,20 320,0 340,20 360,0 380,20 400,0
                  420,20 440,0 460,20 480,0 500,20 520,0 540,20 560,0 580,20 600,0
                  600,24
                "
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
