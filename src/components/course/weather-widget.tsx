import type { Weather } from '@/types/course.types'

export function skyToEmoji(skyStatus: string): string {
  if (skyStatus.includes('맑음'))     return '☀️'
  if (skyStatus.includes('소나기'))   return '⛈️'
  if (skyStatus.includes('비/눈') || skyStatus.includes('눈/비')) return '🌨️'
  if (skyStatus.includes('비'))       return '🌧️'
  if (skyStatus.includes('눈'))       return '❄️'
  if (skyStatus.includes('구름많음')) return '⛅'
  if (skyStatus.includes('흐림'))     return '☁️'
  return '🌤️'
}

export function WeatherWidget({ weather }: { weather: Weather | undefined }) {
  if (!weather) return null

  const emoji = skyToEmoji(weather.skyStatus)

  return (
    <div style={{
      padding: '20px',
      background: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      marginTop: 16,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: 'var(--fg-3)',
        letterSpacing: '.08em', textTransform: 'uppercase',
        marginBottom: 14,
      }}>현재 날씨</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 40, lineHeight: 1 }}>{emoji}</span>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
            <span style={{
              fontSize: 28, fontWeight: 800, color: 'var(--fg)',
              fontFamily: 'var(--font-mono)',
            }}>{weather.temperature}°</span>
            <span style={{ fontSize: 14, color: 'var(--fg-2)', fontWeight: 600 }}>C</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--fg-2)', fontWeight: 500 }}>
            {weather.skyStatus}
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 'var(--radius-pill)',
            background: weather.rainProbability >= 60
              ? 'rgba(96,165,250,0.12)'
              : 'var(--surface-2)',
            border: `1px solid ${weather.rainProbability >= 60 ? 'rgba(96,165,250,0.3)' : 'var(--border)'}`,
          }}>
            <span style={{ fontSize: 12 }}>🌂</span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: weather.rainProbability >= 60 ? '#60a5fa' : 'var(--fg-3)',
              fontFamily: 'var(--font-mono)',
            }}>{weather.rainProbability}%</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>강수 확률</span>
        </div>
      </div>

      {weather.weatherAlert && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          fontSize: 12, color: '#f87171',
          display: 'flex', gap: 6, alignItems: 'flex-start',
        }}>
          <span style={{ flexShrink: 0 }}>⚠️</span>
          <span>{weather.weatherAlert}</span>
        </div>
      )}
    </div>
  )
}
