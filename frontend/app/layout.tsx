'use client';

import { DappProvider } from '@multiversx/sdk-dapp/wrappers/DappProvider';
import { SignTransactionsModals } from '@multiversx/sdk-dapp/UI/SignTransactionsModals';
import { TransactionsToastList } from '@multiversx/sdk-dapp/UI/TransactionsToastList';
import { NotificationModal } from '@multiversx/sdk-dapp/UI/NotificationModal';
import { DappCoreUIWrapper } from '@multiversx/sdk-dapp/UI/DappCoreUIWrapper';
import './globals.css';

const ENVIRONMENT = 'devnet';

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
            walletConnectV2ProjectId: '9b1a9564f91cb659ffe21b73d5c4e2d8', // public fallback id for testing
          }}
        >
          <DappCoreUIWrapper>
            <TransactionsToastList />
            <NotificationModal />
            {/* Aceasta este fereastra modala care va aparea cand Agentul genereaza tranzactia */}
            <SignTransactionsModals className="custom-class-for-modals" />
            {children}
          </DappCoreUIWrapper>
        </DappProvider>
      </body>
    </html>
  );
}
