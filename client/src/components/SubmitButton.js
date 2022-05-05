import React from 'react'
import LoadingButton from '@mui/lab/LoadingButton';

const SubmitButton = ({ submitting, disabled, children, ...rest }) => {
  return (
    <LoadingButton
      loading={submitting}
      variant="outlined"
      disabled={disabled || submitting}
      {...rest}
    >
      {children}
    </LoadingButton>
  )
}

export default SubmitButton
