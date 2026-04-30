const splitStops = (route: string): string[] =>
  route
    .split(/\s*(?:-|–|—|>|→|\/|\\)\s*/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)

export const buildGoogleMapsDirectionsUrl = (route: string): string | null => {
  const normalized = route.trim()
  if (!normalized) {
    return null
  }

  const stops = splitStops(normalized)

  if (stops.length >= 2) {
    const origin = stops[0] ?? ''
    const destination = stops[stops.length - 1] ?? ''
    const waypoints = stops.slice(1, -1)

    if (!origin || !destination) {
      return null
    }

    const params = new URLSearchParams({
      api: '1',
      travelmode: 'driving',
      origin,
      destination,
    })

    if (waypoints.length > 0) {
      params.set('waypoints', waypoints.join('|'))
    }

    return `https://www.google.com/maps/dir/?${params.toString()}`
  }

  const params = new URLSearchParams({
    api: '1',
    query: normalized,
  })

  return `https://www.google.com/maps/search/?${params.toString()}`
}
