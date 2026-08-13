import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useRealtime } from '../hooks/useRealtime';
import { useTheme } from '../hooks/useTheme';
import { ClientDashboard } from '../components/dashboard/client/ClientDashboard';
import { EmployeeDashboard } from '../components/dashboard/employee/EmployeeDashboard';
import { FreelancerDashboard } from '../components/dashboard/freelancer/FreelancerDashboard';
import { AdminDashboard } from '../components/dashboard/admin/AdminDashboard';
import { PaymentModal, ToastContainer } from '../components/ui';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Ticket, 
  MessageSquare, 
  Receipt, 
  Calendar, 
  Briefcase, 
  Settings, 
  Users, 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  ExternalLink 
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const logout = useAuthStore((s) => s.logout);

  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const setAuthModalOpen = useDashboardStore((s) => s.setAuthModalOpen);

  const theme = useAppStore((s) => s.theme);
  const { toggle } = useTheme();
  const notifOpen = useAppStore((s) => s.notifDropdownOpen);
  const setNotifOpen = useAppStore((s) => s.setNotifDropdown);
  const addToast = useAppStore((s) => s.addToast);

  // Initialize Real-time SSE synchronization
  useRealtime();

  // Route protection
  useEffect(() => {
    if (!isLoading && !user) {
      addToast('Please login to access the dashboard console.', 'error');
      setAuthModalOpen(true);
      navigate('/');
    }
  }, [user, isLoading, navigate, setAuthModalOpen, addToast]);

  if (isLoading || !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ border: '4px solid var(--border)', borderTop: '4px solid #ea580c', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Initializing secure RDK Console session...</div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Signed out successfully.', 'info');
      navigate('/');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Resolve menus based on user role
  const getSidebarMenu = () => {
    const role = user.role;
    if (role === 'admin') {
      return [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
        { id: 'tickets', label: 'Tickets', icon: <Ticket size={18} /> },
        { id: 'invoices', label: 'Invoices', icon: <Receipt size={18} /> },
        { id: 'careers', label: 'Job Applications', icon: <Users size={18} /> },
        { id: 'cms', label: 'CMS Config', icon: <Settings size={18} /> },
      ];
    }
    if (role === 'employee') {
      return [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'kanban', label: 'Kanban Workspace', icon: <FolderKanban size={18} /> },
        { id: 'tracker', label: 'Time Tracker', icon: <Briefcase size={18} /> },
        { id: 'tickets', label: 'Support Tickets', icon: <Ticket size={18} /> },
      ];
    }
    if (role === 'freelancer') {
      return [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'contracts', label: 'Contracts', icon: <Briefcase size={18} /> },
        { id: 'skills', label: 'Profile & Skills', icon: <Settings size={18} /> },
      ];
    }
    // Default to client
    return [
      { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'projects', label: 'Projects', icon: <FolderKanban size={18} /> },
      { id: 'tickets', label: 'Tickets', icon: <Ticket size={18} /> },
      { id: 'chat', label: 'Messages', icon: <MessageSquare size={18} /> },
      { id: 'invoices', label: 'Invoices', icon: <Receipt size={18} /> },
      { id: 'meetings', label: 'Meetings', icon: <Calendar size={18} /> },
    ];
  };

  const menuItems = getSidebarMenu();

  // Render sub-console
  const renderDashboardContent = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      case 'freelancer':
        return <FreelancerDashboard />;
      default:
        return <ClientDashboard />;
    }
  };

  return (
    <div id="dashboardView" style={{ display: 'flex', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <div className="dash-sidebar" style={{ display: 'flex', flexDirection: 'column', width: '260px', background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#ea580c' }}>RDK</span> Console
          </div>
          <div id="userRoleBadge" className="status-badge" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.7rem', textTransform: 'capitalize', background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
            {user.role} Dashboard
          </div>
        </div>

        {/* Sidebar Menu */}
        <div style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: isActive ? 'rgba(234, 88, 12, 0.12)' : 'transparent',
                  color: isActive ? '#ea580c' : 'var(--text2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ color: isActive ? '#ea580c' : 'var(--text2)', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Sidebar User Details & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
              {(user.name || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', padding: '0.45rem', fontSize: '0.8rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <LogOut size={14} /> Exit & Logout
          </button>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', textTransform: 'capitalize', color: 'var(--text)' }}>
            {activeTab} Workspace
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Theme Toggle */}
            <button onClick={toggle} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#ea580c" />}
            </button>

            {/* Notification Dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color="var(--text2)" />
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: '48px', width: '280px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', zIndex: 100, padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text3)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                    REAL-TIME NOTIFICATIONS
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text2)', padding: '1rem 0', textAlign: 'center' }}>
                    All systems nominal. No pending alerts.
                  </div>
                </div>
              )}
            </div>

            {/* Exit Console */}
            <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ea580c', borderColor: '#ea580c', borderRadius: '8px' }}>
              Exit Console <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {renderDashboardContent()}
        </div>
      </div>

      {/* Overlays */}
      <PaymentModal />
      <ToastContainer />
    </div>
  );
};
export default Dashboard;
