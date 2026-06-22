import React, { useState } from 'react';
import { TrendingUp, Mail, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';

export function PhoneOtpFirst() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep('otp');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-8 font-sans text-slate-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative z-10">
        <div className="p-8">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-200/50 mb-5 relative">
              <TrendingUp className="text-white w-7 h-7" strokeWidth={2.5} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-[10px] font-bold">₹</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Loan Khatam
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Your personal ledger for friends & family
            </p>
          </div>

          {step === 'phone' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-slate-700 block">
                    Mobile Number
                  </label>
                  <div className="flex rounded-xl border-2 border-slate-200 bg-white overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                    <div className="flex items-center justify-center bg-slate-50 px-4 border-r-2 border-slate-200 text-slate-600 font-semibold select-none">
                      <span className="mr-2 text-lg">🇮🇳</span> +91
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 p-3 outline-none text-lg font-semibold text-slate-900 placeholder:text-slate-300 placeholder:font-medium tracking-wide w-full"
                      placeholder="99999 99999"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phone.length < 10}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white p-4 rounded-xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 group focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                >
                  Get OTP
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  We'll send a one-time code, never a password.
                </div>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-slate-400 font-medium">Or log in with</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 p-3.5 rounded-xl font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <button 
                onClick={() => setStep('phone')}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 rounded px-1 -ml-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Enter OTP</h2>
                <p className="text-slate-500 text-sm mt-1">
                  We've sent a 4-digit code to <span className="font-semibold text-slate-700">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                </p>
              </div>

              <form className="space-y-6">
                <div role="group" aria-label="One-time passcode" className="flex justify-between gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      aria-label={`OTP digit ${index + 1}`}
                      className="w-16 h-16 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      placeholder="•"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white p-4 rounded-xl font-semibold text-base transition-all shadow-md shadow-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Verify & Sign In
                </button>

                <div className="text-center text-sm font-medium text-slate-500">
                  Didn't receive it? <button type="button" className="text-indigo-600 font-semibold hover:underline focus:outline-none">Resend Code</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col items-center gap-4">
          <button className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2 transition-colors focus:outline-none">
            <Mail className="w-4 h-4" />
            Use Email / Password instead
          </button>
          
          <p className="text-sm text-slate-500 font-medium">
            New to Loan Khatam?{' '}
            <button className="text-indigo-600 font-bold hover:underline focus:outline-none">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
