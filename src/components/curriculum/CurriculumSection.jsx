import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const CurriculumSection = ({ title, summary, badge, actions, className, headerClassName = '', collapsible = true, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const expanded = !collapsible || open;
  const heading = (
    <>
      {badge}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-slate-900 dark:text-white" title={title}>{title}</span>
        {summary && <span className="block text-[11px] font-normal text-slate-500 dark:text-slate-400">{summary}</span>}
      </span>
    </>
  );

  return (
    <section className={className}>
      <header className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-4 py-3 ${headerClassName}`}>
        <h3 className="min-w-32 flex-1">
          {collapsible ? (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen((value) => !value)}
              className="flex w-full items-center gap-2.5 rounded-lg text-left hover:bg-slate-200/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F8C] dark:hover:bg-slate-800/70"
            >
              {heading}
              <ChevronDown aria-hidden="true" className={`mr-1 h-4 w-4 shrink-0 text-slate-500 transition-transform motion-reduce:transition-none dark:text-slate-400 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <span className="flex items-center gap-2.5">{heading}</span>
          )}
        </h3>
        {actions}
      </header>
      <div id={panelId} hidden={!expanded} className="border-t border-slate-200/70 dark:border-slate-800">
        {expanded && children}
      </div>
    </section>
  );
};
