import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/UserProfile.css';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <div className="user-profile">
      <div 
        className="user-profile-info"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="user-profile-avatar">
          {user.profilePictureUrl ? (
            <img 
              src={user.profilePictureUrl} 
              alt="User" 
              className="user-profile-picture"
            />
          ) : (
            <div className="user-profile-placeholder">
              {user.name?.charAt(0).toUpperCase() || '👤'}
            </div>
          )}
        </div>
        <div className="user-profile-greeting">
          <span className="space-text">{user.name || 'User'}</span>
        </div>
        <div className="user-profile-arrow">
          {showDropdown ? '▲' : '▼'}
        </div>
      </div>
      
      {showDropdown && (
        <div className="user-profile-dropdown">
          <div className="dropdown-item">
            Profile
          </div>
          <div className="dropdown-item">
            Settings
          </div>
          <div className="dropdown-divider" />
          <button 
            onClick={handleLogout} 
            className="space-button user-profile-logout-button"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
