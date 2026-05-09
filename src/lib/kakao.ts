let _promise: Promise<void> | null = null

export async function loadKakaoMaps(): Promise<void> {
  if (typeof window === 'undefined') return
  if ((window as any).kakao?.maps?.Map) return
  if (_promise) return _promise

  _promise = new Promise<void>((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY
    if (!key) { _promise = null; reject(new Error('no-key')); return }

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`
    script.onload = () => (window as any).kakao.maps.load(resolve)
    script.onerror = () => {
      _promise = null  // 실패 시 캐시 초기화 → 다음 호출에서 재시도 가능
      reject(new Error('sdk-load-failed'))
    }
    document.head.appendChild(script)
  })

  return _promise
}
