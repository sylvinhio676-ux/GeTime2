import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CalendarClock, Sparkles, ShieldCheck, LineChart, 
  CheckCircle2, ArrowRight, Zap, GraduationCap, 
  Building2, Users, CalendarDays,
  Globe, LayoutDashboard, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import getimeLogo from "@/assets/getime-logo.svg";
import landingScreen1 from "@/assets/landing-screen-1.svg";
import landingScreen2 from "@/assets/landing-screen-2.svg";
import landingScreen3 from "@/assets/landing-screen-3.svg";

export default function Landing() {
  const { user, loading } = useAuth();
  const primaryCta = useMemo(() => 
    !loading && user ? { label: "Tableau de bord", to: "/dashboard" } : { label: "Commencer l'aventure", to: "/login" }
  , [user, loading]);

  const statSlides = [
    { title: "Conflits évités", value: "100%", subtitle: "Arbitrage automatique des horaires" },
    { title: "Temps économisé", value: "12h/sem", subtitle: "Moins d'allers-retours administratifs" },
    { title: "Salles optimisées", value: "+45%", subtitle: "Taux d'occupation maîtrisé" },
    { title: "Validation rapide", value: "96%", subtitle: "Planning validé en quelques minutes" },
  ];
  const [activeStat, setActiveStat] = useState(0);
  const heroSlides = [
    { src: landingScreen1, label: "Vue planning & ressources" },
    { src: landingScreen2, label: "Pilotage des salles" },
    { src: landingScreen3, label: "Suivi des disponibilités" },
  ];
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStat((prev) => (prev + 1) % statSlides.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [statSlides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHero((prev) => (prev + 1) % heroSlides.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-[#F7F7F5] text-slate-900 selection:bg-blue-500/20 overflow-x-hidden font-sans landing-grain">
      
      {/* BACKGROUND ORB ANIMATION */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[700px] h-[700px] bg-blue-300/40 blur-[160px] rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -70, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute top-[18%] -right-[10%] w-[600px] h-[600px] bg-slate-300/50 blur-[140px] rounded-full" 
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 40%), repeating-linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 60px)",
          }}
        />
      </div>

      {/* NAV BAR PREMIMUM */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-[0_8px_18px_rgba(30,58,138,0.2)] border border-slate-200/60">
              <img src={getimeLogo} alt="GeTime" className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic text-slate-900">GeTime<span className="text-blue-700">.</span></span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {[
              { label: "Plateforme", href: "#platform" },
              { label: "Workflow", href: "#workflow" },
              { label: "Chiffres", href: "#numbers" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="hover:text-slate-900 transition-colors relative group">
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-700 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button asChild className="rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-all px-8 font-bold">
              <Link to={primaryCta.to}>{primaryCta.label}</Link>
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="relative pt-32">
        
        {/* HERO SECTION ULTRA-MODERNE */}
        <section className="px-6 mx-auto max-w-7xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold uppercase tracking-[0.2em] text-blue-700 mb-8 landing-sheen"
          >
            <Sparkles className="h-4 w-4" /> Nouvelle Ère Académique
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-[1000] tracking-tight mb-8 leading-[0.9] text-slate-900"
          >
            Orchestrez votre <br />
            <span className="bg-gradient-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent italic">Campus.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-12"
          >
            GeTime est le système d'exploitation logistique qui synchronise les ressources, les flux et les humains en temps réel.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-6"
          >
            <Button asChild size="lg" className="h-16 px-10 rounded-full bg-blue-700 hover:bg-blue-800 text-lg font-bold shadow-[0_10px_30px_rgba(30,58,138,0.25)]">
              <Link to={primaryCta.to}>Lancer le Dashboard <ArrowRight className="ml-2" /></Link>
            </Button>
            <div className="flex items-center gap-4 px-6 py-4 rounded-full border border-slate-200 bg-white landing-sheen">
              <div className="flex -space-x-3">
                {[1,2,3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200" />)}
              </div>
              <span className="text-sm font-bold text-slate-600">+2.4k utilisateurs actifs</span>
            </div>
          </motion.div>
          <div className="mt-12 mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-xl">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeHero * 100}%)` }}
              >
                {heroSlides.map((slide) => (
                  <div key={slide.label} className="min-w-full p-4 sm:p-6">
                    <div className="relative">
                      <img
                        src={slide.src}
                        alt={slide.label}
                        className="w-full rounded-2xl border border-slate-200 bg-white"
                        loading="lazy"
                      />
                      <span className="absolute left-6 top-6 rounded-full bg-blue-700 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                        {slide.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.label}
                    type="button"
                    onClick={() => setActiveHero(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${activeHero === index ? "bg-blue-700" : "bg-slate-300"}`}
                    aria-label={`Aller à ${slide.label}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID DE FONCTIONNALITÉS */}
        <section id="platform" className="px-6 py-32 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bento Large */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 h-[400px] rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-blue-100 via-white to-white p-10 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <LayoutDashboard className="h-12 w-12 text-blue-700 mb-6" />
                <h3 className="text-3xl font-black mb-4 text-slate-900">Interface Cognitive</h3>
                <p className="max-w-sm text-slate-600 italic font-medium">Visualisez l'occupation de votre campus d'un simple coup d'œil. Filtres intelligents par filière, salle et disponibilité prof.</p>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] bg-blue-200/40 border border-white rounded-2xl transform rotate-6 transition-transform group-hover:rotate-3 p-4">
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => <div key={i} className="h-4 w-full bg-white/70 rounded-full" />)}
                  </div>
              </div>
            </motion.div>

            {/* Bento Small */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="h-[400px] rounded-[2.5rem] border border-slate-200 bg-white p-10 flex flex-col justify-between"
            >
              <ShieldCheck className="h-12 w-12 text-emerald-600" />
              <div>
                <h3 className="text-2xl font-black mb-2 text-slate-900">Sécurité Militaire</h3>
                <p className="text-slate-600 text-sm italic">Permissions granulaires par rôle (Admin, Programmeur, Enseignant).</p>
              </div>
            </motion.div>

            {/* Bento Row 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="h-[300px] rounded-[2.5rem] border border-slate-200 bg-white p-8"
            >
              <Database className="h-10 w-10 text-blue-700 mb-6" />
              <h3 className="text-xl font-bold mb-2 text-slate-900">Data Analytics</h3>
              <p className="text-slate-600 text-sm italic">Exportez des rapports de charge horaire en un clic.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 h-[300px] rounded-[2.5rem] border border-slate-200 bg-gradient-to-l from-emerald-100/70 to-white p-10 flex items-center justify-between"
            >
              <div>
                <h3 className="text-3xl font-black mb-2 italic text-emerald-600">99.9%</h3>
                <p className="text-slate-900 font-bold">Disponibilité garantie</p>
                <p className="text-slate-600 text-sm italic">Architecture distribuée pour une fluidité sans faille.</p>
              </div>
              <Globe className="h-32 w-32 text-emerald-300/50 animate-pulse" />
            </motion.div>
          </div>
        </section>

        {/* SECTION NUMÉRIQUE IMMERSIVE */}
        <section id="numbers" className="bg-gradient-to-r from-blue-700 to-blue-800 py-24 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-blue-100/80">Chiffres</p>
                <h2 className="mt-3 text-4xl md:text-5xl font-black text-white">Impact mesurable.</h2>
                <p className="mt-3 text-blue-100/80 max-w-md">
                  Des métriques opérationnelles qui prouvent la valeur de GeTime.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveStat((prev) => (prev - 1 + statSlides.length) % statSlides.length)}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStat((prev) => (prev + 1) % statSlides.length)}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
                >
                  Suivant
                </button>
              </div>
            </div>
            <div className="mt-12 overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 backdrop-blur">
              <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeStat * 100}%)` }}>
                {statSlides.map((slide) => (
                  <div key={slide.title} className="min-w-full px-10 py-12">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-100/80">{slide.title}</p>
                    <p className="mt-4 text-6xl md:text-7xl font-black text-white">{slide.value}</p>
                    <p className="mt-4 text-base text-blue-100/90">{slide.subtitle}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-10 pb-8">
                {statSlides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setActiveStat(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${activeStat === index ? "bg-white" : "bg-white/40"}`}
                    aria-label={`Aller à ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-40 -right-20 h-[420px] w-[420px] rounded-full bg-white/10 blur-[140px]" />
            <div className="absolute bottom-0 left-10 h-[240px] w-[240px] rounded-full bg-white/10 blur-[120px]" />
          </div>
        </section>

        {/* USE CASES */}
        <section id="use-cases" className="px-6 py-24 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Cas d'usage</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">Un parcours clair pour chaque rôle.</h2>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Des vues et des actions ciblées pour agir vite, sans surcharge d'information.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Administrateur",
                points: ["Vision globale des ressources", "Suivi des conflits en temps réel", "Gestion des accès par rôle"],
              },
              {
                title: "Programmeur",
                points: ["Planification rapide des séances", "Allocation intelligente des salles", "Validation des horaires"],
              },
              {
                title: "Enseignant",
                points: ["Emploi du temps personnalisé", "Disponibilités centralisées", "Notifications ciblées"],
              },
            ].map((role) => (
              <div key={role.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black text-slate-900">{role.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {role.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-700" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="px-6 pb-24 mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Témoignages</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Ils gagnent du temps chaque semaine.</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                <Sparkles className="h-4 w-4" />
                Satisfaction élevée
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { name: "Direction pédagogique", role: "Université privée", quote: "GeTime a réduit les conflits de planning de plus de 80%." },
                { name: "Responsable scolarité", role: "Institut supérieur", quote: "La validation des emplois du temps est désormais instantanée." },
                { name: "Enseignant", role: "École d’ingénieurs", quote: "Je retrouve mes informations clés sans chercher partout." },
              ].map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
                  <p className="text-sm text-slate-700 italic">“{item.quote}”</p>
                  <div className="mt-4">
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARTNERS */}
        <section id="partners" className="px-6 pb-24 mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Partenaires</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Institutions qui nous font confiance</h2>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Ajoutez vos logos officiels ici lorsque disponibles.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {["Université Alpha", "Institut Nova", "Campus Horizon", "École Atlas"].map((partner) => (
                <div key={partner} className="h-16 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-center text-sm font-semibold text-slate-600">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ONBOARDING */}
        <section id="onboarding" className="px-6 pb-24 mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Onboarding</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Déployez en quelques étapes.</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                <CalendarDays className="h-4 w-4" />
                Mise en place rapide
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { title: "Importer", desc: "Ressources, filières et emplois du temps existants." },
                { title: "Configurer", desc: "Rôles, permissions, règles métiers et validations." },
                { title: "Lancer", desc: "Planning opérationnel pour tous les profils." },
              ].map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-slate-200 bg-white/90 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Étape {index + 1}</p>
                  <h3 className="mt-3 text-lg font-black text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section id="security" className="px-6 pb-24 mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">Sécurité</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Conformité et contrôle.</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Accès protégé
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                { title: "Rôles & permissions", desc: "Accès strictement limité par profil utilisateur." },
                { title: "Traçabilité", desc: "Historique des actions et des validations." },
                { title: "Sauvegardes", desc: "Sécurité et disponibilité des données." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                  <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 pb-24 mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">FAQ</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Questions fréquentes</h2>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Une réponse rapide aux questions clés sur GeTime.
              </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                { q: "Combien de temps pour démarrer ?", a: "Quelques heures suffisent pour importer et configurer." },
                { q: "Comment sont gérés les accès ?", a: "Par rôles et permissions, avec contrôle fin." },
                { q: "Peut-on exporter les données ?", a: "Oui, rapports et exports sont disponibles." },
                { q: "Y a-t-il un support ?", a: "Support technique et assistance au déploiement." },
              ].map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                  <h3 className="text-sm font-bold text-slate-900">{item.q}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA BOX */}
        <section className="py-40 px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-5xl rounded-[4rem] bg-gradient-to-b from-blue-900 to-slate-900 p-20 text-center border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 italic">Prêt à transformer <br /> votre institution ?</h2>
            <Button asChild size="lg" className="h-16 px-12 rounded-full bg-white text-slate-900 hover:bg-blue-200 transition-all text-xl font-black">
              <Link to="/login">Ouvrir GeTime gratuitement</Link>
            </Button>
          </motion.div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-slate-200 text-center text-slate-500 text-sm font-medium italic">
        <p>© {new Date().getFullYear()} GeTime Intelligence System. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
