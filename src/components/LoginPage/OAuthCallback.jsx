import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('OAuthCallback mounted, location:', location);
    
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const from = params.get('from') || '/';

    console.log('OAuthCallback params:', { token: token ? 'present' : 'missing', from });

    if (!token) {
      console.error('No token received from OAuth callback');
      navigate('/login', { replace: true });
      return;
    }

    // Store the token first
    try {
      localStorage.setItem('authToken', token);
      console.log('Auth token stored successfully');
    } catch (e) {
      console.error('Failed to store auth token:', e);
      navigate('/login', { replace: true });
      return;
    }

    const finalize = (role, userObj) => {
      try {
        console.log('Finalizing OAuth login with role:', role, 'user:', userObj);
        
        // Store user data if available
        if (userObj) {
          localStorage.setItem('user', JSON.stringify(userObj));
          console.log('User data stored successfully');
        }
        
        // Determine redirect target based on role and original destination
        let target;
        if (role === 'admin') {
          target = '/dashboard';
        } else {
          // For regular users, redirect to the page they were trying to access
          // or to user dashboard if they were going to home
          target = from === '/' ? '/' : from;
        }
        
        console.log(`Redirecting user with role ${role} to ${target}`);
        navigate(target, { replace: true });
      } catch (error) {
        console.error('Error during finalization:', error);
        navigate('/', { replace: true });
      }
    };

    const fetchProfile = async () => {
      try {
        console.log('Fetching user profile from API...');
        
        // Use the correct API endpoint for user profile
        const res = await fetch('http://localhost:3001/api/user/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log('Profile API response status:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Profile API response data:', data);
          
          const userData = data.user || data;
          const role = userData?.role || 'user';
          
          console.log('Successfully fetched user profile:', { role, userData });
          finalize(role, userData);
          return;
        } else {
          console.warn('Failed to fetch profile, status:', res.status);
          const errorText = await res.text();
          console.warn('Profile API error response:', errorText);
          
          // Fall back to token decoding
          const role = decodeRoleFromToken(token) || 'user';
          console.log('Falling back to token decoding, role:', role);
          finalize(role);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fall back to token decoding
        const role = decodeRoleFromToken(token) || 'user';
        console.log('Falling back to token decoding due to error, role:', role);
        finalize(role);
      }
    };

    const decodeRoleFromToken = (jwt) => {
      try {
        const payload = JSON.parse(atob(jwt.split('.')[1]));
        console.log('Decoded JWT payload:', payload);
        return payload?.role;
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
      }
    };

    // Start the profile fetch process
    console.log('Starting profile fetch process...');
    fetchProfile();
  }, [location.search, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#018ABD] mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Signing you in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we complete your authentication</p>
      </div>
    </div>
  );
} 