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
          <div className="loader" style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--blue)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div>Initializing secure RDK Console session...</div>
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
        { id: 'overview', label: '📊 Dashboard' },
        { id: 'projects', label: '📁 Projects' },
        { id: 'tickets', label: '🎫 Tickets' },
        { id: 'invoices', label: '💳 Invoices' },
        { id: 'careers', label: '👥 Job Applications' },
        { id: 'cms', label: '⚙️ CMS Config' },
      ];
    }
    if (role === 'employee') {
      return [
        { id: 'overview', label: '📊 Dashboard' },
        { id: 'kanban', label: '📋 Kanban Workspace' },
        { id: 'tracker', label: '⏱ Time Tracker' },
        { id: 'tickets', label: '🎫 Support Tickets' },
      ];
    }
    if (role === 'freelancer') {
      return [
        { id: 'overview', label: '📊 Dashboard' },
        { id: 'contracts', label: '📄 Contracts' },
        { id: 'skills', label: '🧠 Profile & Skills' },
      ];
    }
    // Default to client
    return [
      { id: 'overview', label: '📊 Dashboard' },
      { id: 'projects', label: '📁 Projects' },
      { id: 'tickets', label: '🎫 Tickets' },
      { id: 'chat', label: '💬 Messages' },
      { id: 'invoices', label: '💳 Invoices' },
      { id: 'meetings', label: '📅 Meetings' },
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
          <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            <span className="grad">RDK</span> Console
          </div>
          <div id="userRoleBadge" className="status-badge" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.7rem', textTransform: 'capitalize' }}>
            {user.role} Dashboard
          </div>
        </div>

        {/* Sidebar Menu */}
        <div style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                border: 'none',
                background: activeTab === item.id ? 'var(--bg2)' : 'transparent',
                color: activeTab === item.id ? 'var(--blue)' : 'var(--text2)',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.85rem',
                fontWeight: activeTab === item.id ? 700 : 500,
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Sidebar User Details & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div className="avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              {(user.name || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 800, fontSize: '1.2rem', textTransform: 'capitalize' }}>
            {activeTab} Workspace
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme Toggle */}
            <button onClick={toggle} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Notification Dropdown */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                🔔
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: '45px', width: '280px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, padding: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text3)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                    NOTIFICATIONS
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text2)', padding: '1rem 0', textAlign: 'center' }}>
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            {/* Exit Console */}
            <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              Exit Console
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
