import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ShieldCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";

import getimeLogo from "@/assets/getime-logo.svg";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Identifiants incorrects. Vérifiez votre email et votre mot de passe."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Top mini brand */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-border bg-card flex items-center justify-center">
              <img src={getimeLogo} alt="GeTime2" className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight text-lg">
                GeTime<span className="text-primary">2</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Academic Scheduling Platform
              </div>
            </div>
          </Link>

          <Link
            to="/"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Retour à l’accueil
          </Link>
        </div>

        {/* Main grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Left info panel */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.8rem] border border-border bg-card p-8 md:p-10 relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-primary/10 blur-2xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Accès institutionnel
                </span>
              </div>

              <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">
                Connexion à GeTime2
              </h1>

              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg">
                Connectez-vous pour accéder au tableau de bord, gérer les salles,
                planifier les séances et publier les emplois du temps.
              </p>

              <div className="mt-7 grid gap-4">
                <InfoLine
                  icon={ShieldCheck}
                  title="Sécurité"
                  desc="Authentification token (Sanctum) et contrôle d’accès par rôles."
                />
                <InfoLine
                  icon={ArrowRight}
                  title="Workflow"
                  desc="Disponibilités → Programmation → Publication → Notifications."
                />
              </div>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[1.8rem] border border-border bg-background p-8 md:p-10"
          >
            <div className="rounded-2xl border border-border bg-card p-6 md:p-7">
              <h2 className="text-xl font-extrabold tracking-tight">
                Se connecter
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Entrez vos identifiants pour continuer.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground">
                  {error}
                </div>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm font-semibold">Email</label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-input-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      className="w-full bg-transparent outline-none text-sm"
                      placeholder="ex: scolarite@universite.cm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold">Mot de passe</label>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-input-background px-3 py-3 focus-within:ring-2 focus-within:ring-ring">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      className="w-full bg-transparent outline-none text-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[color:var(--primary)]"
                    />
                    Rester connecté
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                >
                  {loading ? "Connexion..." : "Connexion"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Accès réservé au personnel autorisé (administration, programmeurs, enseignants).
                </p>

                {/* Optional register link */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Nouveau compte ?{" "}
                    <Link to="/register" className="font-semibold text-primary hover:underline">
                      Créer un compte
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* small component */
function InfoLine({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-extrabold">{title}</p>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}
