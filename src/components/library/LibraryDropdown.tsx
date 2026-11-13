import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

interface LibraryDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  ariaLabel: string;
}

export const LibraryDropdown: React.FC<LibraryDropdownProps> = ({ label, value, options, onChange, ariaLabel }) => {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, options.indexOf(value)));
  const [position, setPosition] = useState({ top: 0, left: 0, width: 200 });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(rect.width, 200);
    setPosition({
      top: Math.min(rect.bottom + 8, window.innerHeight - 220),
      left: Math.min(Math.max(8, rect.left), window.innerWidth - width - 8),
      width: Math.min(width, window.innerWidth - 16),
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    const onViewportChange = () => updatePosition();
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open]);

  const choose = (option: string) => {
    onChange(option);
    setActiveIndex(options.indexOf(option));
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setActiveIndex(Math.max(0, options.indexOf(value)));
        setOpen(true);
      } else {
        setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
      }
    } else if (open && (event.key === 'Home' || event.key === 'End')) {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
    } else if (open && event.key === 'Enter') {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === ' ' && open) {
      event.preventDefault();
      choose(options[activeIndex]);
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="px-0.5 text-[11px] font-medium leading-none text-neutral-400">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
        onClick={() => { setActiveIndex(Math.max(0, options.indexOf(value))); setOpen((current) => !current); }}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (!menuRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
        }}
        className="glass-field flex h-9 min-w-[9.5rem] items-center justify-between gap-3 rounded-lg border border-white/[0.12] px-3 text-left text-xs font-medium text-neutral-100 transition-colors hover:border-amber-400/40 focus:border-amber-400/70 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-150 ${open ? 'rotate-180 text-amber-300' : ''}`} aria-hidden="true" />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label={ariaLabel}
          className="fixed z-[100] max-h-[min(18rem,calc(100vh-1rem))] overflow-y-auto rounded-xl border border-white/[0.14] bg-[#171615]/95 p-1.5 text-xs text-neutral-200 shadow-[0_16px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
          style={position}
        >
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={value === option}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => choose(option)}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${index === activeIndex ? 'bg-white/[0.08] text-white' : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'} ${value === option ? 'font-semibold text-amber-200' : ''}`}
            >
              <span>{option}</span>
              {value === option && <Check className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
};
