// Path: components\Page\Page.tsx
import React, { ReactNode } from 'react';
import { Box } from '@mui/material';

interface PageProps {
  children: ReactNode;
  title?: string;
  description?: string;
  meta?: React.DetailedHTMLProps<
    React.MetaHTMLAttributes<HTMLMetaElement>,
    HTMLMetaElement
  >[];
}

const Page = ({ children, title = '', description = '', meta }: PageProps) => {
  return (
    <>
      <title>
        {title ? `${title} | SAP` : 'SAP - Sistema de Apoio à Produção'}
      </title>
      {description && <meta name="description" content={description} />}
      {/* Additional meta tags */}
      {meta && meta.map((item, index) => <meta key={index} {...item} />)}
      <Box sx={{ height: '100%' }}>{children}</Box>
    </>
  );
};

export default Page;
