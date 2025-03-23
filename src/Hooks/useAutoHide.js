import { useEffect, useState } from 'react'

function useAutoHide(timestamp, duration = 1000) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (timestamp) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [timestamp, duration])

  return isVisible
}

export default useAutoHide
