'use client';

import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';
import './globals.css';

// Default to mainnet for agentic commerce
const ENVIRONMENT = process.env.NEXT_PUBLIC_MULTIVERSX_NETWORK || 'mainnet';

// Use env variable with fallback to your specific ID
const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '9b1a9564f91cb659ffe21b73d5c4e2d8';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <DappProvider
          environment={ENVIRONMENT}
          customNetworkConfig={{
            name: 'customConfig',
            apiTimeout: 6000,
            walletConnectV2ProjectId: WALLET_CONNECT_PROJECT_ID,
          }}
        >
          <TransactionsToastList />
          <NotificationModal />
          {/* Fereastra modala pentru generarea tranzactiilor */}
          <SignTransactionsModals className="custom-class-for-modals" />
          {children}
        </DappProvider>
      </body>
    </html>
  );
}