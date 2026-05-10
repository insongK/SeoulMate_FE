export const VIBES = [
  '로맨틱',
  '힙한',
  '낭만적인',
  '조용한',
  '활기찬',
  '고즈넉한',
  '현대적인',
  '감성적인',
  '자연친화적',
] as const

export type Vibe = (typeof VIBES)[number]
