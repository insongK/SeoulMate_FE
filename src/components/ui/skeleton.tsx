'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
  style?: React.CSSProperties
}

export function Skeleton({ width, height, borderRadius = 'var(--radius-md)', style }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--surface-2)',
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

export function CourseCardSkeleton({ viewMode }: { viewMode: 'grid' | 'list' }) {
  const isList = viewMode === 'list'
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        gap: isList ? 14 : 0,
        padding: isList ? 14 : 0,
      }}
    >
      <Skeleton
        width={isList ? 96 : '100%'}
        height={isList ? 96 : 160}
        borderRadius={isList ? 'var(--radius-md)' : '0'}
        style={{ flexShrink: 0 }}
      />
      <div style={{ flex: 1, padding: isList ? '0' : '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skeleton width={80} height={20} borderRadius="var(--radius-pill)" />
        <Skeleton width="75%" height={20} />
        <Skeleton width="90%" height={14} />
        <Skeleton width="60%" height={14} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Skeleton width={80} height={20} />
          <Skeleton width={60} height={20} borderRadius="var(--radius-pill)" />
        </div>
      </div>
    </div>
  )
}
