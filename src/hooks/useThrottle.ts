import { useCallback, useEffect, useRef } from 'react'
import throttle from 'lodash.throttle'

// Module-level constant: a fresh default object each call would change the
// useCallback dependency identity every render and rebuild the throttle.
const DEFAULT_OPTIONS = { leading: true, trailing: false }

export const useThrottle = (
  cb: CallableFunction,
  delay: number,
  options = DEFAULT_OPTIONS,
) => {
  const cbRef = useRef(cb)
  // use mutable ref to make useCallback/throttle not depend on `cb` dep
  useEffect(() => {
    cbRef.current = cb
  })
  return useCallback(
    throttle((...args) => cbRef.current(...args), delay, options),
    [delay, options],
  )
}
