import { Outlet } from 'react-router-dom'
import { Header } from './header'
import BottomNavigation from './BottomNavigation'
import TreasureChestAnimation from './TreasureChestAnimation'
import { useWalletContext } from '../hooks/useWalletContext'

export function Layout() {
  const { 
    isAuthenticated, 
    showTreasureChest, 
    welcomeCards, 
    setShowTreasureChest 
  } = useWalletContext();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {isAuthenticated && <BottomNavigation />}
      
      {/* Animação do baú do tesouro global */}
      <TreasureChestAnimation
        show={showTreasureChest}
        onClose={() => setShowTreasureChest(false)}
        cards={welcomeCards}
      />
    </div>
  )
} 