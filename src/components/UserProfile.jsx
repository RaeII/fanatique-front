import { useUserContext } from "../hooks/useUserContext";

export function UserProfile() {
  const { userData, loading, error, fetchUserData } = useUserContext();

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-background/50 border border-border">
        <div className="animate-pulse h-5 w-40 bg-muted rounded mb-4"></div>
        <div className="animate-pulse h-4 w-full bg-muted rounded mb-2"></div>
        <div className="animate-pulse h-4 w-3/4 bg-muted rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
        <p className="font-semibold">Error loading profile</p>
        <p className="text-sm">{error}</p>
        <button 
          className="mt-2 px-3 py-1 text-sm bg-background rounded-md border border-border hover:bg-muted"
          onClick={fetchUserData}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 rounded-lg bg-background/50 border border-border">
        <p className="text-muted-foreground">User profile not available</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-background/50 border border-border">
      <h3 className="text-lg font-semibold mb-2">{userData.full_name || 'User'}</h3>
      {userData.email && <p className="text-sm text-muted-foreground mb-1">{userData.email}</p>}
      
      <div className="mt-4 grid gap-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Wallet</span>
          <span className="font-mono">{userData.wallet_address}</span>
        </div>
        
        {userData.role && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Role</span>
            <span>{userData.role}</span>
          </div>
        )}
      </div>
      
      <button 
        className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={fetchUserData}
      >
        Refresh Profile
      </button>
    </div>
  );
} 