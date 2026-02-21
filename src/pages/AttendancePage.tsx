import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export const AttendancePage: React.FC = () => {
  const { profile } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('tenant_id', profile?.tenant_id);
    setClasses(data || []);
    if (data && data.length > 0) setSelectedClass(data[0].id);
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch students in class
      const { data: studentsData } = await supabase
        .from('students')
        .select('*, profiles:id(full_name)')
        .eq('class_id', selectedClass);
      
      setStudents(studentsData || []);

      // Fetch existing attendance for this date
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', format(date, 'yyyy-MM-dd'));

      const attendanceMap: Record<string, string> = {};
      attendanceData?.forEach(a => {
        attendanceMap[a.student_id] = a.status;
      });
      setAttendance(attendanceMap);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        tenant_id: profile?.tenant_id,
        student_id: studentId,
        class_id: selectedClass,
        date: format(date, 'yyyy-MM-dd'),
        status
      }));

      const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'student_id,date' });

      if (error) throw error;
      alert('Attendance saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daily Attendance</h1>
          <p className="text-slate-500">Record and monitor student attendance for your classes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-sm">
            <button 
              onClick={() => setDate(d => new Date(d.setDate(d.getDate() - 1)))}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 flex items-center gap-2 font-semibold text-slate-700">
              <Calendar size={18} className="text-indigo-500" />
              {format(date, 'MMM dd, yyyy')}
            </div>
            <button 
              onClick={() => setDate(d => new Date(d.setDate(d.getDate() + 1)))}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <button 
            onClick={saveAttendance}
            disabled={loading || !selectedClass}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
          <label className="text-sm font-bold text-slate-700">Select Class:</label>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Present</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Sick</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Permission</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/20" />
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No students found in this class.
                  </td>
                </tr>
              ) : students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                        {student.profiles.full_name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{student.profiles.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={`p-2 rounded-xl transition-all ${attendance[student.id] === 'present' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <CheckCircle2 size={24} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'sick')}
                      className={`p-2 rounded-xl transition-all ${attendance[student.id] === 'sick' ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <Clock size={24} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'permission')}
                      className={`p-2 rounded-xl transition-all ${attendance[student.id] === 'permission' ? 'bg-blue-100 text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <AlertCircle size={24} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={`p-2 rounded-xl transition-all ${attendance[student.id] === 'absent' ? 'bg-rose-100 text-rose-600' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <XCircle size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
