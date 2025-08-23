'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, 
  ArrowRight, 
  CheckCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export function LoginPasswordless({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/home';
  
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const supabase = createClient();

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === 'signup',
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setStep('code');
        setSuccess('Check your email for the verification code');
        setResendTimer(60); // 60 second cooldown
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = code.join('');
    
    if (token.length !== 6) {
      setError('Please enter a complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        // Success! Redirect to intended page
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: mode === 'signup',
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('New code sent to your email');
        setResendTimer(60);
        setCode(['', '', '', '', '', '']);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 bg-white">
      <div className="mx-auto w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-6">
            <div className="w-2 h-2 bg-gray-900 rounded-full" />
          </div>
          <h1 className="text-xl font-medium text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'email' 
              ? 'We\'ll send you a code'
              : 'Check your email'
            }
          </p>
        </div>

        <div className="space-y-6">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-normal text-gray-600">
                  Email
                </Label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-lg border-gray-200 focus:border-gray-900 focus:ring-0 transition-colors"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="text-xs text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-normal transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Continue</>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                {email}
              </button>

              <div>
                <Label className="text-xs font-normal text-gray-600">
                  Enter 6-digit code
                </Label>
                <div className="mt-3 flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-normal border-gray-200 focus:border-gray-900 focus:ring-0 rounded-lg transition-colors"
                      required
                    />
                  ))}
                </div>
              </div>

              {success && (
                <div className="flex items-center text-xs text-gray-600">
                  <CheckCircle className="w-3 h-3 mr-2" />
                  {success}
                </div>
              )}

              {error && (
                <div className="text-xs text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || code.some(d => !d)}
                className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-normal transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Verify</>
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0}
                  className="text-xs text-gray-600 hover:text-gray-900 disabled:text-gray-400 transition-colors"
                >
                  {resendTimer > 0 
                    ? `Resend code in ${resendTimer}s`
                    : 'Resend code'
                  }
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={async () => {
              const target = redirect || '/home';
              localStorage.setItem('oauth_redirect_target', target);
              const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(target)}`;
              
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: redirectUrl
                }
              });
            }}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 533.5 544.3">
              <path fill="#4285f4" d="m533.5 278.4c0-17.5-1.5-35.3-4.7-52.4h-254v99.1h144.1c-6.2 33.4-24.8 61.5-52.9 80.7l85.6 66.6c50.1-46.1 79-114.1 79-193z"/>
              <path fill="#34a853" d="m279 544.3c71.6 0 132-23.7 176-64.3l-85.6-66.6c-23.8 16-54.4 25.2-90.4 25.2-69.4 0-128-46.8-149-109.5l-87.2 67.5c42.3 84.1 131 147.7 236.2 147.7z"/>
              <path fill="#fbbc04" d="m130 329.1c-9.8-29.4-9.8-61.4 0-90.8l-87.2-67.5c-38.3 75.6-38.3 164.5 0 240.1z"/>
              <path fill="#ea4335" d="m279 107.7c38.9-.6 76.4 13.9 105.1 40.7l78.6-78.6c-48.3-44.9-112.6-69.3-183.6-69.8-105.1 0-193.9 63.6-236.2 147.8l87.2 67.5c21-62.8 79.6-109.6 149-109.6z"/>
            </svg>
            <span className="text-sm">Continue with Google</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Link
              href={mode === 'signin' ? '/sign-up' : '/sign-in'}
              className="text-gray-900 hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}