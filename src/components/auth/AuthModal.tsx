import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from '../../services/firebase';
import { useUIStore } from '../../store/uiStore';
import { Cloud, Lock, Mail, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { showToast } = useUIStore();

  const resetState = () => {
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const getCleanErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network connection failed. Please check your internet connection.';
      default:
        return err?.message || 'Authentication error. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email.trim());
        showToast('Password reset link sent to your email!', 'success');
        setMode('signin');
      } catch (err: any) {
        setErrorMsg(getCleanErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        showToast(`Welcome back, ${userCred.user.email}! Syncing stash...`, 'success');
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        showToast(`Account created! Stash sync active for ${userCred.user.email}`, 'success');
      }
      handleClose();
    } catch (err: any) {
      setErrorMsg(getCleanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === 'reset'
          ? 'Reset Password'
          : mode === 'signup'
          ? 'Create MDstash Cloud Account'
          : 'Sign In to MDstash'
      }
      description={
        mode === 'reset'
          ? 'Enter your email to receive a recovery link.'
          : 'Sync your markdown notes and collections across all your PCs in real time.'
      }
      maxWidth="md"
    >
      <div className="flex flex-col gap-5">
        {/* Sync Benefit Banner */}
        <div className="p-3.5 rounded-xl bg-[rgba(248,247,230,0.4)] border border-[rgba(38,51,42,0.15)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange/20 text-orange flex items-center justify-center shrink-0 mt-0.5">
            <Cloud className="w-4 h-4 text-orange" />
          </div>
          <div className="text-xs text-ink/85 leading-relaxed">
            <span className="font-bold text-ink block font-display text-[13px]">
              Multi-Device Cloud Sync
            </span>
            Sign in on any computer and your notes will appear automatically. Your session stays
            persisted forever until you sign out.
          </div>
        </div>

        {/* Tab switchers if not in reset mode */}
        {mode !== 'reset' && (
          <div className="flex p-1 bg-[#D8D3BC] rounded-xl border border-[rgba(38,51,42,0.2)]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-display tracking-wide transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-cream text-ink font-bold shadow-xs'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-display tracking-wide transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-cream text-ink font-bold shadow-xs'
                  : 'text-ink/70 hover:text-ink'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-100/80 border border-red-300 text-red-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-display font-medium text-ink mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full bg-[#EAE6D2] border border-[rgba(38,51,42,0.2)] rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-ink/50 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/30 font-sans font-medium"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-display font-medium text-ink">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setErrorMsg(null);
                    }}
                    className="text-[11px] text-orange hover:underline cursor-pointer font-sans"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#EAE6D2] border border-[rgba(38,51,42,0.2)] rounded-xl pl-9 pr-3 py-2 text-xs text-ink placeholder:text-ink/50 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/30 font-sans font-medium"
                />
              </div>
            </div>
          )}

          {/* Session Persistence Note */}
          <div className="flex items-center gap-2 text-[11px] text-ink/75 font-sans pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-deep shrink-0" />
            <span>Persistent session enabled: stay logged in on this computer forever.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(38,51,42,0.12)]">
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-display text-ink/80 hover:text-ink cursor-pointer"
              >
                Back to Sign In
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-display text-ink/80 hover:text-ink border border-[rgba(38,51,42,0.2)] bg-transparent hover:bg-black/5 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-orange hover:bg-orange-deep text-forest font-display text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : mode === 'reset'
                ? 'Send Reset Link'
                : mode === 'signup'
                ? 'Create Account & Sync'
                : 'Sign In & Sync'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};
