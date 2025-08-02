# Job Management System - Application Summary

## Overview
A React-based job scheduling and management system for security technicians with calendar views, job tracking, and customer management.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI (shadcn/ui)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State**: React Context + TanStack Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation

## Core Features

### 1. Authentication System
- Supabase Auth integration
- Role-based access (admin, senior_tech, tech)
- Login/logout functionality
- Password reset capabilities

### 2. User Management
- Technician profiles with roles
- Admin can invite/manage technicians
- User status tracking (active/pending/inactive)

### 3. Job Management
- Create, edit, delete jobs
- Job scheduling with start/end times
- Job status tracking (assigned/in-progress/completed)
- Priority levels (low/medium/high)
- Job number generation
- Technician assignment

### 4. Calendar System
- Multiple views (Day/Week/Month/Full Calendar)
- Drag-and-drop job scheduling
- Technician column views
- Job cards with color coding

### 5. Customer Management
- Customer CRUD operations
- Customer import functionality
- Contact information storage
- Company/address tracking

### 6. Dashboard
- Role-based navigation
- Quick access to key features
- Statistics and overview

## Database Schema

### Tables:
- `profiles` - User/technician data
- `jobs` - Job scheduling data
- `customers` - Customer information

### Key Fields:
- Users: id, name, email, role, status
- Jobs: id, job_number, title, description, customer_id, technician_ids, start_time, end_time, status, priority
- Customers: id, name, email, phone, company, address

## File Structure
```
src/
├── components/
│   ├── ui/ (shadcn components)
│   ├── Calendar/ (calendar views)
│   ├── Dashboard.tsx
│   ├── LoginForm.tsx
│   ├── JobModal.tsx
│   ├── CustomerModal.tsx
│   └── TechnicianManagement.tsx
├── contexts/AppContext.tsx
├── hooks/useAuth.ts
├── lib/supabase.ts
├── types/index.ts
└── pages/Index.tsx
```

## Key Components
- **AppLayout**: Main layout with sidebar navigation
- **Calendar Views**: Day/Week/Month calendar components
- **JobModal**: Job creation/editing form
- **CustomerModal**: Customer management form
- **TechnicianManagement**: Admin user management
- **Dashboard**: Main dashboard with role-based features

## Authentication Flow
1. User logs in via Supabase Auth
2. Profile fetched from profiles table
3. Role-based UI rendering
4. Context provides user state globally

## Data Flow
1. AppContext manages global state
2. Supabase client handles API calls
3. Mock data fallback for offline development
4. Toast notifications for user feedback

## Current Issues to Address in Rebuild
1. Database schema inconsistencies
2. Authentication error handling
3. Missing RLS policies
4. Incomplete calendar drag-and-drop
5. Form validation improvements
6. Better error boundaries

## Rebuild Recommendations
1. Start with clean database schema
2. Implement proper RLS policies
3. Add comprehensive error handling
4. Simplify component structure
5. Add proper TypeScript types
6. Implement proper state management
7. Add data validation layers
8. Create proper API abstraction

## Environment Setup
- Supabase URL: https://kmzljykyrgouutphzgdx.supabase.co
- Requires proper environment variables
- Database migrations in /migrations folder

This summary should help you rebuild the application more efficiently by understanding the core architecture and identifying key areas that need improvement.