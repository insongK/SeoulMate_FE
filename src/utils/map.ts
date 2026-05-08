export interface LatLng { lat: number; lng: number }

export function getMidpoint(coords: LatLng[]): LatLng {
  if (!coords.length) return { lat: 37.5665, lng: 126.978 }
  return {
    lat: coords.reduce((s, c) => s + c.lat, 0) / coords.length,
    lng: coords.reduce((s, c) => s + c.lng, 0) / coords.length,
  }
}

export function haversine(a: LatLng, b: LatLng): number {
  const R = 6371e3
  const φ1 = (a.lat * Math.PI) / 180, φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180
  const aa = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa))
}

export function totalDistance(coords: LatLng[]): number {
  return coords.slice(1).reduce((sum, c, i) => sum + haversine(coords[i], c), 0)
}

export function walkingMinutes(metres: number): number {
  return Math.round(metres / 80)
}
