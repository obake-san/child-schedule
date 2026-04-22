import { useEffect, useState, useRef } from 'react'

export function CountUp({ target, duration = 2000, label = '' }) {
  const [count, setCount] = useState(0)
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (target === undefined || target === null) return

    let start = 0
    const increment = target / (duration / 16) // 16ms per frame (60fps)

    const animate = () => {
      start += increment
      if (start < target) {
        setCount(Math.floor(start))
        animationIdRef.current = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [target, duration])

  return (
    <div className="count-up-item">
      <div className="count-up-number">{count.toLocaleString('ja-JP')}</div>
      <div className="count-up-label">{label}</div>
    </div>
  )
}
