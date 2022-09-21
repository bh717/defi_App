import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { VIEWBOX_WIDTH } from '../constants'

const StyledSvg = styled.svg`
  width: 100%;
  display: block;
`

const Svg = ({ children, strokeWidth }) => {
  return (
    <StyledSvg viewBox={`0 0 ${VIEWBOX_WIDTH} ${strokeWidth}`}>
      {children}
    </StyledSvg>
  )
}

Svg.propTypes = {
  children: PropTypes.node.isRequired
}

export default Svg
