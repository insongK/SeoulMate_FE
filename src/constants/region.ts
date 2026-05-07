export const REGIONS = [
  '강남',
  '홍대',
  '성수',
  '한남',
  '이태원',
  '연남',
  '종로',
  '북촌',
  '압구정',
  '잠실',
  '여의도',
  '한강',
  '명동',
  '인사동',
  '서울숲',
] as const

export const QUICK_REGIONS = ['홍대', '강남', '성수', '한남'] as const

export type Region = (typeof REGIONS)[number]
