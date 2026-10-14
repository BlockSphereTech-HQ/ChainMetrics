import React, { createContext, useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';

const ConnectWalletModal = lazy(() => import('./components/ConnectWalletModal/ConnectWalletModal'));

const walletAddress = '';
const voteCountChanged = 0;
const synchroTables = 0;
const adminFlag = false;
const allowWalletRestore = true;

export const AppContext = createContext({
  walletAddress,
  voteCountChanged,
  synchroTables,
  adminFlag,
  allowWalletRestore,
  handleWalletAddress() {},
  handleDisconnectWallet() {},
  handleVoteCountChanged() {},
  handleSynchroTables() {},
  handleAdminFlag() {},
  requestWallet() { return Promise.resolve(''); },
  walletPromptOpen: false,
  walletPromptReason: 'connect',
});

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState('');
  const [voteCountChanged, setVoteCountChanged] = useState(0);
  const [synchroTables, setSynchroTables] = useState(0);
  const [adminFlag, setAdminFlag] = useState(false);
  const [allowWalletRestore, setAllowWalletRestore] = useState(true);
  const [walletPromptOpen, setWalletPromptOpen] = useState(false);
  const [walletPromptReason, setWalletPromptReason] = useState('connect');
  const walletPromptRef = useRef(null);

  const finishWalletPrompt = useCallback((address) => {
    setWalletPromptOpen(false);
    const resolve = walletPromptRef.current;
    walletPromptRef.current = null;
    if (resolve) resolve(address || '');
  }, []);

  const requestWallet = useCallback((reason = 'connect') => {
    if (walletAddress) return Promise.resolve(walletAddress);
    return new Promise((resolve) => {
      walletPromptRef.current = resolve;
      setWalletPromptReason(reason || 'connect');
      setWalletPromptOpen(true);
    });
  }, [walletAddress]);

  const handleWalletAddress = useCallback((address) => {
    setWalletAddress(address);
    if (address) setAllowWalletRestore(true);
  }, []);

  const handleDisconnectWallet = useCallback(async () => {
    const { disconnectWallet } = await import('./helpers/wallet');
    await disconnectWallet();
    setWalletAddress('');
    setAllowWalletRestore(false);
  }, []);

  const handleVoteCountChanged = useCallback((count) => setVoteCountChanged(count), []);
  const handleSynchroTables = useCallback((value) => setSynchroTables(value), []);
  const handleAdminFlag = useCallback((flag) => setAdminFlag(flag), []);

  const value = useMemo(
    () => ({
      walletAddress,
      voteCountChanged,
      synchroTables,
      adminFlag,
      allowWalletRestore,
      handleWalletAddress,
      handleDisconnectWallet,
      handleVoteCountChanged,
      handleSynchroTables,
      handleAdminFlag,
      requestWallet,
      walletPromptOpen,
      walletPromptReason,
      finishWalletPrompt,
    }),
    [
      walletAddress,
      voteCountChanged,
      synchroTables,
      adminFlag,
      allowWalletRestore,
      handleWalletAddress,
      handleDisconnectWallet,
      handleVoteCountChanged,
      handleSynchroTables,
      handleAdminFlag,
      requestWallet,
      walletPromptOpen,
      walletPromptReason,
      finishWalletPrompt,
    ]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
      {walletPromptOpen ? (
        <Suspense fallback={null}>
          <ConnectWalletModal
            open
            reason={walletPromptReason}
            onClose={() => finishWalletPrompt('')}
            onConnected={(address) => {
              handleWalletAddress(address);
              finishWalletPrompt(address);
            }}
          />
        </Suspense>
      ) : null}
    </AppContext.Provider>
  );
}
