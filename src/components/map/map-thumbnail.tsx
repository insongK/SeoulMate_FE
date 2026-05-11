'use client'

import { useRef, useEffect, useState } from 'react'
import { loadKakaoMaps } from '@/lib/kakao'

interface Props {
  places: Array<{ lat: number; lng: number }>
}

export function MapThumbnail({ places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!containerRef.current || places.length === 0) return

    loadKakaoMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return
        const kakao = (window as any).kakao

        const avgLat = places.reduce((s, p) => s + p.lat, 0) / places.length
        const avgLng = places.reduce((s, p) => s + p.lng, 0) / places.length

        const map = new kakao.maps.Map(containerRef.current, {
          center: new kakao.maps.LatLng(avgLat, avgLng),
          level: 6,
        })
        map.setDraggable(false)
        map.setZoomable(false)

        places.forEach(place => {
          new kakao.maps.Marker({
            position: new kakao.maps.LatLng(place.lat, place.lng),
            map,
          })
        })

        if (places.length > 1) {
          new kakao.maps.Polyline({
            path: places.map(p => new kakao.maps.LatLng(p.lat, p.lng)),
            strokeWeight: 2,
            strokeColor: '#F5A623',
            strokeOpacity: 0.85,
            strokeStyle: 'solid',
          }).setMap(map)
        }

        setLoaded(true)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        ref={containerRef}
        style={{
          width: '100%', height: '100%',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
