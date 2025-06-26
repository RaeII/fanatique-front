import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Star, CheckCircle, Clock, Lock, Loader2 } from 'lucide-react';
import questApi from '../api/quest';
import QuestScope from '../enum/QuestScope';

const QuestStatusChip = ({ status }) => {
  const { t } = useTranslation('quests');
  
  switch (status) {
    case 'AVAILABLE':
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/80 text-white">
          {t('quests.status.available')}
        </div>
      );
    case 'IN_PROGRESS':
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/80 text-white">
          <Clock size={12} className="mr-1" />
          {t('quests.status.inProgress')}
        </div>
      );
    case 'COMPLETED':
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/80 text-white">
          <CheckCircle size={12} className="mr-1" />
          {t('quests.status.completed')}
        </div>
      );
    case 'LOCKED':
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/80 text-white">
          <Lock size={12} className="mr-1" />
          {t('quests.status.locked')}
        </div>
      );
    default:
      return null;
  }
};

export default function Quests({ questScope, gameId = null }) {
  const { t } = useTranslation('quests');
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'available', 'inProgress', 'completed'
  const [loadingQuests, setLoadingQuests] = useState({});

  useEffect(() => {
    // Fetch quests for the current club
    const fetchQuests = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      const clubQuests = await questApi.getQuestsByScope(questScope);
      setQuests(clubQuests);
      setLoading(false);
    };

    fetchQuests();
  }, [questScope]);

  const handleCompleteQuest = async (questId, e) => {
    e.stopPropagation(); // Prevent triggering the card click

    // Set loading state for this specific quest
    setLoadingQuests(prev => ({ ...prev, [questId]: true }));
    
    try {
      const completedQuest = await questApi.completeQuest(questId, gameId);
      
      const updatedQuests = quests.map(quest => {
        if (quest.id === questId) {
          quest.status = 1;
        }
        return quest;
      });

      if (completedQuest) {
        // Update the quest in state
        setQuests(updatedQuests);
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    } finally {
      // Clear loading state for this specific quest
      setLoadingQuests(prev => ({ ...prev, [questId]: false }));
    }
  };

  const filteredQuests = quests?.filter(quest => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'available') return quest.status === 0;
    if (activeFilter === 'inProgress') return quest.status === 2;
    if (activeFilter === 'completed') return quest.status === 1;
    return true;
  }) || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-adaptive">
              {questScope === QuestScope.GENERAL ? t('quests.generalQuests') : t('quests.clubQuests')}
            </h1>
          </div>
          <p className="text-text-adaptive/70 mt-1">
            {t('quests.description')}
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className={`
              rounded-full font-medium hover:bg-secondary
              ${activeFilter === 'all' 
                ? 'bg-secondary text-white shadow-md' 
                : 'bg-foreground/20 text-text-adaptive hover:bg-secondary hover:text-white border-background'}
            `}
          >
            {t('quests.filters.all')}
          </Button>
          <Button 
            variant={activeFilter === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('available')}
            className={`
              rounded-full font-medium hover:bg-blue-500
              ${activeFilter === 'available' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-foreground/20 text-text-adaptive hover:bg-blue-500 hover:text-white border-background'}
            `}
          >
            {t('quests.filters.available')}
          </Button>
          <Button 
            variant={activeFilter === 'inProgress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('inProgress')}
            className={`
              rounded-full font-medium hover:bg-orange-500
              ${activeFilter === 'inProgress' 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-foreground/20 text-text-adaptive hover:bg-orange-500 hover:text-white border-background'}
            `}
          >
            {t('quests.filters.inProgress')}
          </Button>
          <Button 
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('completed')}
            className={`
              rounded-full font-medium hover:bg-green-500
              ${activeFilter === 'completed' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-foreground/20 text-text-adaptive hover:bg-green-500 hover:text-white border-background'}
            `}
          >
            {t('quests.filters.completed')}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredQuests.length === 0 ? (
          <div className="text-center my-12">
            <p className="text-lg text-primary/70 dark:text-white/70">{t('quests.noQuests')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.map((quest) => (
              <div 
                key={quest.id}
                className="relative flex flex-col h-[420px] w-full rounded-lg bg-white dark:bg-[#161622] p-6 tracking-tight overflow-hidden cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-[#1D1D2D] active:scale-[0.99] group"
              >
                {/* Quest image as background */}
                <div className="quest-image absolute inset-0">
                  <img
                    src={quest.image}
                    alt={quest.name}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.02] group-hover:opacity-95"
                  />
                  {/* Full overlay gradient from bottom to top */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161622] via-[#161622]/90 to-black/40"></div>
                </div>
                
                {/* Top section with status and points */}
                <div className="z-10 flex justify-between">
                  <QuestStatusChip status={quest.status} />
                  <div className="flex items-center px-2 py-1 rounded-full bg-black/50 text-white text-xs font-semibold">
                    <Star size={14} className="text-yellow-400 mr-1.5" fill="#FFCC00" />
                    {quest.point_value} {t('quests.points')}
                  </div>
                </div>
                
                {/* Main content */}
                <div className="z-10 flex flex-col justify-between mt-auto h-[45%]">
                  <div className="flex flex-col mt-6">
                    <h2 className="text-xl font-bold text-white line-clamp-2 mb-2">
                      {quest.name}
                    </h2>
                    
                    <p className="text-sm text-white/80 line-clamp-2 mb-6">
                      {quest.description}
                    </p>
                  </div>
                  
                  {/* Bottom section */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-between">
                      {/* Participant count */}
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-white">
                          {quest.status === 1 ? (
                            <div className="flex items-center text-green-400">
                              <CheckCircle size={14} className="mr-1" />
                              <span>{t('quests.status.completed')}</span>
                            </div>
                          ) : quest.progress ? (
                            <div className="flex flex-col">
                              <span className="leading-none">{quest.progress.current}/{quest.progress.total}</span>
                              <span className="text-xs font-medium text-white/70">{t('quests.progress')}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="leading-none">{t('quests.status.available')}</span>
                              <span className="text-xs font-medium text-white/70">Status</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Complete button */}
                      {quest.status === 0 ? (
                        <Button 
                          variant="default"
                          size="sm"
                          className="whitespace-nowrap bg-primary hover:bg-primary/90 text-black px-4"
                          onClick={(e) => handleCompleteQuest(quest.id, e)}
                          disabled={loadingQuests[quest.id]}
                        >
                          {loadingQuests[quest.id] ? (
                            <>
                              <Loader2 size={14} className="mr-1 animate-spin" />
                              {t('quests.loading')}
                            </>
                          ) : (
                            quest.status === 3 ? t('quests.update') : t('quests.complete')
                          )}
                        </Button>
                      ) : quest.status === 1 ? (
                        <div className="text-xs font-medium text-white/70">
                          {new Date(quest.completedAt).toLocaleDateString()}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}