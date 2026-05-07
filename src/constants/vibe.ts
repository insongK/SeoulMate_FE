export const VIBES = [
  '로맨틱',
  '감성',
  '활동적',
  '조용한',
  '야경',
  '분위기',
  '맛집',
  '산책',
  '힙한',
  '럭셔리',
  '자연',
  '고즈넉한',
] as const

export type Vibe = (typeof VIBES)[number]
