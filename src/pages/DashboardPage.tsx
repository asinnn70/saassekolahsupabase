import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
  </div>
);

const attendanceData = [
  { name: 'Mon', present: 95, absent: 5 },
  { name: 'Tue', present: 92, absent: 8 },
  { name: 'Wed', present: 98, absent: 2 },
  { name: 'Thu', present: 94, absent: 6 },
  { name: 'Fri', present: 90, absent: 10 },
];

const gradeDistribution = [
  { range: 'A', count: 45 },
  { range: 'B', count: 32 },
  { range: 'C', count: 18 },
  { range: 'D', count: 5 },
];

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile?.full_name}!</h1>
        <p className="text-slate-500">Here's what's happening in your school today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={GraduationCap} 
          label="Total Students" 
          value="1,284" 
          trend={12} 
          color="bg-indigo-50 text-indigo-600" 
        />
        <StatCard 
          icon={Users} 
          label="Total Teachers" 
          value="86" 
          trend={4} 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatCard 
          icon={BookOpen} 
          label="Active Classes" 
          value="42" 
          color="bg-amber-50 text-amber-600" 
        />
        <StatCard 
          icon={CalendarCheck} 
          label="Avg. Attendance" 
          value="94.2%" 
          trend={-2} 
          color="bg-rose-50 text-rose-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Weekly Attendance</h3>
            <select className="text-sm bg-slate-50 border-none rounded-lg px-3 py-1 outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Grade Distribution</h3>
            <TrendingUp size={20} className="text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity / Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Announcements</h3>
            <button className="text-indigo-600 text-sm font-semibold">View All</button>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Mid-term Exam Schedule Released</h4>
                    <p className="text-sm text-slate-500 mt-1">The mid-term exam schedule for all grades has been finalized. Please check the academic calendar for details.</p>
                    <span className="text-xs text-slate-400 mt-2 block">2 hours ago • By Admin</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Upcoming Events</h3>
          <div className="space-y-6">
            {[
              { date: 'Oct 24', title: 'Parent-Teacher Meeting', type: 'Meeting' },
              { date: 'Oct 28', title: 'Annual Sports Day', type: 'Event' },
              { date: 'Nov 02', title: 'Science Fair 2023', type: 'Competition' },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-600">
                  <span className="text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                  <span className="text-lg font-bold leading-none">{event.date.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{event.title}</h4>
                  <p className="text-xs text-slate-400">{event.type}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold hover:border-indigo-300 hover:text-indigo-500 transition-all">
            + Add Event
          </button>
        </div>
      </div>
    </div>
  );
};
