import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Users, Shield, Activity, Settings, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import Layout from '@/components/Layout';

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: 'admin' | 'user' | 'visitor';
  isEmailConfirmed: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.email !== 'mahmud23k@gmail.com') {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (updating) return;
    
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { role: newRole }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole as any } : user
        ));
      } else {
        alert(data.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const toggleEmailConfirmation = async (userId: string, currentStatus: boolean) => {
    if (updating) return;
    
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          updates: { isEmailConfirmed: !currentStatus }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isEmailConfirmed: !currentStatus } : user
        ));
      } else {
        alert(data.message || 'Failed to update email confirmation');
      }
    } catch (error) {
      console.error('Error updating email confirmation:', error);
      alert('Failed to update email confirmation');
    } finally {
      setUpdating(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!session || session.user?.email !== 'mahmud23k@gmail.com') {
    return (
      <Layout title="Access Denied">
        <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-secondary-400">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const adminUsers = users.filter(user => user.role === 'admin');
  const regularUsers = users.filter(user => user.role === 'user');
  const visitors = users.filter(user => user.role === 'visitor');

  return (
    <Layout title="Admin Dashboard">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <section className="py-20 bg-secondary-900 min-h-screen">
        <div className="container-custom max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-secondary-400">Manage users and system settings</p>
              </div>
              <div className="flex items-center text-secondary-400">
                <Settings className="w-5 h-5 mr-2" />
                <span>System Administration</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary-500" />
                </div>
              </div>
              
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-400 text-sm">Admins</p>
                    <p className="text-2xl font-bold text-white">{adminUsers.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-400 text-sm">Regular Users</p>
                    <p className="text-2xl font-bold text-white">{regularUsers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-secondary-400 text-sm">Visitors</p>
                    <p className="text-2xl font-bold text-white">{visitors.length}</p>
                  </div>
                  <Activity className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-secondary-800 rounded-lg border border-secondary-700 overflow-hidden">
              <div className="p-6 border-b border-secondary-700">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
                <p className="text-secondary-400 mt-1">Manage user roles and permissions</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Email Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-secondary-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-10 h-10 rounded-full mr-4"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center mr-4">
                                <Users className="w-5 h-5 text-secondary-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-secondary-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative">
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              disabled={updating === user._id || user.email === 'mahmud23k@gmail.com'}
                              className="appearance-none bg-secondary-700 border border-secondary-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed pr-8"
                            >
                              <option value="visitor">Visitor</option>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-secondary-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleEmailConfirmation(user._id, user.isEmailConfirmed)}
                            disabled={updating === user._id}
                            className="flex items-center text-sm disabled:opacity-50"
                          >
                            {user.isEmailConfirmed ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-green-400">Confirmed</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-500 mr-1" />
                                <span className="text-red-400">Unconfirmed</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-400">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-400">
                          {updating === user._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                          ) : (
                            <span className="text-secondary-500">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}