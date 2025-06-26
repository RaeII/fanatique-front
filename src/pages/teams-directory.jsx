import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Volleyball as Football, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import clubApi from '../api/club';
import { useTranslation } from 'react-i18next';

export default function TeamsDirectoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['clubs', 'common']);
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get clubs passed from dashboard or fetch if not available
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const clubs = await clubApi.getClubs();
        setClubs(clubs);
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [location.state?.availableClubs]);

  const handleViewClub = (clubId) => {
    navigate(`/clubs/${clubId}`);
  };

  // Filter clubs based on search term
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#fafafa] dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="mr-2"
          >
            <ArrowLeft size={18} className='text-primary' />
          </Button>
          <h1 className="text-2xl font-bold text-primary dark:text-white">{t('clubs:directory.title')}</h1>
        </div>

        <p className="text-primary/70 dark:text-white/70 mb-5">
          {t('clubs:directory.description')}
        </p>

        {/* Search input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-primary/50 dark:text-white/50" />
          </div>
          <input
            type="text"
            placeholder={t('clubs:directory.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2 border border-primary/20 dark:border-white/20 rounded-lg bg-white dark:bg-black text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {filteredClubs.map(club => (
            <div 
              key={club.id}
              onClick={() => handleViewClub(club.id)}
              className=" dark:bg-black p-4 rounded-lg shadow-sm cursor-pointer transition-all hover:shadow-md hover:translate-y-[-2px]"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-black overflow-hidden mb-3">
                  {club.image ? (
                    <img 
                      src={club.image} 
                      alt={club.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5 dark:bg-primary/20 text-primary/50 dark:text-white/50">
                      <Football size={24} />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-primary dark:text-white text-center">
                  {club.name}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-xs text-primary/60 dark:text-white/60">
                    {club.fanCount || Math.floor(Math.random() * 1000)} {t('clubs:directory.fans')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-10">
            <Football size={36} className="mx-auto text-primary/30 dark:text-white/30 mb-2" />
            <p className="text-primary/70 dark:text-white/70">
              {t('clubs:directory.noClubFound')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 