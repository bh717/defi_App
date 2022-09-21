import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider } from 'styled-components'

import { VIEWBOX_X2 } from '../constants'

import baseStyles from '../config/theme'
import { calculateSafeValue } from '../utils'

import Svg from './Svg'
import Path from './Path'
import Text from './Text'

const ProgressBarLine = ({
  value: propValue,
  min,
  max,
  strokeWidth,
  trailWidth,
  text,
  flip,
  styles
}) => {
  const [value, setValue] = React.useState(max)

  React.useEffect(() => {
    const safeValue = calculateSafeValue({ min, max, propValue })
    setValue(((safeValue - min) * VIEWBOX_X2) / (max - min))
  }, [propValue])

  const theme = Object.assign({}, baseStyles, styles)

  return (
    <ThemeProvider theme={theme}>
      <Text text={text} value={value} />
      <Svg strokeWidth={strokeWidth}>
        <Path
          trail
          value={VIEWBOX_X2}
          min={min}
          max={max}
          strokeWidth={strokeWidth}
          trailWidth={trailWidth}
        />
        <Path
          value={value}
          min={min}
          max={max}
          strokeWidth={strokeWidth}
          trailWidth={trailWidth}
          flip={flip}
        />
      </Svg>
    </ThemeProvider>
  )
}

ProgressBarLine.defaultProps = {
  value: 50,
  min: 0,
  max: 100,
  strokeWidth: 5,
  trailWidth: 5
}

ProgressBarLine.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  strokeWidth: PropTypes.number,
  trailWidth: PropTypes.number
}

export default ProgressBarLine
