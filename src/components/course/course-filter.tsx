'use client'

import type { FilterState, SortType, TransportType, PlaceType } from '@/types/course.types'
import { DEFAULT_FILTER } from '@/types/course.types'

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'recommended', label: '추천순' },
  { value: 'budget',      label: '비용 낮은순' },
  { value: 'congestion',  label: '혼잡도 낮은순' },
]

const PLACE_TYPES: PlaceType[] = ['카페', '식당', '전시', '야외', '쇼핑']

const TRANSPORT_OPTIONS: { value: TransportType; label: string; icon: string }[] = [
  { value: 'walk',    label: '도보',     icon: '🚶' },
  { value: 'transit', label: '대중교통', icon: '🚇' },
  { value: 'mixed',   label: '혼합',     icon: '🔀' },
]

interface CourseFilterProps {
  filter: FilterState
  onChange: (filter: FilterState) => void
  onReset: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
      textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 10,
    }}>
      {children}
    </div>
  )
}

function RadioOption({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', padding: '8px 0',
    }}>
      <div
        onClick={onChange}
        style={{
          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
          border: checked ? '5px solid var(--primary)' : '1.5px solid var(--border-strong)',
          background: checked ? 'transparent' : 'var(--surface-2)',
          cursor: 'pointer',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}
      />
      <span
        onClick={onChange}
        style={{ fontSize: 14, color: checked ? 'var(--fg)' : 'var(--fg-2)', fontWeight: checked ? 600 : 400 }}
      >
        {label}
      </span>
    </label>
  )
}

function CheckOption({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer', padding: '8px 0',
    }}>
      <div
        onClick={onChange}
        style={{
          width: 18, height: 18, borderRadius: 'var(--radius-xs)', flexShrink: 0,
          border: checked ? '2px solid var(--primary)' : '1.5px solid var(--border-strong)',
          background: checked ? 'var(--primary)' : 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}
      >
        {checked && <span style={{ color: 'var(--fg-on-primary)', fontSize: 11, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <span
        onClick={onChange}
        style={{ fontSize: 14, color: checked ? 'var(--fg)' : 'var(--fg-2)', fontWeight: checked ? 600 : 400 }}
      >
        {label}
      </span>
    </label>
  )
}

export function CourseFilter({ filter, onChange, onReset }: CourseFilterProps) {
  const isDefault =
    filter.sort === DEFAULT_FILTER.sort &&
    filter.placeTypes.length === 0 &&
    filter.transportation === DEFAULT_FILTER.transportation

  const setSort = (sort: SortType) => onChange({ ...filter, sort })

  const togglePlaceType = (type: PlaceType) => {
    const next = filter.placeTypes.includes(type)
      ? filter.placeTypes.filter(t => t !== type)
      : [...filter.placeTypes, type]
    onChange({ ...filter, placeTypes: next })
  }

  const setTransport = (transportation: TransportType) => onChange({ ...filter, transportation })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Sort */}
      <div style={{ paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <SectionLabel>정렬</SectionLabel>
        {SORT_OPTIONS.map(opt => (
          <RadioOption
            key={opt.value}
            label={opt.label}
            checked={filter.sort === opt.value}
            onChange={() => setSort(opt.value)}
          />
        ))}
      </div>

      {/* Place types */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
        <SectionLabel>장소 유형</SectionLabel>
        {PLACE_TYPES.map(type => (
          <CheckOption
            key={type}
            label={type}
            checked={filter.placeTypes.includes(type)}
            onChange={() => togglePlaceType(type)}
          />
        ))}
      </div>

      {/* Transportation */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
        <SectionLabel>이동 방법</SectionLabel>
        {TRANSPORT_OPTIONS.map(opt => (
          <RadioOption
            key={opt.value}
            label={`${opt.icon} ${opt.label}`}
            checked={filter.transportation === opt.value}
            onChange={() => setTransport(opt.value)}
          />
        ))}
      </div>

      {/* Reset */}
      <div style={{ paddingTop: 20 }}>
        <button
          onClick={onReset}
          disabled={isDefault}
          style={{
            width: '100%', height: 44,
            borderRadius: 'var(--radius-md)',
            border: isDefault ? '1px solid var(--border)' : '1px solid var(--border-amber)',
            background: isDefault ? 'transparent' : 'rgba(245,166,35,0.08)',
            color: isDefault ? 'var(--fg-4)' : 'var(--primary)',
            fontSize: 14, fontWeight: 600, cursor: isDefault ? 'default' : 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'all var(--dur-fast) var(--ease-out)',
          }}
        >
          초기화
        </button>
      </div>
    </div>
  )
}
