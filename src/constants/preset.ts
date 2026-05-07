export interface Preset {
  id: string
  title: string
  sub: string
  tone: 'sunset' | 'night' | 'warm'
  vibes: string[]
  region: string
  budget: number
  duration: string
}

export const PRESETS: Preset[] = [
  {
    id: 'han-river-date',
    title: '한강 야경 데이트',
    sub: '해 질 무렵',
    tone: 'sunset',
    vibes: ['로맨틱', '야경'],
    region: '한강',
    budget: 80000,
    duration: '4시간 이상',
  },
  {
    id: 'seongsu-cafe',
    title: '성수 카페 투어',
    sub: '브런치~오후',
    tone: 'warm',
    vibes: ['감성', '힙한'],
    region: '성수',
    budget: 50000,
    duration: '3시간',
  },
  {
    id: 'itaewon-night',
    title: '이태원 펍 크롤',
    sub: '자정까지',
    tone: 'night',
    vibes: ['분위기', '활동적'],
    region: '이태원',
    budget: 100000,
    duration: '4시간 이상',
  },
  {
    id: 'bukchon-walk',
    title: '북촌 한옥 산책',
    sub: '조용한 오후',
    tone: 'warm',
    vibes: ['조용한', '산책', '감성'],
    region: '북촌',
    budget: 40000,
    duration: '2시간',
  },
]
