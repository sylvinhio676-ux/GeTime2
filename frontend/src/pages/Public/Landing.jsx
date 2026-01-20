import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  DoorClosed,
  Users,
  BellRing,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/useAuth";

import getimeLogo from "@/assets/getime-logo.svg";
// Mets une vraie image “dashboard / planning” ici (png/jpg/svg)
import heroImg from "@/assets/landing-screen-1.svg"; 

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  const { user, loading } = useAuth();

  const cta = !loading && user
    ? { label: "Tableau de bord", to: "/dashboard" }
    : { label: "Se connecter", to: "/login" };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVBAR (comme ton image) */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a className="hover:text-foreground" href="#features">Fonctionnalités</a>
            <a className="hover:text-foreground" href="#why">Pourquoi GeTime2</a>
            <a className="hover:text-foreground" href="#contact">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            {!loading && !user && (
              <Link to="/login" className="hidden sm:inline text-sm font-semibold text-muted-foreground hover:text-foreground">
                Connexion
              </Link>
            )}
            <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6">
              <Link to={cta.to}>
                {cta.label} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO (même structure que l’image) */}
      <main>
        <section className="mx-auto max-w-7xl px-6 pt-14 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2"
              >
                <LayoutDashboard className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-muted-foreground">
                  Plateforme de planification universitaire
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]"
              >
                Simplifiez la gestion des{" "}
                <span className="text-primary">emplois du temps</span>{" "}
                et des ressources du campus.
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
                GeTime2 centralise les <b>salles</b>, <b>enseignants</b>, <b>spécialités</b> et <b>programmations</b>,
                réduit les conflits d’horaires et accélère la publication des plannings.
              </motion.p>

              <motion.div variants={fadeUp} className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-7">
                  <Link to={cta.to}>
                    Démarrer <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-border px-7">
                  <a href="#features">Voir les fonctionnalités</a>
                </Button>
              </motion.div>

              {/* Mini checklist (comme souvent sur ce type de landing) */}
              <motion.div variants={fadeUp} className="mt-6 grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-delta-positive" />
                  Moins de conflits (salle/enseignant)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-delta-positive" />
                  Publication rapide par semaine
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-delta-positive" />
                  Disponibilités enseignants centralisées
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-delta-positive" />
                  Notifications (push) automatiques
                </div>
              </motion.div>
            </motion.div>

            {/* Right image card (comme ton exemple) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              {/* halo doux */}
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/10 blur-2xl" />

              <div className="rounded-[1.8rem] border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
                    <img
                      src={heroImg}
                      alt="Aperçu GeTime2"
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>

                  {/* petit bandeau sous l’image */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <MiniKpi title="Salles" value="Occupation" />
                    <MiniKpi title="Professeurs" value="Disponibilité" />
                    <MiniKpi title="Planning" value="Hebdomadaire" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Row stats/logos comme ton image */}
          <div className="mt-10 rounded-2xl border border-border bg-card px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
              <Stat value="15+" label="Modèles métier" />
              <Stat value="70/70" label="Tests API validés" />
              <Stat value="Temps réel" label="Notifications & suivi" />
              <Stat value="Multi-campus" label="Structure académique" />
            </div>
          </div>
        </section>

        {/* FEATURES cards (style “Why …” comme ton image) */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-14">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
              Fonctionnalités
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
              Une plateforme pensée pour l’administration académique.
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Des vues simples, des règles claires, des actions rapides — pour programmeurs, enseignants et responsables.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={CalendarDays}
              title="Planification & publication"
              desc="Créer les séances, valider puis publier par semaine/spécialité."
            />
            <FeatureCard
              icon={DoorClosed}
              title="Salles & occupation"
              desc="Capacité, disponibilité, conflits de réservation et types de salles."
            />
            <FeatureCard
              icon={Users}
              title="Enseignants"
              desc="Gestion des enseignants, disponibilités et charge horaire."
            />
            <FeatureCard
              icon={BellRing}
              title="Push notifications"
              desc="Disponibilités → programmeur concerné, publication → enseignants concernés."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Rôles & permissions"
              desc="Admin, programmeur, enseignant — accès et actions contrôlés."
            />
            <FeatureCard
              icon={LayoutDashboard}
              title="Dashboard"
              desc="Vue globale : filtres, planning, salles, disponibilité, alertes."
            />
          </div>
        </section>

        {/* WHY section (optionnelle) */}
        <section id="why" className="mx-auto max-w-7xl px-6 pb-16">
          <div className="rounded-[1.8rem] border border-border bg-card p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Pourquoi GeTime2
                </p>
                <h3 className="mt-2 text-xl md:text-2xl font-extrabold">
                  Moins d’allers-retours, plus de contrôle.
                </h3>
              </div>
              <p className="text-sm text-muted-foreground max-w-xl">
                Une architecture claire (Laravel API + React UI) pour une adoption rapide par les équipes.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <WhyItem
                title="Réduction des conflits"
                desc="Vérifiez salle/enseignant/heure avant publication."
              />
              <WhyItem
                title="Gain de temps"
                desc="Centralisation des données & workflow de validation."
              />
              <WhyItem
                title="Traçabilité"
                desc="Historique des changements & responsabilités claires."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-[2rem] border border-border bg-primary text-primary-foreground p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Prêt à déployer GeTime2 dans votre établissement ?
                </h2>
                <p className="mt-2 text-primary-foreground/85">
                  Démarrez avec votre équipe : admin, programmeurs et enseignants.
                </p>
              </div>
              <Button asChild size="lg" className="h-12 rounded-full bg-card text-foreground hover:bg-card/90 px-7">
                <Link to={cta.to}>
                  Commencer <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <footer className="mt-10 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} GeTime2 — Gestion académique & planification.
          </footer>
        </section>
      </main>
    </div>
  );
}

/* ---------- components ---------- */

function Stat({ value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
        <span className="text-primary font-extrabold">●</span>
      </div>
      <div>
        <div className="text-lg font-extrabold">{value}</div>
        <div className="text-xs text-muted-foreground font-semibold">{label}</div>
      </div>
    </div>
  );
}

function MiniKpi({ title, value }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <div className="text-sm font-extrabold">{value}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-[1.6rem] border border-border bg-card p-6 hover:shadow-sm transition">
      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center border border-border">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h4 className="mt-4 text-lg font-extrabold">{title}</h4>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function WhyItem({ title, desc }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="text-base font-extrabold">{title}</div>
      <div className="mt-2 text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}
