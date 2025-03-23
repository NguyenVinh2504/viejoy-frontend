import { Box, Typography } from '@mui/material'
import styles from './styles/keyboard.module.css'
import { useMediaState } from '@vidstack/react'
import { MuteIcon, PauseIcon, PlayIcon, VolumeHighIcon, VolumeLowIcon } from '~/components/Icon'
import { useAutoHide } from '~/Hooks'

export function KeyBoardAction() {
  const lastKeyboardAction = useMediaState('lastKeyboardAction')
  const volume = useMediaState('volume')

  const keyboardTimeStamp = lastKeyboardAction?.event?.timeStamp

  const isVisible = useAutoHide(keyboardTimeStamp, 1000)

  if (!isVisible) {
    return null
  }

  const actionType = lastKeyboardAction?.action
  const isSeekBackward = actionType === 'seekBackward'
  const isSeekForward = actionType === 'seekForward'
  const isTogglePaused = actionType === 'togglePaused'
  const isVolume = actionType === 'volumeUp' || actionType === 'volumeDown'

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        m: '8%'
      }}
    >
      {isVolume && (
        <Typography
          variant='h5'
          component='p'
          sx={{
            color: 'white',
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 1,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          {Math.trunc(volume * 100)}%
        </Typography>
      )}

      <Box
        sx={{
          position: 'absolute',
          left: isSeekBackward ? 0 : 'auto',
          right: isSeekForward ? 0 : 'auto',
          ...((isTogglePaused || isVolume) && { left: '50%', transform: 'translateX(-50%)' })
        }}
      >
        {isSeekBackward && <SeekBackwardIcon key={keyboardTimeStamp} />}
        {isSeekForward && <SeekForwardIcon key={keyboardTimeStamp} />}
        {isTogglePaused && <Play key={keyboardTimeStamp} />}
        {isVolume && <Volume key={keyboardTimeStamp} />}
      </Box>
    </Box>
  )
}

export function SeekForwardIcon() {
  return (
    <div className={`${styles.iconContainer} ${styles.fallArrow} ${styles.fallArrowReverse}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export function SeekBackwardIcon() {
  return (
    <div className={`${styles.fallArrow} ${styles.iconContainer}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}

export function Play() {
  const isPaused = useMediaState('paused')
  return <div className={styles.iconContainer}>{isPaused ? <PauseIcon /> : <PlayIcon />}</div>
}

export function Volume() {
  const volume = useMediaState('volume')
  const isMuted = useMediaState('muted')
  return (
    <div className={styles.iconContainer}>
      {isMuted || volume === 0 ? <MuteIcon /> : volume < 0.5 ? <VolumeLowIcon /> : <VolumeHighIcon />}
    </div>
  )
}
