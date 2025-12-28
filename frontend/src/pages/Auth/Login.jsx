import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as doLogin } from '../../services/auth';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Fingerprint
} from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await doLogin(email, password);
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
            {/* Éléments décoratifs de fond */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />

            <div className="w-full max-w-md px-6 relative z-10">
                {/* LOGO / ENTÊTE */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-500 shadow-xl shadow-indigo-200 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Manager</h1>
                    <p className="text-slate-500 font-medium mt-2">Bienvenue sur votre espace de gestion</p>
                </div>

                {/* FORMULAIRE */}
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="font-bold">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">
                                <Mail className="w-3.5 h-3.5 text-indigo-500" /> Adresse Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nom@exemple.com"
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-2">
                                <Lock className="w-3.5 h-3.5 text-indigo-500" /> Mot de passe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-white/50 focus:bg-white outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-2xl py-7 h-auto shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] group"
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

                    {/* Ligne de séparation */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-tighter"><span className="bg-white px-4 text-slate-300">Mode Démonstration</span></div>
                    </div>

                    {/* BLOC CREDENTIALS (Style Badge) */}
                    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 group hover:border-indigo-100 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                <Fingerprint className="w-5 h-5 text-indigo-500" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-700">Accès rapide</h3>
                        </div>
                        
                        <div className="space-y-1 mb-4">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Compte test</p>
                            <p className="text-xs text-slate-600 font-medium font-mono">milford46@example.net</p>
                        </div>

                        <button
                            onClick={fillTestCredentials}
                            className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-95 shadow-sm"
                        >
                            Remplir automatiquement
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-slate-400 text-xs font-medium">
                    &copy; 2025 Campus Management System. Tous droits réservés.
                </p>
            </div>
        </div>
    );
}