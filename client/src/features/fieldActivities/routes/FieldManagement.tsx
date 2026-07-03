// Path: features\fieldActivities\routes\FieldManagement.tsx
import { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Container } from '@mui/material';
import Page from '@/components/Page/Page';
import CamposTable from '../components/management/CamposTable';
import EstatisticasPanel from '../components/management/EstatisticasPanel';
import CampoLoteTable from '../components/management/CampoLoteTable';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export const FieldManagement = () => {
  const [tab, setTab] = useState(0);

  return (
    <Page title="Gerência de Campos">
      <Container maxWidth="xl" disableGutters>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Gerência de Campos
        </Typography>

        <Paper elevation={1} sx={{ px: 2, pt: 1 }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
            <Tab label="Campos" />
            <Tab label="Estatísticas" />
            <Tab label="Campo × Lote" />
          </Tabs>
        </Paper>

        <TabPanel value={tab} index={0}>
          <CamposTable />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <EstatisticasPanel />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <CampoLoteTable />
        </TabPanel>
      </Container>
    </Page>
  );
};

export default FieldManagement;
