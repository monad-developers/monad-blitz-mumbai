'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function Navbar() {
  const { login, authenticated, user, logout } = usePrivy();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm text-white">
      <div className="font-bold text-xl tracking-tighter">Mon-o-Poly</div>
      <div className="flex gap-4 items-center">
        {authenticated ? (
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-80">
              {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Connected'}
            </span>
            <button
              onClick={logout}
              className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={login}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-medium transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
