import React from 'react'

export default function useStrokeDashOffset({ min, value, dashArray }) {
  const [dashOffset, setDashOffset] = React.useState(min)

  React.useEffect(() => {
    const dashOffset = Math.abs(dashArray - parseInt(value, 10))
    setDashOffset(dashOffset)
  }, [value, dashArray])

  return [dashOffset]
}
