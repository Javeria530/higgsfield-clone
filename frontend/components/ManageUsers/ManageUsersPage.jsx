import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { 
  ArrowLeft, Search, Edit3, Trash2, Shield, AlertCircle, 
  Lock, Unlock, Mail, Clock, CheckCircle, XCircle, Filter, Download, UserPlus, Users, RefreshCw
} from "lucide-react";
import { userAPI } from "../../services/api";
import Navbar from "../common/Navbar.jsx";
import Footer from "../common/Footer.jsx";

const ManageUsersPage = ({ onBack, onNavigate }) => {
  const { user: currentUser, getSubUsers, updateSubUser, removeSubUser, addSubUser, ALL_FEATURES } = useAuth();
  const { colors, mode } = useTheme();

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', allowedFeatures: [] });
  const [addErrors, setAddErrors] = useState({});
  const [allDbUsers, setAllDbUsers] = useState([]);
  const [allDbSubUsers, setAllDbSubUsers] = useState([]);
  const [dbUsersLoading, setDbUsersLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      if (!currentUser) return;
      
      if (currentUser?.role?.toLowerCase() === 'admin') {
        // Admin sees all users and sub-users directly in the main table
        const data = await userAPI.getAllUsers();
        if (data.success) {
          const allSystemUsers = [...(data.users || []), ...(data.subUsers || [])].filter(u => u.id !== currentUser.id);
          const normalized = allSystemUsers.map(s => ({
            ...s,
            role: s.role || 'BUSINESS_USER',
            status: s.isActive === false ? 'INACTIVE' : (s.status || 'ACTIVE'),
            type: s.type || (s.headUserId ? 'sub_user' : 'user')
          }));
          setUsers(normalized);
        }
      } else {
         // Existing Logic for normal head users...
         const sub = (await getSubUsers(currentUser.id)) || [];
         const normalizedSub = sub.map(s => ({
           ...s,
           role: s.role || 'BUSINESS_USER',
           status: s.isActive === false ? 'INACTIVE' : (s.status || 'ACTIVE'),
           type: 'sub_user'
         }));
         setUsers(normalizedSub);
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadAllDbUsers = async () => {
    // Deprecated for admin since they now load natively into `users` table directly.
    return;
  };

  useEffect(() => {
     if (currentUser) {
       loadUsers(); 
       if (currentUser?.role?.toLowerCase() === 'admin') loadAllDbUsers(); 
     }
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name + u.email).toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || u.status === filterStatus;
      const matchRole = filterRole === 'all' || u.role === filterRole;
      return matchSearch && matchStatus && matchRole;
    });
  }, [users, searchTerm, filterStatus, filterRole]);

  const handleUserAction = async (type, userData) => {
    try {
      setError('');
      if (type === 'suspend' && userData.role === 'Admin') {
        setError('Admin users cannot be suspended.');
        return;
      }
      
      const isActive = type === 'activate';
      const status = isActive ? 'ACTIVE' : 'SUSPENDED';

      if (userData.type === 'sub_user') {
         if (type === 'activate') await updateSubUser?.(userData.id, { status: 'ACTIVE', isActive: true });
         else if (type === 'suspend') await updateSubUser?.(userData.id, { status: 'SUSPENDED', isActive: false });
         else if (type === 'delete') await removeSubUser?.(currentUser.id, userData.id);
      } else {
         // It's a head user / admin / etc
         if (type === 'activate' || type === 'suspend') {
            await userAPI.updateUserStatus(userData.id, { isActive, status });
         } else if (type === 'delete') {
            await userAPI.deleteUser(userData.id);
         }
      }
      
      setSuccessMessage(`User action successful`);
      await loadUsers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Action failed');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE': return { color: colors.success, bg: colors.success + "15" };
      case 'SUSPENDED': return { color: "#F59E0B", bg: "#F59E0B15" };
      default: return { color: colors.error, bg: colors.error + "15" };
    }
  };

  const commonCardStyle = {
    background: colors.bg2,
    border: `1px solid ${colors.border}`,
    borderRadius: 24,
    padding: 32,
    boxShadow: `0 4px 20px rgba(0,0,0, ${mode === 'dark' ? '0.2' : '0.02'})`
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg1, color: colors.text1, fontFamily: "'Inter', sans-serif" }}>
      <Navbar onNavigate={onNavigate || onBack} showAuthButtons={false} />

      <div style={{ 
        paddingTop: 120, 
        maxWidth: 1100, 
        margin: '0 auto', 
        paddingBottom: 120,
        paddingLeft: 24,
        paddingRight: 24
      }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             {onBack && (
               <button 
                 onClick={onBack}
                 style={{ 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   padding: '0 16px', height: 48, borderRadius: 24, gap: '8px', 
                   border: 'none', 
                   background: mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                   color: colors.text1,
                   cursor: 'pointer',
                   transition: 'all 0.2s ease',
                 }}
                 title="Go Back"
                 onMouseEnter={(e) => e.currentTarget.style.background = mode === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                 onMouseLeave={(e) => e.currentTarget.style.background = mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
               >
                 <ArrowLeft size={20} /> <span style={{fontWeight: 600}}>Back</span>
               </button>
             )}
            <div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-0.03em", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Team Management
              </h1>
              <p style={{ color: colors.text2, marginTop: 8, fontSize: "1.05rem" }}>
                Manage users, roles and feature permissions
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ 
              padding: '12px 28px', borderRadius: 12, border: 'none', background: colors.primary, 
              color: mode === 'dark' ? '#0B0E14' : '#fff', fontWeight: "700", cursor: "pointer", 
              display: 'flex', alignItems: 'center', gap: 10, boxShadow: `0 8px 24px ${colors.primary}40`
            }}
          >
            <UserPlus size={18} /> Invite Member
          </button>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, marginBottom: 48 }}>
          {[
            { label: 'Total', value: users.length, color: colors.primary, icon: Users },
            { label: 'Active', value: users.filter(u => u.status === 'ACTIVE').length, color: colors.success, icon: CheckCircle },
            { label: 'Issues', value: users.filter(u => u.status !== 'ACTIVE').length, color: colors.error, icon: AlertCircle },
          ].map((stat, i) => (
            <div key={i} style={{ ...commonCardStyle, padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: stat.color + "15", display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: "800", color: colors.text1 }}>{stat.value}</div>
                <div style={{ fontSize: 12, fontWeight: "600", color: colors.text2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ ...commonCardStyle, padding: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: colors.text2 }} />
            <input 
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: 12, border: `1px solid ${colors.border}`, background: mode === 'dark' ? "rgba(0,0,0,0.2)" : "white", color: colors.text1, outline: 'none' }}
            />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '12px 16px', borderRadius: 12, background: mode === 'dark' ? colors.bg2 : 'white', border: `1px solid ${colors.border}`, color: colors.text1, cursor: 'pointer' }}>
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* User Table Card */}
        <div style={{ ...commonCardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ background: mode === 'dark' ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", padding: '16px 32px', borderBottom: `1px solid ${colors.border}`, display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: colors.text2 }}>
            <span>User</span>
            <span>Email</span>
            <span>Status</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: colors.text2 }}>Loading team members...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: colors.text2 }}>No team members found</div>
          ) : (
            filteredUsers.map((u, i) => (
              <div key={u.id} style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr', alignItems: 'center', borderBottom: i < filteredUsers.length -1 ? `1px solid ${colors.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: colors.primary + "20", color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: "700" }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: "700", color: colors.text1 }}>{u.name}</span>
                </div>
                <span style={{ color: colors.text2, fontSize: "0.95rem" }}>{u.email}</span>
                <div>
                  <span style={{ ...getStatusStyle(u.status), padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: "800" }}>
                    {u.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button onClick={() => {
                        setSelectedUser(u);
                        setNewUserData({
                           name: u.name,
                           email: u.email,
                           password: '',
                           allowedFeatures: u.allowedFeatures || []
                        });
                        setShowAddModal(true);
                     }} 
                     style={{ background: colors.primary + "15", border: 'none', color: colors.primary, padding: 8, borderRadius: 8, cursor: "pointer" }}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleUserAction(u.status === 'ACTIVE' ? 'suspend' : 'activate', u)} style={{ background: mode === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: 'none', color: colors.text1, padding: 8, borderRadius: 8, cursor: "pointer" }}>
                    {u.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  <button onClick={() => handleUserAction('delete', u)} style={{ background: colors.error + "15", border: 'none', color: colors.error, padding: 8, borderRadius: 8, cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Global DB Users (Admin Only) - Deprecated as table covers it natively now */}
      </div>

      {/* Footer has been removed here because it's rendered by Dashboard or App level, preventing duplicate footers */}

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: 24 }}>
          <div style={{ ...commonCardStyle, width: '100%', maxWidth: 440, padding: 48, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>{selectedUser ? "Edit Member" : "Invite Member"}</h3>
            <p style={{ color: colors.text2, marginBottom: 32 }}>{selectedUser ? "Update this member's details and permissions." : "Add a new team member to your workspace."}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <input 
                placeholder="Name" 
                value={newUserData.name} 
                onChange={e => setNewUserData({...newUserData, name: e.target.value})}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg1, color: colors.text1, outline: 'none' }}
              />
              <input 
                placeholder="Email" 
                value={newUserData.email} 
                disabled={!!selectedUser} // Cannot change email once set to prevent conflicts
                onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg1, color: selectedUser ? colors.text2 : colors.text1, outline: 'none', opacity: selectedUser ? 0.7 : 1 }}
              />
              <input 
                type="password"
                placeholder={selectedUser ? "New Password (Optional)" : "Initial Password"} 
                value={newUserData.password} 
                onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                style={{ width: '100%', padding: 14, borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg1, color: colors.text1, outline: 'none' }}
              />

              {(!selectedUser || selectedUser.type === 'sub_user') && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, fontWeight: "700", marginBottom: 12, display: 'block', color: colors.text2 }}>Tools Permission</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                   {ALL_FEATURES.map(f => {
                     const active = newUserData.allowedFeatures.includes(f.id);
                     return (
                       <button key={f.id} onClick={() => {
                         const has = newUserData.allowedFeatures.includes(f.id);
                         setNewUserData({...newUserData, allowedFeatures: has ? newUserData.allowedFeatures.filter(x => x !== f.id) : [...newUserData.allowedFeatures, f.id]});
                       }} style={{ padding: '8px 16px', borderRadius: 10, fontSize: 11, fontWeight: "700", border: `1px solid ${active ? colors.primary : colors.border}`, background: active ? colors.primary : 'transparent', color: active ? (mode==='dark'?'#0B0E14':'#fff') : colors.text2, cursor: "pointer" }}>
                         {f.name}
                       </button>
                     );
                   })}
                </div>
              </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button onClick={() => {
                   setShowAddModal(false);
                   setSelectedUser(null);
                   setNewUserData({ name: '', email: '', password: '', allowedFeatures: [] });
                }} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text1, fontWeight: "600", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={async () => {
                  if (!newUserData.name || !newUserData.email) return;
                  if (selectedUser) {
                     // Hit Update API
                     if (selectedUser.type === 'sub_user') {
                        await updateSubUser(selectedUser.id, newUserData);
                     }
                  } else {
                     await addSubUser(currentUser.id, newUserData);
                  }
                  
                  setShowAddModal(false);
                  setSelectedUser(null);
                  loadUsers();
                }} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: colors.primary, color: mode==='dark'?'#0B0E14':'#fff', fontWeight: "700", cursor: "pointer" }}>
                  {selectedUser ? "Update Member" : "Send Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsersPage;
