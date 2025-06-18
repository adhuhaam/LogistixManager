import { useQuery, useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.setQueryData(["/api/auth/user"], null);
    queryClient.clear();
  };

  // Role-based permission helpers
  const hasPermission = (requiredRoles: string | string[]) => {
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const canManageVehicles = () => hasPermission(['super_admin', 'admin']);
  const canManageDrivers = () => hasPermission(['super_admin', 'admin']);
  const canUpdateDetails = () => hasPermission(['super_admin', 'admin', 'user']);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    logout,
    error,
    hasPermission,
    isSuperAdmin,
    canManageVehicles,
    canManageDrivers,
    canUpdateDetails,
  };
}