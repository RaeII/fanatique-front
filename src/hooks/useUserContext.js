import { useContext } from 'react';
import { UserContext } from '../contexts/UserContextDef';

export function useUserContext() {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  
  // Optional debug logging
/*   useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      console.log('useUserContext: Current state:', {
        isLoaded: context.isUserDataLoaded,
        loading: context.loading,
        hasError: !!context.error
      });
    }
  }, [context.isUserDataLoaded, context.loading, context.error]); */
  
  return context;
} 