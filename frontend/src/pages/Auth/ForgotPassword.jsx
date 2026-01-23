import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/services/auth";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await forgotPassword(email);
      setStatus(response.message || "Un nouveau mot de passe vous a été envoyé.");
      setGeneratedPassword(response.data?.password || "");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Impossible d'envoyer le mail."
      );
      setGeneratedPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">GeTime</p>
          <h1 className="text-2xl font-black text-foreground">Mot de passe oublié</h1>
          <p className="text-sm text-muted-foreground">
            Renseigne ton adresse email liée à ton compte. Nous t'enverrons un nouveau mot de passe temporaire.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="inline-block mr-2 h-4 w-4" />
            {error}
          </div>
        )}
        {status && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        )}
        {generatedPassword && (
          <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary font-semibold">
            mot_de_passe: {generatedPassword}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Adresse email</label>
            <input
              className="w-full rounded-xl border border-border bg-input px-3 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              type="email"
              placeholder="email@universite.cm"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-full bg-primary text-primary-foreground font-bold" disabled={loading}>
            {loading ? "Envoi en cours..." : "Recevoir un mot de passe"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Revenir à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
