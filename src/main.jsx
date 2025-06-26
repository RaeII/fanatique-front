import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './i18n' // Import i18n configuration
import './index.css'

import { Layout } from './components/layout'
import { AdminNav } from './components/AdminNav'
import HomePage from './pages/home'
import AppPage from './pages/app'
import DashboardPage from './pages/dashboard'
import AdminClubsPage from './pages/admin-clubs'
import AdminEstablishmentsPage from './pages/admin-establishments'
import AdminProductsPage from './pages/admin-products'
import AdminQuestsPage from './pages/admin-quests'
import { ThemeProvider } from './components/theme-provider'
import { WalletProvider } from './contexts/WalletContext'
import { UserProvider } from './contexts/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminStadiumsPage from './pages/admin-stadiums'
import HomeClubsPage from './pages/home-clubs'
import StadiumOrdersPage from './pages/stadium-orders'
import OrderDetailsPage from './pages/order-details'
import OrdersHistoryPage from './pages/orders-history'
import GamePage from './pages/game'
import ClubForumPage from './pages/club-forum'
import ForumPostPage from './pages/forum-post'
import MatchesPage from './pages/matches'
import ProfilePage from './pages/profile'
import TeamsDirectoryPage from './pages/teams-directory'
import BuyFantokensPage from './pages/buy-fantokens'
import MyBetsPage from './pages/my-bets'
import CardsPage from './pages/cards'

// Criar uma instância do QueryClient para o TanStack Query
const queryClient = new QueryClient()

const router = createBrowserRouter([
  
  {
    path: '/',
    element: (
      <>
        <Layout />
{/*         <AdminNav />
 */}      </>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )
      },
/*       {
        path: 'app',
        element: <AppPage />
      },
      {
        path: 'dashboard',
        element: (
          // <ProtectedRoute>
            <DashboardPage />
          // {</ProtectedRoute> }
        )
      } ,*/
      {
        path: 'clubs/:clubId/quests',
        element: (
          <ProtectedRoute>
            <Navigate to="/clubs/:clubId?tab=quests" replace />
          </ProtectedRoute>
        )
      },
      {
        path: 'clubs/:clubId/forum',
        element: (
          <ProtectedRoute>
            <ClubForumPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'clubs/:clubId/forum/post/:postId',
        element: (
          <ProtectedRoute>
            <ForumPostPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'clubs',
        element: (
          <ProtectedRoute>
            <HomeClubsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'clubs/:clubId',
        element: (
          <ProtectedRoute>
            <HomeClubsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'game/:clubId/:gameId',
        element: (
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'stadium-orders/:clubId/:gameId',
        element: (
          <ProtectedRoute>
            <StadiumOrdersPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders/:orderId',
        element: (
          <ProtectedRoute>
            <OrderDetailsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrdersHistoryPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'matches',
        element: (
          <ProtectedRoute>
            <MatchesPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/clubes',
        element: <AdminClubsPage />
      },
      {
        path: 'admin/estadios',
        element: <AdminStadiumsPage />
      },
      {
        path: 'admin/estabelecimentos',
        element: <AdminEstablishmentsPage />
      },
      {
        path: 'admin/produtos',
        element: <AdminProductsPage />
      },
      {
        path: 'admin/quests',
        element: <AdminQuestsPage />
      },
      {
        path: 'pedidos',
        element: (
          <ProtectedRoute>
            <div className="container mx-auto px-4 py-16">Página de Pedidos em breve...</div>
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'teams',
        element: (
          <ProtectedRoute>
            <TeamsDirectoryPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'buy-fantokens',
        element: (
          <ProtectedRoute>
            <BuyFantokensPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'tokens',
        element: (
          <ProtectedRoute>
            <BuyFantokensPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'my-bets',
        element: (
          <ProtectedRoute>
            <MyBetsPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'cards',
        element: (
          <ProtectedRoute>
            <CardsPage />
          </ProtectedRoute>
        )
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="fanatique-theme">
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <UserProvider>
            <RouterProvider router={router} />
            <Toaster 
                position="top-right"
                gutter={20}
                containerStyle={{
                  top: 80,
                  right: 20,
                }}
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#1D7D40',
                      },
                    },
                  },
                }}
              />
          </UserProvider>
        </WalletProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
