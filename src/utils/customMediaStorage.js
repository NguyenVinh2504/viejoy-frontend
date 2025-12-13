import { LocalMediaStorage } from '@vidstack/react'

/**
 * Vấn đề: Vidstack mặc định lưu tiến trình xem theo URL của video.
 * Khi người dùng chuyển server (server1.example → server2.example), URL thay đổi
 * nên tiến trình xem bị mất dù vẫn đang xem cùng một phim.
 *
 * Giải pháp: Override getTime/setTime để lưu theo mediaKey (movie ID hoặc TV show + episode)
 * thay vì URL. Các settings khác (volume, captions...) vẫn dùng LocalMediaStorage mặc định
 * vì chúng nên áp dụng chung cho tất cả video.
 */
export class CustomMediaStorage extends LocalMediaStorage {
  constructor(mediaKey) {
    super()
    this.mediaKey = mediaKey
    this.progressKey = `player-progress-${mediaKey}`

    // Throttle config: chỉ lưu mỗi 1 giây để tránh ghi localStorage liên tục
    this._lastSaveTime = 0
    this._saveInterval = 1000 // 1 giây
    this._pendingTime = null
  }

  /**
   * Lý do override: LocalMediaStorage lưu time theo URL video,
   * nhưng ta cần lưu theo mediaKey để giữ tiến trình khi đổi server
   */
  async getTime() {
    try {
      const stored = localStorage.getItem(this.progressKey)
      if (stored) {
        return parseFloat(stored)
      }
      return null
    } catch {
      return null
    }
  }

  /**
   * Throttle setTime để tránh ghi localStorage quá nhiều lần.
   * Vidstack gọi setTime rất thường xuyên (mỗi frame), nếu không throttle
   * sẽ gây lag và tốn tài nguyên.
   */
  async setTime(time) {
    this._pendingTime = time
    const now = Date.now()

    // Chỉ lưu nếu đã qua khoảng thời gian _saveInterval
    if (now - this._lastSaveTime >= this._saveInterval) {
      this._saveToStorage(time)
      this._lastSaveTime = now
    }
  }

  _saveToStorage(time) {
    try {
      localStorage.setItem(this.progressKey, time.toString())
    } catch {
      // Bỏ qua lỗi localStorage (quota exceeded, private mode...)
    }
  }

  /**
   * Lưu ngay lập tức khi player bị destroy (đổi trang, đóng tab...)
   * để không mất tiến trình đang pending
   */
  onDestroy() {
    if (this._pendingTime !== null) {
      this._saveToStorage(this._pendingTime)
    }
    super.onDestroy?.()
  }
}
