import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const from = params.get('from') || '/';

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      localStorage.setItem('authToken', token);
    } catch (e) {
      // noop
    }

    const finalize = (role, userObj) => {
      if (userObj) {
        try { localStorage.setItem('user', JSON.stringify(userObj)); } catch (_) {}
      }
      const target = role === 'admin' ? '/dashboard' : from;
      navigate(target || '/', { replace: true });
    };

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const userData = data.user || data; // in case API returns raw user
          const role = userData?.role || decodeRoleFromToken(token) || 'user';
          finalize(role, userData);
          return;
        }
      } catch (_) {
        // fall back to token decoding
      }
      const role = decodeRoleFromToken(token) || 'user';
      finalize(role);
    };

    const decodeRoleFromToken = (jwt) => {
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        return payload?.role;
      } catch (_) {
        return null;
      }
    };

    fetchProfile();
  }, [location.search, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-lg">Signing you in...</p>
    </div>
  );
} 