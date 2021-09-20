import { makeStyles } from '@material-ui/core/styles'

const styles = makeStyles(theme => ({
  overflow: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3, 2),
    elevation: 3
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  link: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    textDecoration: 'none'
  }
}))

export default styles
