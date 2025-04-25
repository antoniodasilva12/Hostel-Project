import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiSmartphone, FiUser, FiMail, FiLock, FiCreditCard, FiBook, FiPhone, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';

interface FormData {
  first_name: string;
  last_name: string;
  national_id: string;
  student_id: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  gender: string;
  role: string;
}

interface FieldErrors {
  first_name?: string;
  last_name?: string;
  national_id: string;
  student_id?: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

interface TouchedFields {
  first_name?: boolean;
  last_name?: boolean;
  national_id: boolean;
  student_id?: boolean;
  email: boolean;
  phone_number: boolean;
  password: boolean;
  confirm_password: boolean;
}

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    national_id: '',
    student_id: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    gender: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    national_id: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const [touched, setTouched] = useState<TouchedFields>({
    national_id: false,
    email: false,
    phone_number: false,
    password: false,
    confirm_password: false
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    uppercase: false,
    lowercase: false,
    special: false
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'national_id':
        if (touched.national_id && value.length !== 8) {
          setFieldErrors(prev => ({ ...prev, national_id: 'National ID must be 8 characters long' }));
        } else {
          setFieldErrors(prev => ({ ...prev, national_id: '' }));
        }
        break;
      case 'email':
        if (touched.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          setFieldErrors(prev => ({ ...prev, email: 'Invalid email address' }));
        } else {
          setFieldErrors(prev => ({ ...prev, email: '' }));
        }
        break;
      case 'phone_number':
        if (touched.phone_number && !/^\+?[1-9]\d{1,14}$/.test(value)) {
          setFieldErrors(prev => ({ ...prev, phone_number: 'Invalid phone number format' }));
        } else {
          setFieldErrors(prev => ({ ...prev, phone_number: '' }));
        }
        break;
      case 'password':
        if (touched.password) {
          const requirements = {
            length: value.length >= 8,
            number: /\d/.test(value),
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
          };
          setPasswordRequirements(requirements);
          
          const errors: string[] = [];
          if (!requirements.length) errors.push('Password must be at least 8 characters');
          if (!requirements.number) errors.push('Include at least one number');
          if (!requirements.uppercase) errors.push('Include at least one uppercase letter');
          if (!requirements.lowercase) errors.push('Include at least one lowercase letter');
          if (!requirements.special) errors.push('Include at least one special character');
          setFieldErrors(prev => ({ ...prev, password: errors.join(', ') }));
        }
        break;
      case 'confirm_password':
        if (touched.confirm_password && value !== formData.password) {
          setFieldErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match' }));
        } else {
          setFieldErrors(prev => ({ ...prev, confirm_password: '' }));
        }
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.national_id.trim() || 
        !formData.student_id.trim() || !formData.email.trim() || !formData.phone_number.trim() || 
        !formData.password.trim() || !formData.confirm_password.trim() || !formData.gender) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Set all fields as touched to trigger validation
    const allTouched: TouchedFields = {
      national_id: true,
      email: true,
      phone_number: true,
      password: true,
      confirm_password: true,
      first_name: true,
      last_name: true,
      student_id: true
    };
    setTouched(allTouched);

    // Validate all fields
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key as keyof typeof formData]);
    });

    // Check for any validation errors
    const hasErrors = Object.values(fieldErrors).some(error => error !== '');
    if (hasErrors) {
      setError('Please correct the errors in the form');
      setLoading(false);
      return;
    }

    try {
      // First, validate the email format
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      // Validate password requirements
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Validate phone number format (adjust regex as needed)
      if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone_number)) {
        throw new Error('Invalid phone number format. Please include country code if using international format');
      }

      // Validate student ID format
      if (!/^\d{4}\/[A-Z]{2,}\/\d{5}$/.test(formData.student_id)) {
        throw new Error('Invalid student ID format. Expected format: YYYY/XX/12345');
      }

      // Attempt to sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`
          }
        }
      });

      if (signUpError) {
        // Handle specific Supabase errors
        if (signUpError.message.includes('email')) {
          throw new Error('This email is already registered or invalid');
        }
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: data.user.id,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          full_name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
          national_id: formData.national_id,
          student_id: formData.student_id.toUpperCase(),
          email: formData.email.toLowerCase(),
          phone_number: formData.phone_number,
          gender: formData.gender,
          role: formData.role
        }]);

      if (profileError) {
        // If profile creation fails, we should handle the cleanup
        // You might want to delete the auth user here
        if (profileError.code === '23505') { // Unique violation
          throw new Error('A profile with this information already exists');
        }
        throw profileError;
      }

      setSuccess(true);
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300";
  const labelClasses = "block text-sm font-medium text-gray-900";
  const iconClasses = "h-5 w-5 text-gray-500";
  const errorClasses = "mt-1 text-sm text-red-600";

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-fixed bg-no-repeat before:content-[''] before:fixed before:inset-0 before:bg-black before:bg-opacity-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-transparent py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold flex items-center">
            <div className="bg-indigo-500/20 p-3 rounded-lg backdrop-blur-sm mr-3">
              <FiSmartphone className="h-8 w-8 text-indigo-300" />
            </div>
            Student Portal
          </Link>
        </div>
      </nav>

      <div className="min-h-screen flex flex-col py-12 sm:px-6 lg:px-8 relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-200">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200 flex items-center">
                <FiX className="h-5 w-5 text-red-500 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md border border-green-200 flex items-center animate-fade-in">
                <FiCheck className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="font-medium">Registration Successful!</p>
                  <p>Your account has been created. Redirecting to login page...</p>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="first_name" className={labelClasses}>First Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className={iconClasses} />
                      </div>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        className={inputClasses}
                        value={formData.first_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    {fieldErrors.first_name && touched.first_name && (
                      <p className={errorClasses}>{fieldErrors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="last_name" className={labelClasses}>Last Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className={iconClasses} />
                      </div>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        className={inputClasses}
                        value={formData.last_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    {fieldErrors.last_name && touched.last_name && (
                      <p className={errorClasses}>{fieldErrors.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="national_id" className={labelClasses}>National ID</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCreditCard className={iconClasses} />
                    </div>
                    <input
                      id="national_id"
                      name="national_id"
                      type="text"
                      required
                      maxLength={8}
                      className={inputClasses}
                      value={formData.national_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {fieldErrors.national_id && touched.national_id && (
                    <p className={errorClasses}>{fieldErrors.national_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="student_id" className={labelClasses}>Registration Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiBook className={iconClasses} />
                    </div>
                    <input
                      id="student_id"
                      name="student_id"
                      type="text"
                      required
                      pattern="\d{4}/[A-Z]{2,}/\d{5}"
                      title="Enter Registration Number (e.g., 2024/CS/12345)"
                      className={inputClasses}
                      value={formData.student_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {fieldErrors.student_id && touched.student_id && (
                    <p className={errorClasses}>{fieldErrors.student_id}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={labelClasses}>Email address</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className={iconClasses} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={inputClasses}
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {fieldErrors.email && touched.email && (
                    <p className={errorClasses}>{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone_number" className={labelClasses}>Phone Number</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className={iconClasses} />
                    </div>
                    <input
                      id="phone_number"
                      name="phone_number"
                      type="tel"
                      required
                      className={inputClasses}
                      value={formData.phone_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                  {fieldErrors.phone_number && touched.phone_number && (
                    <p className={errorClasses}>{fieldErrors.phone_number}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className={labelClasses}>Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className={iconClasses} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {(touched.password || fieldErrors.password) && (
                    <div className="mt-2 space-y-2 text-sm">
                      <div className={`flex items-center ${passwordRequirements.length ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordRequirements.length ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                        At least 8 characters
                      </div>
                      <div className={`flex items-center ${passwordRequirements.number ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordRequirements.number ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                        At least one number
                      </div>
                      <div className={`flex items-center ${passwordRequirements.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordRequirements.uppercase ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                        At least one uppercase letter
                      </div>
                      <div className={`flex items-center ${passwordRequirements.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordRequirements.lowercase ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                        At least one lowercase letter
                      </div>
                      <div className={`flex items-center ${passwordRequirements.special ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordRequirements.special ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
                        At least one special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm_password" className={labelClasses}>Confirm Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className={iconClasses} />
                    </div>
                    <input
                      id="confirm_password"
                      name="confirm_password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={inputClasses}
                      value={formData.confirm_password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirm_password && touched.confirm_password && (
                    <p className={errorClasses}>{fieldErrors.confirm_password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className={labelClasses}>Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    className={inputClasses}
                    value={formData.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="role" className={labelClasses}>Role</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value="student"
                    readOnly
                    className={`${inputClasses} bg-gray-100`}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 