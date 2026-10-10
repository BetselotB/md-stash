import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Pill } from '../ui/Pill';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'clear-site-data',
    question: 'What happens if I clear site data?',
    answer:
      'Clearing browser storage or site data removes your browser\'s local IndexedDB database, which will erase your stored notes. Because MDstash has no cloud servers, we cannot restore deleted notes for you. We strongly recommend making periodic backups using the export feature in MDstash.',
  },
  {
    id: 'back-up',
    question: 'How do I back up my notes?',
    answer:
      'In MDstash, open the export menu in the library sidebar or settings to download all of your notes and collections as a standard zip archive of plain markdown files (.md) with frontmatter intact. You can store this archive on your personal hard drive, USB key, or trusted backup destination.',
  },
  {
    id: 'recover-files',
    question: 'Can you recover my files if I lose them?',
    answer:
      'No. Because MDstash operates without any backend servers or cloud accounts, we never hold copies or encryption keys for your files. Your data exists only on the physical device you use. If you delete your browser data and do not have an exported backup, recovery is technically impossible.',
  },
  {
    id: 'works-offline',
    question: 'Does MDstash work offline?',
    answer:
      'Yes, 100%. MDstash installs as a progressive web app (PWA) and uses a local service worker cache to store all client assets. Once loaded, you can disconnect from Wi-Fi completely, open the application, create new notes, search, and organize collections without any internet connection.',
  },
  {
    id: 'sync',
    question: 'Is there ever sync?',
    answer:
      'If synchronization is ever introduced in a future update, it will be strictly opt-in and end-to-end encrypted. We will never transmit or synchronize your notes without explicit consent and setup on your part.',
  },
];

export const PrivacyFaq: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('clear-site-data');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 sm:py-28 bg-cream text-ink border-t border-line-ink/40 relative">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16 space-y-3">
          <Pill>Common questions</Pill>
          <h2 className="font-display text-4xl sm:text-5xl text-ink tracking-tight">
            Frequently asked questions.
          </h2>
          <p className="text-sm sm:text-base text-ink/75 font-sans leading-relaxed">
            Straightforward answers about your data ownership, backups, and security.
          </p>
        </div>

        {/* Accordions List (Single-open accessible) */}
        <div className="divide-y divide-line-ink/30 border-y border-line-ink/30">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-2">
                <button
                  type="button"
                  id={`faq-btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => toggleItem(item.id)}
                  className="w-full py-4 flex items-center justify-between text-left font-display text-lg sm:text-xl text-ink hover:text-orange transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange rounded-lg px-2"
                >
                  <span className="pr-4">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 text-ink/60 ${
                      isOpen ? 'rotate-180 text-orange' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${item.id}`}
                    className="px-2 pb-5 pt-1 text-xs sm:text-sm text-ink/80 font-sans leading-relaxed animate-fadeIn"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
