import React from 'react'
import { Label as BaseLabel } from '@rebass/forms/styled-components'

const Label = props => (
  <BaseLabel color="primaryText" fontWeight="normal" mb={1} width="auto" {...props} />
)

export default Label
