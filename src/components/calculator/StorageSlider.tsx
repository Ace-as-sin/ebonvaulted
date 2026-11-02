import { useId } from 'react'
import { formatStorageGb } from '../../lib/pricing'
import { PRICING_CONFIG } from '../../lib/pricingConfig'

interface StorageSliderProps {
  value: number
  inputText: string
  onValueChange: (gb: number) => void
  onInputTextChange: (text: string) => void
  onInputCommit: () => void
}

export function StorageSlider({
  value,
  inputText,
  onValueChange,
  onInputTextChange,
  onInputCommit,
}: StorageSliderProps) {
  const baseId = useId()
  const { minStorageGb, maxStorageGb } = PRICING_CONFIG.usage
  const presets = PRICING_CONFIG.storagePresetsGb

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <label
            htmlFor={`${baseId}-slider`}
            className="block text-sm font-medium text-ink"
          >
            Storage amount
          </label>
          <p className="mt-1 text-sm text-muted">
            Drag, type a value, or pick a preset. 1 TB = 1,000 GB.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            id={`${baseId}-input`}
            type="number"
            inputMode="decimal"
            min={minStorageGb}
            max={maxStorageGb}
            step={1}
            value={inputText}
            aria-label="Storage amount in gigabytes"
            onChange={(e) => onInputTextChange(e.target.value)}
            onBlur={onInputCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            className="w-24 rounded-xl border border-line bg-navy-950/60 px-3 py-2 text-right text-sm text-ink tabular-nums transition focus:border-teal-400/50 focus:ring-2 focus:ring-teal-400/20"
          />
          <span className="text-sm text-subtle" aria-hidden="true">
            GB
          </span>
        </div>
      </div>

      <div className="relative pt-1">
        <input
          id={`${baseId}-slider`}
          type="range"
          min={minStorageGb}
          max={maxStorageGb}
          step={1}
          value={value}
          aria-valuemin={minStorageGb}
          aria-valuemax={maxStorageGb}
          aria-valuenow={value}
          aria-valuetext={formatStorageGb(value)}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="storage-slider w-full cursor-pointer appearance-none bg-transparent"
        />
        <div className="mt-2 flex justify-between text-xs text-subtle">
          <span>{formatStorageGb(minStorageGb)}</span>
          <span className="font-medium text-teal-400">
            {formatStorageGb(value)}
          </span>
          <span>{formatStorageGb(maxStorageGb)}</span>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Storage presets"
      >
        {presets.map((preset) => {
          const active = value === preset
          return (
            <button
              key={preset}
              type="button"
              aria-pressed={active}
              onClick={() => onValueChange(preset)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'bg-teal-500/20 text-teal-400 ring-1 ring-teal-400/40'
                  : 'border border-line bg-white/5 text-muted hover:border-teal-400/40 hover:text-ink'
              }`}
            >
              {formatStorageGb(preset)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
