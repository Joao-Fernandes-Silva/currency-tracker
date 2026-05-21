import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  maxWidth?: string;
}

export default function PageWrapper({ children, maxWidth = '1100px' }: PageWrapperProps) {
  return (
    <div style={{ width: '100%', padding: '0 32px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          paddingTop: '56px',
          paddingBottom: '72px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
