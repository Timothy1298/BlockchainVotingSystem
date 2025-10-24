import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // single user state
  const [user, setUser] = useState(null);
  // Normalize token: strip leading 'Bearer ' if present when reading from localStorage
  const rawStored = (() => { try { return localStorage.getItem('token'); } catch (e) { return null; } })();
  const initialToken = rawStored && String(rawStored).startsWith('Bearer ') ? String(rawStored).replace(/^Bearer\s+/, '') : rawStored || null;
  const [token, setToken] = useState(initialToken);
  // store refresh token separately so we can attempt refresh on page reload
  const rawRefresh = (() => { try { return localStorage.getItem('refreshToken'); } catch (e) { return null; } })();
  const [refreshToken, setRefreshToken] = useState(rawRefresh || null);
  const [loading, setLoading] = useState(!!initialToken); // Start loading if we have a token

  useEffect(() => {
    const init = async () => {
      if (!token && !refreshToken) {
        setLoading(false);
        return;
      }
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        setLoading(true);
          // Ensure axios has the Authorization header set immediately in-memory
          try { API.defaults.headers.Authorization = token ? `Bearer ${token}` : undefined; } catch (e) {}
          // Debugging: log token and headers so we can trace 401 issues
          try {
            // eslint-disable-next-line no-console
            console.debug('[Auth] init token:', token ? `${String(token).slice(0,8)}...${String(token).slice(-6)}` : null);
            // eslint-disable-next-line no-console
            console.debug('[Auth] axios default auth header:', API.defaults.headers.Authorization);
            // eslint-disable-next-line no-console
            console.debug('[Auth] axios baseURL:', API.defaults.baseURL || import.meta.env.VITE_API_BASE_URL);
          } catch (e) {}
          // Try to fetch current user with existing access token
          const res = await API.get('/auth/me');
          const payload = (res && res.data && res.data.data) ? res.data.data : (res && res.data) ? res.data : null;
          setUser((payload && payload.user) ? payload.user : payload);
      } catch (err) {
        // Handle network errors gracefully
        if (err?.code === 'ERR_NETWORK' || err?.message?.includes('ERR_CONNECTION_REFUSED')) {
          console.warn('Server is not available - running in offline mode');
          setUser(null);
          setToken(null);
          setRefreshToken(null);
          return;
        }

        // If fetching /auth/me fails due to expired access token, attempt refresh
        console.warn('Auth init failed, attempting refresh if possible', err?.message || err);
        if (refreshToken) {
          try {
            const refreshRes = await API.post('/auth/refresh', { refreshToken });
            const refreshPayload = (refreshRes && refreshRes.data && refreshRes.data.data) ? refreshRes.data.data : (refreshRes && refreshRes.data) ? refreshRes.data : null;
            const newAccess = refreshPayload?.accessToken || refreshPayload?.token || (refreshRes && refreshRes.data && refreshRes.data.accessToken) || null;
            if (newAccess) {
              const normalized = typeof newAccess === 'string' && newAccess.startsWith('Bearer ') ? newAccess.replace(/^Bearer\s+/, '') : newAccess
              setToken(normalized);
              try { localStorage.setItem('token', normalized); } catch (e) {}
              try { API.defaults.headers.Authorization = `Bearer ${normalized}`; } catch (e) {}
              // Retry fetching user
              const meRes = await API.get('/auth/me');
              const mePayload = (meRes && meRes.data && meRes.data.data) ? meRes.data.data : (meRes && meRes.data) ? meRes.data : null;
              setUser((mePayload && mePayload.user) ? mePayload.user : mePayload);
              return;
            }
          } catch (refreshErr) {
            console.warn('Refresh failed', refreshErr?.message || refreshErr);
          }
        }

        // No valid refresh token or refresh failed -> clear auth
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        try { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); } catch (e) {}
        try { delete API.defaults.headers.Authorization; } catch (e) {}
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    init();
  }, []); // Empty dependency array - only run on mount

  const login = async (email, password, role = null) => {
    // Determine the correct endpoint based on role
    const endpoint = role === 'voter' ? '/voter-auth/login' : '/auth/login';
    
    const res = await API.post(endpoint, { email, password });
    // Handle server response wrapper: { success, data: { accessToken, refreshToken, user } }
    const responseData = res.data;
    const payload = responseData?.data || responseData;
    let t = payload?.accessToken || payload?.token || null;
    const rToken = payload?.refreshToken || null;
    
    // If token accidentally includes 'Bearer ' (double-wrap), strip it
    if (typeof t === 'string' && t.startsWith('Bearer ')) t = t.replace(/^Bearer\s+/, '');
    
    // Debug: inspect payload and token shape
    try {
      // eslint-disable-next-line no-console
      console.debug('[Auth][login] response structure:', { success: responseData?.success, hasData: !!responseData?.data });
      // eslint-disable-next-line no-console
      console.debug('[Auth][login] payload keys:', payload ? Object.keys(payload) : 'null');
      // eslint-disable-next-line no-console
      console.debug('[Auth][login] raw token preview:', t ? `${String(t).slice(0,8)}...${String(t).slice(-6)}` : 'null');
    } catch (e) {}

    // Validate token shape before applying it as a Bearer token to avoid sending non-JWT values
    const isJwtLike = typeof t === 'string' && /^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.test(t);
    if (t && !isJwtLike) {
      // eslint-disable-next-line no-console
      console.warn('[Auth][login] token does not look like a JWT; not setting Authorization header');
    }

    setToken(t);
    try { if (t) localStorage.setItem('token', t); else localStorage.removeItem('token'); } catch (e) {}
    // store refresh token if present
    setRefreshToken(rToken);
    try { if (rToken) localStorage.setItem('refreshToken', rToken); else localStorage.removeItem('refreshToken'); } catch (e) {}
    // Also set the axios default header so subsequent requests use it immediately (use t, not token state)
    try { if (t && isJwtLike) API.defaults.headers.Authorization = `Bearer ${t}`; else delete API.defaults.headers.Authorization; } catch (e) {}
    setUser(payload?.user || payload);
    
    // Return the response with success property for the login component
    return {
      success: responseData?.success || true,
      data: payload,
      message: responseData?.message || 'Login successful',
      user: payload?.user || payload
    };
  };

  const register = async (payload, role = null) => {
    // Determine the correct endpoint based on role
    const endpoint = role === 'voter' ? '/voter-auth/register' : '/auth/register';
    
    const res = await API.post(endpoint, payload);
    const responseData = res?.data;
    const body = responseData?.data || responseData || null;
    const tRaw = body?.accessToken || body?.token || null;
    const r = body?.refreshToken || null;
    // Normalize and store
    const tokenVal = typeof tRaw === 'string' && tRaw.startsWith('Bearer ') ? tRaw.replace(/^Bearer\s+/, '') : tRaw;
    setToken(tokenVal);
    try { if (tokenVal) localStorage.setItem('token', tokenVal); else localStorage.removeItem('token'); } catch (e) {}
    try { if (tokenVal) API.defaults.headers.Authorization = `Bearer ${tokenVal}`; } catch (e) {}
    setRefreshToken(r);
    try { if (r) localStorage.setItem('refreshToken', r); else localStorage.removeItem('refreshToken'); } catch (e) {}
    setUser(body?.user || body);
    return {
      success: responseData?.success || true,
      data: body,
      message: responseData?.message || 'Registration successful',
      user: body?.user || body
    };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    try { localStorage.removeItem('token'); } catch (e) {}
    try { localStorage.removeItem('refreshToken'); } catch (e) {}
    try { delete API.defaults.headers.Authorization; } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
