import { useState } from 'react'

/**
 * State sẽ reset về defaultValue khi trigger thay đổi.
 * Sử dụng pattern "điều chỉnh state trong render" thay vì useEffect để tránh render thừa.
 *
 * @param {any} defaultValue - Giá trị mặc định, state sẽ reset về giá trị này
 * @param {any} trigger - Khi giá trị này thay đổi, state sẽ được reset
 * @returns {[any, Function]} - [value, setValue] giống useState
 *
 * @example
 * // Reset selectedServerIndex về 0 khi video_links thay đổi
 * const [selectedServerIndex, setSelectedServerIndex] = useResetState(0, videoData.video_links)
 */
function useResetState(defaultValue, trigger) {
  const [value, setValue] = useState(defaultValue)
  const [prevTrigger, setPrevTrigger] = useState(trigger)

  if (trigger !== prevTrigger) {
    setPrevTrigger(trigger)
    setValue(defaultValue)
  }

  return [value, setValue]
}

export default useResetState
