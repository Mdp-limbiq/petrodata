'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { useUnits } from '@/providers/Units'
import { GAS_UNIT_SYSTEMS, type GasUnitSystem } from '@/utilities/units'

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function SettingsControl() {
  const t = useTranslations('settings')
  const { gasUnit, setGasUnit } = useUnits()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-nd-text-secondary hover:text-nd-text-display transition-colors p-1"
        aria-label={t('open')}
      >
        <GearIcon />
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
          >
            <button
              className="absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
            />
            <div
              className="relative w-full max-w-sm rounded-2xl border border-nd-border-visible bg-nd-surface overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-nd-border px-5 py-4">
                <span className="text-[11px] uppercase tracking-[0.08em] text-nd-text-secondary font-mono">
                  {t('title')}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-nd-text-disabled hover:text-nd-text-display transition-colors"
                  aria-label={t('close')}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="2" y1="2" x2="12" y2="12" />
                    <line x1="12" y1="2" x2="2" y2="12" />
                  </svg>
                </button>
              </div>

              <div className="px-5 py-5">
                <span className="mb-3 block text-[11px] uppercase tracking-[0.08em] text-nd-text-secondary font-mono">
                  {t('gasUnits')}
                </span>
                <div role="radiogroup" aria-label={t('gasUnits')} className="grid grid-cols-2 gap-2">
                  {GAS_UNIT_SYSTEMS.map((system: GasUnitSystem) => {
                    const active = gasUnit === system
                    return (
                      <button
                        key={system}
                        role="radio"
                        aria-checked={active}
                        onClick={() => setGasUnit(system)}
                        className="flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors"
                        style={{
                          borderColor: active ? 'var(--nd-success)' : 'var(--nd-border-visible)',
                          backgroundColor: active ? 'var(--nd-surface-raised)' : 'transparent',
                        }}
                      >
                        <span className="font-mono text-sm text-nd-text-display">{t(`${system}Label`)}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-nd-text-disabled">
                          {t(`${system}Note`)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
