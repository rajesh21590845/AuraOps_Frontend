import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

/**
 * Generic async data fetching hook with loading, error, and refetch support.
 */
export function useAsync(fn, deps = [], options = {}) {
  const { immediate = true, onSuccess, onError } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fn(...args)
      const resolved = result?.data ?? result
      setData(resolved)
      onSuccess?.(resolved)
      return resolved
    } catch (err) {
      setError(err)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (immediate) execute()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute])

  return { data, loading, error, refetch: execute }
}
