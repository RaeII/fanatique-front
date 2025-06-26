import { useState, useEffect, useCallback } from 'react';
import { UserContext } from './UserContextDef';
import userApi from '../api/user';
import { useWalletContext } from '../hooks/useWalletContext';
import { showError } from '../lib/toast';
import userClubApi from '../api/user_club';

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userClubsData, setUserClubsData] = useState(null);
  // Get authentication state from wallet context
  const { isAuthenticated, token } = useWalletContext();
  // Function to fetch user data
  const updateUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await userApi.getUserProfile();
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to fetch user data');
      showError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getUserClubData = useCallback(async () => {
    const data = await userClubApi.getUserClub();
      const heartClub = data.find(club => club.club_type.id == 1);
      return { heart_club: heartClub, clubs: data };
  }, []);

  const updateUserClubsData = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return;
    }
    try {
      const data = await getUserClubData();
      setUserClubsData(data);
    } catch (err) {
      console.error('Error fetching user clubs data:', err);
      setError(err.message || 'Failed to fetch user clubs data');
    }
  }, [getUserClubData, isAuthenticated]);

  const isUserHeartClub = useCallback(async (clubId) => {
    let _userClubsData = null;
    if (!userClubsData) {
      _userClubsData = await getUserClubData();
    } else {
      _userClubsData = userClubsData;
    }
    return _userClubsData?.heart_club?.club?.id == clubId;
  }, [userClubsData, getUserClubData]);

  const hasUserHeartClub = useCallback(async () => {
    let _userClubsData = null;
    if (!userClubsData) {
      _userClubsData = await getUserClubData();
    } else {
      _userClubsData = userClubsData;
    }
    return _userClubsData?.heart_club != null;
  }, [userClubsData, getUserClubData]);

  const isFollowingClub = useCallback(async (clubId) => {
    let _userClubsData = null;
    if (!userClubsData) {
      _userClubsData = await getUserClubData();
    } else {
      _userClubsData = userClubsData;
    }
    return _userClubsData?.clubs?.some(club => club.club.id == clubId && club.club_type.id == 2);
  }, [userClubsData, getUserClubData]);

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      updateUserData();
      updateUserClubsData();
    } else {
      // Reset user data when not authenticated
      setUserData(null);
      setUserClubsData(null);
    }
  }, [isAuthenticated, token, updateUserData, updateUserClubsData]);

  const value = {
    userData,
    loading,
    error,
    updateUserData,
    updateUserClubsData,
    hasUserHeartClub,
    isFollowingClub,
    userClubsData,
    isUserDataLoaded: !!userData,
    isUserHeartClub
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
} 