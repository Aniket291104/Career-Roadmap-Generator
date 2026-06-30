'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Users, 
  Cpu, 
  Map, 
  Trash2, 
  Loader2, 
  UserCheck
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  verifiedUsers: number;
  mentors: number;
  admins: number;
  totalRoadmaps: number;
  totalInterviews: number;
  totalQuizzes: number;
  aiTokenMockCost: number;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  isVerified: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useUserStore();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.users);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Access denied. Admins only.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admins only.');
      router.push('/dashboard');
      return;
    }
    fetchAdminData();
  }, [user]);

  const handleUpdateRole = async (userId: string, nextRole: string) => {
    try {
      await api.put('/admin/role', { userId, role: nextRole });
      toast.success('User role updated successfully.');
      fetchAdminData();
    } catch (err) {
      toast.error('Role update failed.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      toast.warning('You cannot delete your own admin account.');
      return;
    }
    if (!confirm('Are you sure you want to delete this user and all associated roadmaps/sessions?')) return;

    try {
      await api.delete(`/admin/user/${id}`);
      toast.success('User deleted.');
      fetchAdminData();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  if (loading || !stats) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* ROW 1: STAT CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Total Accounts</span>
              <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.verifiedUsers} Verified Users</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Roadmaps Created</span>
              <h3 className="text-2xl font-bold mt-1">{stats.totalRoadmaps}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Generated via AI Gemini</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">Mock Interviews</span>
              <h3 className="text-2xl font-bold mt-1">{stats.totalInterviews} Sessions</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stats.totalQuizzes} Quizzes evaluated</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">AI API Cost Index</span>
              <h3 className="text-2xl font-bold mt-1">${stats.aiTokenMockCost.toFixed(3)}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Mock Gemini token billing meter</p>
            </div>
          </div>

        </div>

        {/* ROW 2: USER AUDIT TABLE */}
        <div className="p-6 rounded-2xl glass-card space-y-4">
          <h3 className="font-bold text-base flex items-center gap-2 border-b border-border/40 pb-2.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span>Accounts Directory Audit</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/25 shadow-sm">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-muted/30 border-b border-border/30 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-sm block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">{item.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={item.role}
                        onChange={(e) => handleUpdateRole(item._id, e.target.value)}
                        className="px-2 py-1 border border-border bg-background rounded-md text-[11px] font-semibold text-muted-foreground"
                      >
                        <option value="student">Student</option>
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.isVerified ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                        {item.isVerified ? 'Verified' : 'Pending OTP'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteUser(item._id)}
                        disabled={item._id === user?.id}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30"
                        title="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
