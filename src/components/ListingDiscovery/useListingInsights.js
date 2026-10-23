import { useEffect, useState } from "react"
import { loadInsightIndex } from "../../helpers/listingInsights.js"

export function useListingInsights() {
  const [insights, setInsights] = useState({})
  const [lookupUnavailable, setLookupUnavailable] = useState(false)

  const apply = (result) => {
    const map = {}
    ;(result.insights || []).forEach((item) => {
      if (item && item.tokenId) map[item.tokenId] = item
    })
    setInsights(map)
    setLookupUnavailable(result.remote === false)
  }

  useEffect(() => {
    let cancelled = false
    loadInsightIndex()
      .then((result) => {
        if (!cancelled) apply(result)
      })
      .catch(() => {
        if (!cancelled) setLookupUnavailable(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const refreshInsights = () => loadInsightIndex({ refresh: true }).then(apply).catch(() => setLookupUnavailable(true))

  return { insights, lookupUnavailable, refreshInsights }
}
