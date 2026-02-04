import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  dateOfBirth: '',
  role: 'landlord'
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await handleRegister(formData);
      if (formData.role === 'landlord') {
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
            <p>✓ Safe and secure rent payments</p>
            <p>✓ Digital lease management</p>
            <p>✓ Real-time payment tracking</p>
            <p>✓ Mobile money support</p>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div style={{
          flex: 1,
          padding: 'var(--space-3xl)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflowY: 'auto',
          maxHeight: '100vh'
        }}>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)', color: 'var(--gray-900)' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-xl)' }}>
            Sign up to get started
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
            {/* Role Selection */}
            {/* Role Selection */}
<div style={{ marginBottom: 'var(--space-md)' }}>
  <div
    style={{
      padding: 'var(--space-md)',
      borderRadius: 'var(--radius-lg)',
      border: '2px solid var(--primary-purple)',
      background: '#F3E8FF',
      textAlign: 'center'
    }}
  >
    <p style={{ fontSize: 'var(--font-size-xl)' }}>🏢</p>
    <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--primary-purple)' }}>
      Landlord Account
    </p>
    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-xs)' }}>
      Tenants are invited by landlords
    </p>
  </div>
</div>
<input type="hidden" name="role" value="landlord" />

            {/* First & Last Name */}
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-300)',
                    fontSize: 'var(--font-size-base)'
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-300)',
                    fontSize: 'var(--font-size-base)'
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-300)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+250 700 000 000"
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-300)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>

            {/* Date of Birth */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-300)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--gray-700)' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
                minLength={6}
                style={{
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--gray-300)',
                  fontSize: 'var(--font-size-base)'
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.role}
              style={{
                background: 'var(--primary-purple)',
                color: 'white',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-semibold)',
                border: 'none',
                cursor: loading || !formData.role ? 'not-allowed' : 'pointer',
                opacity: loading || !formData.role ? 0.6 : 1,
                transition: 'var(--transition-fast)',
                marginTop: 'var(--space-sm)'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{
            marginTop: 'var(--space-xl)',
            textAlign: 'center',
            color: 'var(--gray-600)',
            fontSize: 'var(--font-size-sm)'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary-purple)', fontWeight: 'var(--font-weight-semibold)' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;