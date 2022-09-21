import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const StyledText = styled.span`
  color: ${(props) => props.theme.text.fill};
  display: block;
  text-align: ${(props) => props.theme.text.textAlign};
  font-size: ${(props) => props.theme.text.fontSize};
`

const Text = ({ text, value }) => {
  const renderText = text || `${Math.round(value)}%`

  return <StyledText>{renderText}</StyledText>
}

Text.defaultProps = {
  text: ''
}

Text.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  value: PropTypes.number
}

export default Text
