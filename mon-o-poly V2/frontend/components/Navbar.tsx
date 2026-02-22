'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function Navbar() {
  const { login, authenticated, user, logout } = usePrivy();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-[#0E091C]/90 backdrop-blur-md border-b border-white/5">
      <div className="font-display font-bold text-xl tracking-tight text-white">
        Mon-o-poly
      </div>
      <div className="flex items-center gap-3">
        {authenticated ? (
          <>
            <span className="font-mono-brand text-sm text-white/70">
              {user?.wallet?.address
                ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                : 'Connected'}
            </span>
            <button
              onClick={logout}
              className="font-mono-brand text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={login}
            className="font-mono-brand font-medium px-5 py-2.5 rounded-lg bg-[#6E54FF] hover:bg-[#7d65ff] text-white transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
