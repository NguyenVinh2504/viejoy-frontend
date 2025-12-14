import { useState } from 'react'

/**
 * State có thể thay đổi local, nhưng sẽ tự động sync khi externalValue thay đổi.
 * Sử dụng pattern "điều chỉnh state trong render" thay vì useEffect để tránh render thừa.
 *
 * @param {any} externalValue - Giá trị từ bên ngoài (prop, URL, computed value, etc.)
 * @returns {[any, Function]} - [value, setValue] giống useState
 *
 * @example
 * // Sync selectedIndex với currentSeason prop
 * const [selectedIndex, setSelectedIndex] = useSyncedState(currentSeason)
 *
 * // User có thể thay đổi selectedIndex qua dropdown
 * // Khi currentSeason thay đổi (URL đổi), selectedIndex sẽ tự động sync
 */
function useSyncedState(externalValue) {
  const [localValue, setLocalValue] = useState(externalValue)
  const [prevExternalValue, setPrevExternalValue] = useState(externalValue)

  if (externalValue !== prevExternalValue) {
    setPrevExternalValue(externalValue)
    setLocalValue(externalValue)
  }

  return [localValue, setLocalValue]
}

export default useSyncedState
