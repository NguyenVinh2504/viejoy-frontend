import { memo, useEffect, useState, useRef } from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { useMediaState } from '@vidstack/react'
import { CSSTransition } from 'react-transition-group'
import { useGoWatchMovie } from '~/Hooks'
import tmdbConfigs from '~/api/configs/tmdb.configs'
import Image from '~/components/Image'
import images from '~/assets/image'
import { CloseIcon, PlayIcon } from '~/components/Icon'
import styles from './NextEpisodeButton.module.css'

const COUNTDOWN_DURATION = 10 // seconds
const SHOW_AT_REMAINING = 60 // seconds

function NextEpisodeButton({ nextEpisode, seasonPosterPath, seriesId }) {
  const { handleOpen } = useGoWatchMovie()
  const currentTime = useMediaState('currentTime')
  const duration = useMediaState('duration')
  const paused = useMediaState('paused')

  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_DURATION)
  const [isHovered, setIsHovered] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const nodeRef = useRef(null)

  // Determine visibility based on time remaining
  // Show when 60s or less remaining
  const isTimeInRange = duration > 0 && duration - currentTime <= SHOW_AT_REMAINING

  // Reset state when seeking back or out of range
  useEffect(() => {
    if (!isTimeInRange) {
      setTimeLeft(COUNTDOWN_DURATION)
      setIsClosed(false)
    }
  }, [isTimeInRange])

  // Timer logic
  useEffect(() => {
    let interval
    if (isTimeInRange && !isClosed && !isHovered && !paused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 0.1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isTimeInRange, isClosed, isHovered, paused, timeLeft])

  const handleNextEpisode = () => {
    if (!nextEpisode) return
    handleOpen({
      id: seriesId,
      mediaType: 'tv',
      episodeNumber: nextEpisode.episode_number,
      seasonNumber: nextEpisode.season_number,
      episodeId: nextEpisode.id
    })
  }

  // Auto hide when timer reaches 0
  useEffect(() => {
    if (timeLeft === 0) {
      setIsClosed(true)
    }
  }, [timeLeft])

  const handleClose = (e) => {
    e.stopPropagation()
    setIsClosed(true)
  }

  const thumbnailSrc =
    nextEpisode?.still_path || seasonPosterPath
      ? tmdbConfigs.posterPath(nextEpisode?.still_path ?? seasonPosterPath)
      : images.noImage19x6

  // Only render if we have a next episode
  if (!nextEpisode) return null

  const show = isTimeInRange && !isClosed

  return (
    <CSSTransition
      in={show}
      timeout={400}
      classNames={{
        enter: styles.slideEnter,
        enterActive: styles.slideEnterActive,
        exit: styles.slideExit,
        exitActive: styles.slideExitActive
      }}
      unmountOnExit
      nodeRef={nodeRef}
    >
      <div className={styles.wrapper} ref={nodeRef}>
        <div
          className={styles.container}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleNextEpisode}
        >
          {/* Progress overlay */}
          <div
            className={styles.progressOverlay}
            style={{
              width: `${(timeLeft / COUNTDOWN_DURATION) * 100}%`
            }}
          />

          {/* Content */}
          <Box className={styles.content}>
            {/* Thumbnail */}
            <Box className={styles.thumbnail}>
              <Image
                alt={nextEpisode?.name}
                src={thumbnailSrc}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <Box className={styles.playOverlay}>
                <PlayIcon />
              </Box>
            </Box>

            {/* Info */}
            <Box className={styles.info}>
              <Typography variant='caption' className={styles.label}>
                Tập tiếp theo
              </Typography>
              <Typography variant='body2' className={styles.title}>
                {`${String(nextEpisode?.episode_number).padStart(2, '0')}. ${nextEpisode?.name || `Tập ${nextEpisode?.episode_number}`}`}
              </Typography>
              <Typography variant='caption' className={styles.countdown}>
                {isHovered || paused ? 'Đã tạm dừng' : `Tự động ẩn sau ${Math.ceil(timeLeft)}s`}
              </Typography>
            </Box>
          </Box>

          {/* Close button */}
          <IconButton className={styles.closeButton} size='small' onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>
    </CSSTransition>
  )
}

export default memo(NextEpisodeButton)
