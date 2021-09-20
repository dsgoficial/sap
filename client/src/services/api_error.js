const APIError = (err, setSnackbar) => {
  if (
    'response' in err &&
    'data' in err.response &&
    'message' in err.response.data
  ) {
    setSnackbar({ status: 'error', msg: err.response.data.message, date: new Date() })
  } else {
    setSnackbar({ status: 'error', msg: 'Ocorreu um erro ao se comunicar com o servidor.', date: new Date() })
  }
}

export default APIError
