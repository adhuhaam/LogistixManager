import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Palette, Shield, Plus, Edit, Trash2 } from "lucide-react";
import Header from "@/components/header";

interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export default function SettingsPage() {
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUser, setNewUser] = useState({ username: '', name: '', email: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Fetch system settings
  const { data: settings } = useQuery<SystemSetting[]>({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    enabled: isSuperAdmin(),
  });

  // Fetch users
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: isSuperAdmin(),
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: "Setting updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setNewUser({ username: '', name: '', email: '', password: '', role: 'user' });
      toast({ title: "User created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create user", variant: "destructive" });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number; userData: any }) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setEditingUser(null);
      toast({ title: "User updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user", variant: "destructive" });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, userData: editingUser });
    }
  };

  if (!isSuperAdmin()) {
    return (
      <div className="flex-1 bg-dark-bg">
        <Header title="Access Denied" subtitle="Super Admin access required" />
        <div className="p-6">
          <Card className="bg-dark-card border-gray-800">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Access Restricted</h2>
              <p className="text-gray-400">Only Super Administrators can access system settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-dark-bg">
      <Header title="System Settings" subtitle="Configure application settings and manage users" />
      
      <div className="p-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-dark-card border-gray-800">
            <TabsTrigger value="general" className="data-[state=active]:bg-purple-primary">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-primary">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-primary">
              <User className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="bg-dark-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Application Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Application Name</Label>
                    <Input
                      defaultValue={settings?.find(s => s.key === 'app_name')?.value || 'FoCar'}
                      className="mt-1 bg-dark-elevated border-gray-700 text-white"
                      onBlur={(e) => handleSettingUpdate('app_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Application Version</Label>
                    <Input
                      defaultValue={settings?.find(s => s.key === 'app_version')?.value || '1.0.0'}
                      className="mt-1 bg-dark-elevated border-gray-700 text-white"
                      onBlur={(e) => handleSettingUpdate('app_version', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card className="bg-dark-card border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Theme & Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-300">Primary Color</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        type="color"
                        defaultValue={settings?.find(s => s.key === 'theme_primary_color')?.value || '#8B5CF6'}
                        className="w-16 h-10 bg-dark-elevated border-gray-700"
                        onBlur={(e) => handleSettingUpdate('theme_primary_color', e.target.value)}
                      />
                      <Input
                        defaultValue={settings?.find(s => s.key === 'theme_primary_color')?.value || '#8B5CF6'}
                        className="flex-1 bg-dark-elevated border-gray-700 text-white"
                        onBlur={(e) => handleSettingUpdate('theme_primary_color', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Secondary Color</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        type="color"
                        defaultValue={settings?.find(s => s.key === 'theme_secondary_color')?.value || '#1F2937'}
                        className="w-16 h-10 bg-dark-elevated border-gray-700"
                        onBlur={(e) => handleSettingUpdate('theme_secondary_color', e.target.value)}
                      />
                      <Input
                        defaultValue={settings?.find(s => s.key === 'theme_secondary_color')?.value || '#1F2937'}
                        className="flex-1 bg-dark-elevated border-gray-700 text-white"
                        onBlur={(e) => handleSettingUpdate('theme_secondary_color', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Application Icon URL</Label>
                  <Input
                    defaultValue={settings?.find(s => s.key === 'app_icon')?.value || '/icons/app-icon.svg'}
                    className="mt-1 bg-dark-elevated border-gray-700 text-white"
                    onBlur={(e) => handleSettingUpdate('app_icon', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Create User */}
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New User
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Input
                      placeholder="Username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="bg-dark-elevated border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="Full Name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="bg-dark-elevated border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="bg-dark-elevated border-gray-700 text-white"
                      required
                    />
                    <Input
                      placeholder="Password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="bg-dark-elevated border-gray-700 text-white"
                      required
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="bg-dark-elevated border border-gray-700 text-white rounded-md px-3 py-2"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <Button type="submit" className="bg-purple-primary hover:bg-purple-dark">
                      Create User
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Manage Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users?.map((userItem) => (
                      <div key={userItem.id} className="flex items-center justify-between p-4 bg-dark-elevated rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {userItem.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{userItem.name}</h3>
                            <p className="text-gray-400 text-sm">{userItem.email}</p>
                            <p className="text-gray-400 text-sm">@{userItem.username}</p>
                          </div>
                          <Badge variant={userItem.role === 'super_admin' ? 'destructive' : 
                                        userItem.role === 'admin' ? 'default' : 'secondary'}>
                            {userItem.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(userItem)}
                            className="border-gray-700 text-gray-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {userItem.id !== user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUserMutation.mutate(userItem.id)}
                              className="border-red-600 text-red-400 hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-dark-card border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Edit User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <Input
                  placeholder="Username"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="bg-dark-elevated border-gray-700 text-white"
                />
                <Input
                  placeholder="Full Name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="bg-dark-elevated border-gray-700 text-white"
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="bg-dark-elevated border-gray-700 text-white"
                />
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-dark-elevated border border-gray-700 text-white rounded-md px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 bg-purple-primary hover:bg-purple-dark">
                    Update User
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                    className="border-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}