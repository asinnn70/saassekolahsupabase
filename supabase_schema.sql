-- 1. TENANTS (SCHOOLS)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. ENUMS FOR ROLES & STATUS
CREATE TYPE user_role AS ENUM ('super_admin', 'school_admin', 'teacher', 'student');
CREATE TYPE attendance_status AS ENUM ('present', 'sick', 'permission', 'absent');

-- 3. USERS (EXTENDED FROM AUTH.USERS)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACADEMIC TERMS
CREATE TABLE academic_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL, -- e.g., '2023/2024 Odd Semester'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEACHERS
CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    employee_id TEXT UNIQUE,
    specialization TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL, -- e.g., 'Grade 10-A'
    homeroom_teacher_id UUID REFERENCES teachers(id),
    academic_term_id UUID REFERENCES academic_terms(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    student_id TEXT UNIQUE, -- NISN
    class_id UUID REFERENCES classes(id),
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBJECTS
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CLASS SUBJECTS (Linking teachers to subjects in classes)
CREATE TABLE class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    class_id UUID REFERENCES classes(id),
    subject_id UUID REFERENCES subjects(id),
    teacher_id UUID REFERENCES teachers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ATTENDANCE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    student_id UUID REFERENCES students(id),
    class_id UUID REFERENCES classes(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- 11. GRADES
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    student_id UUID REFERENCES students(id),
    subject_id UUID REFERENCES subjects(id),
    academic_term_id UUID REFERENCES academic_terms(id),
    assignment_score NUMERIC DEFAULT 0,
    mid_exam_score NUMERIC DEFAULT 0,
    final_exam_score NUMERIC DEFAULT 0,
    final_grade NUMERIC GENERATED ALWAYS AS (
        (assignment_score * 0.4) + (mid_exam_score * 0.3) + (final_exam_score * 0.3)
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, subject_id, academic_term_id)
);

-- 12. STUDENT MONITORING (Violations, Achievements, Counseling)
CREATE TABLE student_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    student_id UUID REFERENCES students(id),
    type TEXT NOT NULL, -- 'violation', 'achievement', 'counseling'
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    logged_by UUID REFERENCES profiles(id),
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_role user_role, -- NULL means everyone
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's tenant_id
CREATE OR REPLACE FUNCTION get_my_tenant()
RETURNS UUID AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- Helper function to get the current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 1. TENANTS POLICIES
CREATE POLICY "Super admins can do everything on tenants"
ON tenants FOR ALL USING (get_my_role() = 'super_admin');

CREATE POLICY "Users can see their own tenant"
ON tenants FOR SELECT USING (id = get_my_tenant());

-- 2. PROFILES POLICIES
CREATE POLICY "Super admins can see all profiles"
ON profiles FOR SELECT USING (get_my_role() = 'super_admin');

CREATE POLICY "School admins can manage their tenant's profiles"
ON profiles FOR ALL USING (tenant_id = get_my_tenant() AND get_my_role() = 'school_admin');

CREATE POLICY "Users can see profiles in their tenant"
ON profiles FOR SELECT USING (tenant_id = get_my_tenant());

CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT USING (id = auth.uid());

-- 3. ATTENDANCE POLICIES
CREATE POLICY "Teachers can manage attendance for their tenant"
ON attendance FOR ALL USING (tenant_id = get_my_tenant() AND get_my_role() = 'teacher');

CREATE POLICY "Students can see their own attendance"
ON attendance FOR SELECT USING (student_id = auth.uid());

-- 4. GRADES POLICIES
CREATE POLICY "Teachers can manage grades for their tenant"
ON grades FOR ALL USING (tenant_id = get_my_tenant() AND get_my_role() = 'teacher');

CREATE POLICY "Students can see their own grades"
ON grades FOR SELECT USING (student_id = auth.uid());

-- 5. GENERAL TENANT ISOLATION (Apply to other tables)
-- Repeat this pattern for all other tables:
-- School Admin: Full Access to Tenant Data
-- Others: Select Access to Tenant Data (with specific restrictions if needed)

-- Example for Classes:
CREATE POLICY "School admin full access to classes" ON classes FOR ALL USING (tenant_id = get_my_tenant() AND get_my_role() = 'school_admin');
CREATE POLICY "Tenant users can view classes" ON classes FOR SELECT USING (tenant_id = get_my_tenant());

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
-- Create buckets for 'student-photos' and 'report-cards' in Supabase Dashboard.
-- RLS for storage:
-- Bucket: report-cards
-- Policy: "Students can only read their own report cards"
-- (storage.foldername(name))[1] = auth.uid()::text
