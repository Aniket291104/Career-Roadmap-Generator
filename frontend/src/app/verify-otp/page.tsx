'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/user-store';
import { Sparkles, Key, Loader2 } from 'lucide-react';

const otpSchema = z.object({
  otp: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

type OtpInput = z.infer<typeof otpSchema>;

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useUserStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const devOtpParam = searchParams.get('devOtp');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      toast.error('Email parameter missing.');
      router.push('/login');
    }
    if (devOtpParam) {
      setDevOtp(devOtpParam);
      setValue('otp', devOtpParam);
    }
  }, [searchParams, router, setValue]);

  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );

  const onSubmit = async (data: OtpInput) => {
    setSubmitting(true);
    try {
      const res = await api.post('/auth/verify-otp', {
        email,
        otp: data.otp,
      });
      if (typeof window !== 'undefined') {
        if (res.data.accessToken) localStorage.setItem('accessToken', res.data.accessToken);
        if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      setUser(res.data.user);
      toast.success('Account verified successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-card rounded-2xl p-8 relative shadow-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg">Roadmap.AI</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Verify Your Email</h2>
        <p className="text-xs text-muted-foreground mt-1.5">
          Enter the 6-digit OTP code dispatched to <span className="text-primary font-bold">{email}</span>
        </p>
      </div>

      {devOtp && (
        <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-center text-xs text-primary font-semibold">
          Development Mode: Your verification OTP is <span className="underline select-all text-sm font-extrabold">{devOtp}</span>
        </div>
      )}

      {isDev && !devOtp && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
          <p className="font-bold mb-1">🛠️ Local Development Mode</p>
          <p>If you don&apos;t receive the email, check your backend console logs or use the bypass code <span className="font-extrabold underline">123456</span>.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Verification Code</label>
          <div className="relative">
            <Key className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              {...register('otp')}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm font-semibold tracking-[4px] text-center transition-all"
            />
          </div>
          {errors.otp && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary text-white font-semibold rounded-lg text-sm shadow hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Account</span>}
        </button>
      </form>

      <p className="text-center text-xs mt-6 text-muted-foreground font-medium">
        Back to{' '}
        <Link href="/login" className="text-primary hover:underline font-bold">Sign In</Link>
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-mesh px-6 relative">
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <Suspense fallback={
        <div className="glass-card p-8 rounded-2xl text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      }>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
