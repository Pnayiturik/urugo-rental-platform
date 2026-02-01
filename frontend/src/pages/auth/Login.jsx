import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await handleLogin({ email, password });
      if (data.user.role === 'landlord') {
        navigate('/landlord');
      } else {
        navigate('/tenant');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--gradient-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1000px',
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: 'var(--shadow-2xl)',
        overflow: 'hidden'
      }}>
        {/* Left Side - Branding */}
        <div style={{
          flex: 1,
          background: 'var(--gradient-purple-pink)',
          padding: 'var(--space-3xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: 'white'
        }}>
          <h1 style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--space-md)' }}>
            🏠 Urugo
          </h1>
          <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 'var(--space-xl)' }}>
            Rental Management Platform
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              ✓ Manage your properties easily
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              ✓ Track payments in real-time
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              ✓ Secure document management
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              ✓ Mobile money integration
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          flex: 1,
          padding: 'var(--space-3xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)', color: 'var(--gray-900)' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-xl)' }}>
            Sign in to your account
          </p>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid var(--error-red)',
              color: 'var(--error-red)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-md)',
              fontSize: 'var(--font-size-sm)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-300)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'var(--transition-fast)'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-300)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'var(--transition-fast)'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'var(--primary-purple)',
                color: 'white',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'var(--transition-fast)',
                marginTop: 'var(--space-sm)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{
            marginTop: 'var(--space-xl)',
            textAlign: 'center',
            color: 'var(--gray-600)',
            fontSize: 'var(--font-size-sm)'
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary-purple)', fontWeight: 'var(--font-weight-semibold)' }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;