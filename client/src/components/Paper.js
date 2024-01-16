
import {
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

const PaperStyled = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: '200px',
    display: 'flex',
    alignItems: 'center'
}));

export default PaperStyled;