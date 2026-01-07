import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as doLogin } from '../../services/auth';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Fingerprint,
  Eye,
  EyeOff,
  CalendarClock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import getimeLogo from '@/assets/getime-logo.svg';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await doLogin(email, password);
            await refreshUser();
            setLoading(false);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Identifiants invalides');
        }
    };

    const fillTestCredentials = () => {
        setEmail('milford46@example.net');
        setPassword('password');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-slate-200/60 blur-3xl" />
            <div className="absolute top-40 -left-16 h-64 w-64 rounded-full bg-sky-200/60 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-slate-100/70 blur-3xl" />

            <div className="w-full max-w-5xl px-6 relative z-10">
                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    {/* PANEL */}
                    <div className="hidden lg:flex flex-col justify-between rounded-[2.5rem] bg-slate-900 text-white p-10 shadow-2xl">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-slate-100">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                GeTime Access
                            </div>
                            <h1 className="mt-6 text-4xl font-black leading-tight">
                                Un planning clair, un campus serein.
                            </h1>
                            <p className="mt-4 text-slate-100">
                                Accedez a votre espace de gestion et gardez le controle sur les salles, enseignants et programmations.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                "Tableaux de bord adaptes a chaque role",
                                "Disponibilites centralisees",
                                "Suivi rapide des programmations",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FORM */}
                    <div className="bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white/40">
                        <div className="flex items-center justify-between">
                            <div>
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-white shadow-xl shadow-slate-200">
                                    <img src={getimeLogo} alt="GeTime" className="w-9 h-9" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-4">Connexion</h2>
                                <p className="text-slate-500 font-medium mt-2">Bienvenue sur GeTime</p>
                            </div>
                            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-700">
                                Retour accueil
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="font-bold">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">
                                <Mail className="w-3.5 h-3.5 text-slate-500" /> Adresse Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nom@exemple.com"
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/60 focus:bg-white outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">
                                <Lock className="w-3.5 h-3.5 text-slate-500" /> Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 pr-12 rounded-2xl border border-slate-200 bg-white/60 focus:bg-white outline-none focus:ring-4 focus:ring-slate-100 focus:border-slate-400 transition-all text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-500"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-slate-600 to-slate-500 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl py-7 h-auto shadow-xl shadow-blue-100 transition-all active:scale-[0.98] group"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2 font-bold text-base">
                                    Se connecter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>&copy; 2025 GeTime</span>
                        <div className="flex items-center gap-3">
                            <CalendarClock className="w-4 h-4 text-slate-400" />
                            Planification intelligente
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
