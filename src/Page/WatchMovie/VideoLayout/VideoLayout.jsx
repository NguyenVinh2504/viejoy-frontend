import styles from './video-layout.module.css'

import { Captions, Controls, Gesture } from '@vidstack/react'

import * as Buttons from './components/buttons'
import * as Menus from './components/menus'
import * as Sliders from './components/sliders'
import { TimeGroup } from './components/time-group'
import { Box, Stack, useMediaQuery } from '@mui/material'

import { BufferingIndicator } from './components/BufferingIndicator'
import * as KeyBoard from './components/keyboard'
import { useEffect, useRef, useState } from 'react'

function VideoLayout({ canShowEpisodes, showEpisodes, onToggleEpisodes }) {
  const isMobile = useMediaQuery('(max-width: 767.98px)')

  return (
    <>
      <Gestures />
      <BufferingIndicator />
      <Captions className={styles.captions} />

      {!isMobile && <KeyBoard.KeyBoardAction />}
      {!isMobile ? (
        <ControlsDesktop
          canShowEpisodes={canShowEpisodes}
          showEpisodes={showEpisodes}
          onToggleEpisodes={onToggleEpisodes}
        />
      ) : (
        <ControlsMobile />
      )}
    </>
  )
}

function ControlsDesktop({ canShowEpisodes, showEpisodes, onToggleEpisodes }) {
  return (
    <Controls.Root className={styles.controls}>
      <div className={styles.spacer} />
      <Controls.Group
        className={`${styles.controlsGroup} ${styles.controlsGroupMobile}`}
        style={{
          pointerEvents: 'none'
        }}
      >
        <div className={styles.spacer} />
        <Box
          sx={{
            display: 'none',
            '@media (hover: none) and (pointer: coarse)': {
              '&': {
                display: 'block'
              }
            }
          }}
        >
          <Buttons.PlayMobile
            sx={{
              '& svg': {
                width: '36px',
                height: '36px'
              }
            }}
          />
        </Box>
        <div className={styles.spacer} />
      </Controls.Group>
      <Controls.Group className={styles.controlsGroup}>
        <Sliders.Time />
      </Controls.Group>
      <Controls.Group className={styles.controlsGroup}>
        <Buttons.Play tooltipPlacement='top start' />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            ml: {
              sm: 0.75,
              md: 0
            },
            '@media (hover: hover) and (pointer: fine)': {
              '&:hover .volume-slider': {
                width: '72px'
              }
            },
            '@media (hover: none) and (pointer: coarse)': {
              '& .volume-slider': {
                width: '72px'
              }
            }
          }}
        >
          <Buttons.Mute tooltipPlacement='top' />
          <Sliders.Volume />
        </Box>
        <TimeGroup />
        <div className={styles.spacer} />
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{
            gap: {
              xs: 0,
              sm: 0.75,
              md: 0
            }
          }}
        >
          <Buttons.Caption tooltipPlacement='top' />
          <Menus.Settings placement='top end' tooltipPlacement='top' />
          {canShowEpisodes && (
            <Buttons.EpisodesButton
              tooltipPlacement='top'
              showEpisodes={showEpisodes}
              onToggleEpisodes={onToggleEpisodes}
            />
          )}
          <Buttons.Fullscreen tooltipPlacement='top end' />
        </Stack>
      </Controls.Group>
    </Controls.Root>
  )
}

function ControlsMobile() {
  return (
    <Controls.Root className={styles.controls}>
      <Controls.Group className={styles.controlsGroup}>
        <div className={styles.spacer} />
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{
            gap: 0.75
          }}
        >
          <Buttons.Caption tooltipPlacement='top' />
          <Menus.SettingsMobile placement='top end' tooltipPlacement='top' />
        </Stack>
      </Controls.Group>
      <Controls.Group
        className={`${styles.controlsGroup} ${styles.controlsGroupMobile}`}
        style={{
          pointerEvents: 'none'
        }}
      >
        <div className={styles.spacer} />
        <Buttons.SeekBack />
        <Buttons.PlayMobile />
        <Buttons.SeekForward />
        <div className={styles.spacer} />
      </Controls.Group>
      <div className={styles.spacer} />
      <Controls.Group className={styles.controlsGroup}>
        <TimeGroup />
        <div className={styles.spacer} />
        <Buttons.Fullscreen tooltipPlacement='top end' />
      </Controls.Group>
      <Controls.Group className={styles.controlsGroup}>
        <Sliders.Time />
      </Controls.Group>
    </Controls.Root>
  )
}

function useAutoHide(delay = 1000) {
  const hasInteractedRef = useRef(false)
  const [visible, setVisible] = useState(false)

  const timerRef = useRef(null)

  const show = () => {
    setVisible(true)
    if (!hasInteractedRef.current) hasInteractedRef.current = true

    clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, delay)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
  return [visible, show, hasInteractedRef.current]
}

function Gestures() {
  const [seekBackward, setSeekBackward, hasInteractedSeekBackward] = useAutoHide(500)
  const [seekForward, setSeekForward, hasInteractedSeekForward] = useAutoHide(500)

  function handleSeekBackward() {
    setSeekBackward(true)
  }

  function handleSeekForward() {
    setSeekForward(true)
  }
  return (
    <>
      <Box
        sx={{
          '--fade-in-animation': 'fade-in 0.5s linear both',
          '--fade-out-animation': 'fade-out 0.5s linear both',
          '@media (hover: none) and (pointer: coarse)': {
            visibility: 'visible'
          },
          visibility: 'hidden',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          '@keyframes fade-in': {
            '0%': {
              opacity: 0
            },
            '100%': {
              opacity: 0.25
            }
          },
          '@keyframes fade-out': {
            '0%': {
              opacity: 0.25
            },
            '100%': {
              opacity: 0
            }
          }
        }}
      >
        <Box
          sx={{
            '--animation': seekBackward
              ? 'var(--fade-in-animation)'
              : hasInteractedSeekBackward
                ? 'var(--fade-out-animation)'
                : 'none',
            position: 'absolute',
            width: '100%',
            height: '200%',
            pointerEvents: 'none',
            backgroundColor: '#fff',
            borderRadius: '50%',
            top: '50%',
            opacity: 0,
            transform: 'translate(-60%, -50%)',
            animation: 'var(--animation)'
          }}
          // onAnimationEnd={() => handleSeekBackward(false)}
        ></Box>

        <Box
          sx={{
            '--animation': seekForward
              ? 'var(--fade-in-animation)'
              : hasInteractedSeekForward
                ? 'var(--fade-out-animation)'
                : 'none',
            position: 'absolute',
            width: '100%',
            height: '200%',
            pointerEvents: 'none',
            backgroundColor: '#fff',
            borderRadius: '50%',
            top: '50%',
            opacity: 0,
            transform: 'translate(60%, -50%)',
            animation: 'var(--animation)'
          }}
        ></Box>
      </Box>
      <Gesture className={styles.gesture} event='pointerup' action='toggle:paused' />
      <Gesture className={styles.gesture} event='dblpointerup' action='toggle:fullscreen' />
      <Gesture className={styles.gesture} event='pointerup' action='toggle:controls' />
      <Gesture
        className={styles.gesture}
        event='dblpointerup'
        action='seek:-10'
        onTrigger={() => handleSeekBackward(true)}
      />
      <Gesture
        className={styles.gesture}
        event='dblpointerup'
        action='seek:10'
        onTrigger={() => handleSeekForward(true)}
      />
    </>
  )
}

export default VideoLayout
