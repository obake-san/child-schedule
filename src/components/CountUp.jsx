import { useEffect, useState } from 'react'

export function CountUp({ target, duration = 2000, label = '' }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === undefined || target === null) return

    let start = 0
    const increment = target / (duration / 16) // 16ms per frame (60fps)
    let animationId

    const animate = () => {
      start += increment
      if (start < target) {
        setCount(Math.floor(start))
        animationId = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [target, duration])

  return (
    <div className="count-up-item">
      <div className="count-up-number">{count.toLocaleString('ja-JP')}</div>
      <div className="count-up-label">{label}</div>
    </div>
  )
}
