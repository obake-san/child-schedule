import { useState, useEffect } from 'react'

// Desktop
export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 640) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

// Custom hook for device detection with resize listener
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(() => getDeviceType())

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType())
    }

    let timeoutId
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleResize, 150)
    }

    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return deviceType
}

// Get responsive value based on device type
export const getResponsiveValue = (mobileValue, tabletValue, desktopValue, deviceType) => {
  switch (deviceType) {
    case 'mobile':
      return mobileValue
    case 'tablet':
      return tabletValue
    case 'desktop':
      return desktopValue
    default:
      return desktopValue
  }
}

// Check if device is touch-enabled
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return (
    (typeof window.ontouchstart !== 'undefined') ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)
  )
}

// Check media query
export const matchesMedia = (query) => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

// Get viewport size
export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 1024, height: 768 }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}
