import { Container } from '@mui/material';
import Page from '../components/Page';
import { ActivityCard } from '../sections/@dashboard'

export default function Dashboard() {
    return (
        <Page title="Sistema de Apoio à Produção">
            <Container>
                <ActivityCard />
            </Container>
        </Page>
    );
}