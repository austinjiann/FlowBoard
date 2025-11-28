import { Theme } from "@radix-ui/themes";
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will be added later
    console.log('Login attempt:', { email, password });
    // For now, just navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <Theme>
      <div className="min-h-screen relative bg-white">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Gradient Blur Effect */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-indigo/10 rounded-full blur-[200px] -z-10 pointer-events-none" />
        <div className="absolute bottom-[20%] right-1/4 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-[200px] -z-10 pointer-events-none" />
        
        <div className="relative z-10">
          <Navbar />
          
          <main className="pt-32 pb-20 px-6 min-h-screen flex items-center">
            <div className="max-w-md mx-auto w-full">
              {/* Login Card */}
              <div className="bg-white/60 backdrop-blur-md border border-gray-200/50 rounded-2xl p-8 shadow-xl shadow-black/5">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 bg-brand-indigo/10 rounded-2xl mb-4">
                    <LogIn className="w-8 h-8 text-brand-indigo" />
                  </div>
                  <h1 className="text-4xl font-normal text-gray-900 mb-2 font-ananda">
                    Welcome Back
                  </h1>
                  <p className="text-gray-600 font-light">
                    Sign in to continue to FlowBoard
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-brand-indigo hover:text-brand-purple transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-black/80 backdrop-blur-md text-white font-semibold rounded-xl hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10 border border-white/10 cursor-pointer group"
                  >
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/60 text-gray-500">Don't have an account?</span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/5 cursor-pointer"
                >
                  Create Account
                </button>
              </div>

              {/* Back to Home Link */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to home
                </button>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </Theme>
  );
}

export default Login;

