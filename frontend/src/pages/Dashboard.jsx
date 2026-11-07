import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  CalendarClock,
  DollarSign,
  TrendingUp,
  Clock,
  Building2,
  PlusCircle,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';

const STATUS_COLORS = {
  Scheduled: '#0ea5e9',
  Completed: '#10b981',
  Cancelled: '#f43f5e',
  'In Progress': '#f59e0b',
  Unknown: '#94a3b8'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, chartsRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts'),
        api.get('/dashboard/recent-appointments')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (chartsRes.data.success) setCharts(chartsRes.data.data);
      if (recentRes.data.success) setRecentAppointments(recentRes.data.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-medicare-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 mt-4">Loading Medicare Dashboard...</p>
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header section with greetings and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Overview</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time analytics and patient operations powered by Medicare Database.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-medicare-600' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/patients')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-medicare-600 hover:bg-medicare-700 rounded-xl shadow-sm shadow-medicare-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* Modern Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats?.total_patients ?? 0}
          icon={Users}
          color="blue"
          changeText="Registered Profiles"
        />
        <StatCard
          title="Medical Specialists"
          value={stats?.total_doctors ?? 0}
          icon={UserCheck}
          color="cyan"
          changeText="Active Medical Staff"
        />
        <StatCard
          title="Appointments"
          value={stats?.total_appointments ?? 0}
          icon={CalendarClock}
          color="amber"
          changeText={`${stats?.today_appointments ?? 0} Scheduled Today`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.total_revenue)}
          icon={DollarSign}
          color="emerald"
          changeText={`$${(stats?.pending_revenue ?? 0).toLocaleString()} Pending`}
        />
      </div>

      {/* Visual Analytics Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Distribution (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Appointment Breakdown</h3>
              <p className="text-xs text-slate-400">Status distribution across all hospital bookings</p>
            </div>
            <span className="text-xs font-bold text-medicare-600 bg-medicare-50 px-2.5 py-1 rounded-lg">
              {stats?.total_appointments} Bookings
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.appointment_status || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {(charts?.appointment_status || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Appointments`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Age Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient Demographics</h3>
              <p className="text-xs text-slate-400">Distribution by age groups</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              Active Cohort
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.patient_age_groups || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} Patients`, 'Registered']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0c87eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution (Doctors per Dept) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Medical Specialists by Department</h3>
              <p className="text-xs text-slate-400">Active staffing deployment</p>
            </div>
            <button
              onClick={() => navigate('/departments')}
              className="text-xs font-semibold text-medicare-600 hover:text-medicare-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.department_distribution || []} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  formatter={(value) => [`${value} Specialists`, 'Doctors']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="doctors" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Billing & Financial Health Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue Collections</h3>
              <p className="text-xs text-slate-400">Paid vs Outstanding revenue</p>
            </div>
            <button
              onClick={() => navigate('/billing')}
              className="text-xs font-semibold text-medicare-600 hover:text-medicare-700 flex items-center gap-1"
            >
              <span>Billing Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.billing_breakdown || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Amount']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {(charts?.billing_breakdown || []).map((entry, index) => {
                    const fill = entry.name === 'Paid' ? '#10b981' : entry.name === 'Pending' ? '#f59e0b' : '#f43f5e';
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Appointments Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Appointments</h3>
            <p className="text-xs text-slate-400">Latest medical bookings and status controls</p>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs font-semibold text-medicare-600 hover:text-medicare-700 flex items-center gap-1"
          >
            <span>View All Appointments</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor & Dept</th>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                    No recent appointments found.
                  </td>
                </tr>
              ) : (
                recentAppointments.map((apt) => (
                  <tr key={apt.appointment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{apt.patient_name}</div>
                      <div className="text-[11px] text-slate-400">{apt.patient_phone}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900">{apt.doctor_name}</div>
                      <div className="text-[11px] text-medicare-600">{apt.department_name || apt.specialization}</div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{apt.appointment_date}</div>
                      <div className="text-[11px] text-slate-400">{apt.appointment_time}</div>
                    </td>
                    <td className="px-6 py-3.5 max-w-xs truncate text-slate-600">
                      {apt.reason || 'General checkup'}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      {apt.status === 'Scheduled' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(apt.appointment_id, 'Completed')}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(apt.appointment_id, 'Cancelled')}
                            className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

