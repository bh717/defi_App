import React from 'react'

import useStrokeDashOffset from './useStrokeDashOffset'

import { VIEWBOX_X1, VIEWBOX_X2 } from '../constants'

export default function usePath({
  min,
  max,
  value,
  strokeWidth,
  trailWidth,
  flip
}) {
  const [dashArray, setDashArray] = React.useState(max)
  const [draw, setDraw] = React.useState('')

  const x1 = flip ? VIEWBOX_X2 : VIEWBOX_X1
  const x2 = flip ? VIEWBOX_X1 : VIEWBOX_X2

  React.useEffect(() => {
    const center =
      (strokeWidth > trailWidth
        ? Math.max(strokeWidth, trailWidth)
        : Math.min(strokeWidth, trailWidth)) / 2

    setDraw(`
      M ${x1},${center}
      L ${x2},${center}
    `)
  }, [strokeWidth, trailWidth])

  const ref = React.useCallback(
    (pathEl) => {
      if (pathEl !== null) {
        setDashArray(pathEl.getTotalLength())
      }
    },
    [draw]
  )

  return [
    ref,
    draw,
    dashArray,
    ...useStrokeDashOffset({ min, max, value, dashArray })
  ]
}
