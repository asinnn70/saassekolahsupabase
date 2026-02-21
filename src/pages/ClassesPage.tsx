import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Plus, 
  Users, 
  UserCircle, 
  CalendarDays 
} from 'lucide-react';

export const ClassesPage: React.FC = () => {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    if (!profile?.tenant_id) return;
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          teachers:homeroom_teacher_id ( profiles:id (full_name) ),
          academic_terms:academic_term_id (name)
        `)
        .eq('tenant_id', profile.tenant_id);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
          <p className="text-slate-500">Manage classes, subjects, and student enrollments.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all">
          <Plus size={20} />
          Create Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-slate-100 rounded-md w-3/4 mb-4"></div>
              <div className="h-4 bg-slate-100 rounded-md w-1/2 mb-6"></div>
              <div className="flex items-center gap-2 h-4 bg-slate-100 rounded-md w-1/3"></div>
            </div>
          ))
        ) : classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="text-indigo-500" size={20} />
                <h3 className="text-lg font-bold text-slate-900">{classItem.name}</h3>
              </div>
              <div className="text-sm text-slate-500 space-y-2 pl-8 border-l-2 border-slate-100 ml-2.5 py-2">
                <p className="flex items-center gap-2">
                  <UserCircle size={14} />
                  Homeroom: {classItem.teachers?.profiles.full_name || 'Unassigned'}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  Term: {classItem.academic_terms?.name || 'N/A'}
                </p>
              </div>
            </div>
            <button className="mt-6 w-full text-center py-2.5 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
