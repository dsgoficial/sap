// Path: features\fieldActivities\components\management\CampoDetailDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Campo } from '@/types/fieldActivities';
import ProdutosCampoTab from './ProdutosCampoTab';
import FotosTab from './FotosTab';
import TracksTab from './TracksTab';

interface CampoDetailDialogProps {
  open: boolean;
  campo: Campo | null;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

export const CampoDetailDialog = ({
  open,
  campo,
  onClose,
}: CampoDetailDialogProps) => {
  const [tab, setTab] = useState(0);

  if (!campo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {campo.nome}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant="fullWidth"
        >
          <Tab label="Produtos" />
          <Tab label="Fotos" />
          <Tab label="Tracks" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <ProdutosCampoTab campoId={campo.id} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <FotosTab campoId={campo.id} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <TracksTab campoId={campo.id} />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampoDetailDialog;
