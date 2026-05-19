'use client'

import { useEffect, useState } from 'react'
import type { HandbookSearchResponse, HandbookSearchResult } from '../../../lib/search/handbookSearch'

interface UseHandbookSearchState {
  results: HandbookSearchResult[]
  loading: boolean
  error: string | null
}

export function useHandbookSearch(query: string, limit: number): UseHandbookSearchState {
  const [state, setState] = useState<UseHandbookSearchState>({
    results: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    const normalizedQuery = query.trim()
    if (normalizedQuery.length < 2) {
      setState({ results: [], loading: false, error: null })
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setState((current) => ({ ...current, loading: true, error: null }))

      try {
        const params = new URLSearchParams({ q: normalizedQuery, limit: String(limit) })
        const response = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) throw new Error('Search request failed')

        const data = (await response.json()) as HandbookSearchResponse
        setState({ results: data.results, loading: false, error: null })
      } catch (error) {
        if (controller.signal.aborted) return
        setState({ results: [], loading: false, error: error instanceof Error ? error.message : 'Search failed' })
      }
    }, 200)

    return () => {
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [query, limit])

  return state
}