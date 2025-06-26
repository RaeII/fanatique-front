import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Trophy, 
  Store, 
  Ticket, 
  Settings, 
  User, 
  LogOut,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { useWalletContext } from '../hooks/useWalletContext';
import { useUserContext } from '../hooks/useUserContext';

export default function DesktopMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useWalletContext();
  const { userClubsData } = useUserContext();

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: <Home size={20} />, 
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    { 
      label: 'Matches', 
      icon: <Calendar size={20} />, 
      path: '/matches',
      active: location.pathname === '/matches'
    },
    { 
      label: 'Minhas Apostas', 
      icon: <TrendingUp size={20} />, 
      path: '/my-bets',
      active: location.pathname === '/my-bets'
    },
    { 
      label: 'Shop', 
      icon: <Store size={20} />, 
      path: '/shop',
      active: location.pathname === '/shop'
    },
    { 
      label: 'Tickets', 
      icon: <Ticket size={20} />, 
      path: '/tickets',
      active: location.pathname === '/tickets'
    },
    { 
      label: 'Cartas', 
      icon: <img src="/dale_card.svg" alt="Cartas" className="w-5 h-5" />, 
      path: '/cards',
      active: location.pathname === '/cards'
    },
  ];

  const secondaryMenuItems = [
    { 
      label: 'Profile', 
      icon: <User size={20} />, 
      path: '/profile',
      active: location.pathname === '/profile'
    },
    { 
      label: 'Settings', 
      icon: <Settings size={20} />, 
      path: '/settings',
      active: location.pathname === '/settings'
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="hidden md:flex flex-col h-screen fixed left-0 top-0 w-60 bg-white dark:bg-[#150924] shadow-md z-40">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary dark:text-white">Fanatique</h1>
        <p className="text-sm text-primary/70 dark:text-white/70">Fan Experience Platform</p>
      </div>

      {/* Main menu */}
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className={`w-full justify-between pl-3 ${
                item.active 
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white font-medium'
                  : 'text-primary/70 dark:text-white/70'
              } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !item.disabled && navigate(item.path)}
              disabled={item.disabled}
            >
              <div className="flex items-center">
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.active && <ChevronRight size={16} />}
            </Button>
          ))}
        </nav>

        {/* Club Followed Section */}
        {userClubsData?.following_clubs?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs uppercase font-semibold text-primary/60 dark:text-white/60 mb-2 px-3">
              Followed Clubs
            </h3>
            <nav className="space-y-1">
              {userClubsData.following_clubs.slice(0, 3).map((clubItem) => (
                <Button
                  key={clubItem.club.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start pl-3 text-primary/70 dark:text-white/70"
                  onClick={() => navigate(`/clubs/${clubItem.club.id}`)}
                >
                  <div className="flex items-center">
                    {clubItem.club.image ? (
                      <img 
                        src={clubItem.club.image} 
                        alt={clubItem.club.name} 
                        className="w-5 h-5 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 mr-3" />
                    )}
                    <span>{clubItem.club.name}</span>
                  </div>
                </Button>
              ))}
              {userClubsData.following_clubs.length > 3 && (
                <Button
                  variant="link"
                  size="sm"
                  className="w-full justify-start pl-3 text-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  View all clubs
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* Secondary menu */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <nav className="space-y-1">
          {secondaryMenuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              size="sm"
              className={`w-full justify-start pl-3 ${
                item.active 
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white font-medium'
                  : 'text-primary/70 dark:text-white/70'
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start pl-3 text-primary/70 dark:text-white/70"
            onClick={handleLogout}
          >
            <span className="mr-3"><LogOut size={20} /></span>
            <span>Logout</span>
          </Button>
        </nav>
      </div>
    </div>
  );
} 