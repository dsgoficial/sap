import React from 'react'
import ThemeProvider from './theme';
import Router from './routes';
import CssBaseline from '@material-ui/core/CssBaseline'
import 'typeface-roboto'

const App = () => (
  <ThemeProvider>
    <CssBaseline />
    <Router />
  </ThemeProvider>
)

export default App
