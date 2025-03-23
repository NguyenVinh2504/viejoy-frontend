import styles from './video-layout.module.css'

import { Captions, Controls, Gesture } from '@vidstack/react'

import * as Buttons from './components/buttons'
import * as Menus from './components/menus'
import * as Sliders from './components/sliders'
import { TimeGroup } from './components/time-group'
import { Box, Stack, useMediaQuery } from '@mui/material'

import { BufferingIndicator } from './components/BufferingIndicator'
import * as KeyBoard from './components/keyboard'
import { useState } from 'react'
function VideoLayout() {
  const isMobile = useMediaQuery('(max-width: 767.98px)')

  return (
    <>
      <Gestures />
      <BufferingIndicator />
      <Captions className={styles.captions} />

      {!isMobile && <KeyBoard.KeyBoardAction />}
      {!isMobile ? <ControlsDesktop /> : <ControlsMobile />}
    </>
  )
}

function ControlsDesktop() {
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
          <Buttons.PIP tooltipPlacement='top' />
          <Menus.Settings placement='top end' tooltipPlacement='top' />
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
        <Buttons.PIP tooltipPlacement='top' />
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

function Gestures() {
  const [seekBackward, setSeekBackward] = useState(false)
  const [seekForward, setSeekForward] = useState(false)
  function handleSeekBackward() {
    setSeekBackward((prev) => !prev)
  }

  function handleSeekForward() {
    setSeekForward((prev) => !prev)
  }
  return (
    <>
      <Box
        sx={{
          '@media (hover: none) and (pointer: coarse)': {
            display: 'block'
          },
          '--animation': 'fade 0.8s linear both',
          display: 'none',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          '@keyframes fade': {
            '0%': {
              opacity: 0
            },
            '50%': {
              opacity: '0.25'
            },
            '100%': {
              opacity: 0
            }
          }
        }}
      >
        {seekBackward && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '200%',
              pointerEvents: 'none',
              backgroundColor: '#fff',
              borderRadius: '50%',
              top: '50%',
              opacity: '0.25',
              transform: 'translate(-60%, -50%)',
              animation: 'var(--animation)'
            }}
            onAnimationEnd={handleSeekBackward}
          ></Box>
        )}
        {seekForward && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '200%',
              pointerEvents: 'none',
              backgroundColor: '#fff',
              borderRadius: '50%',
              top: '50%',
              opacity: '0.25',
              transform: 'translate(60%, -50%)',
              animation: 'var(--animation)'
            }}
            onAnimationEnd={handleSeekForward}
          ></Box>
        )}
      </Box>
      <Gesture className={styles.gesture} event='pointerup' action='toggle:paused' />
      <Gesture className={styles.gesture} event='dblpointerup' action='toggle:fullscreen' />
      <Gesture className={styles.gesture} event='pointerup' action='toggle:controls' />
      <Gesture className={styles.gesture} event='dblpointerup' action='seek:-10' onTrigger={handleSeekBackward} />
      <Gesture className={styles.gesture} event='dblpointerup' action='seek:10' onTrigger={handleSeekForward} />
    </>
  )
}

export default VideoLayout
