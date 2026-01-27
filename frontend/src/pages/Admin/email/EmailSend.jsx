import React, { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Mail, Send, Users, X, AlertCircle, CheckCircle2, RefreshCw, 
  FileText, Archive, Star, Reply, BarChart3, Wifi, WifiOff, 
  Plus, Trash2, Paperclip, Clock, Search, 
  Badge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { emailService } from "@/services/emailService";
import { userService } from "@/services/userService";
import { notificationService } from "@/services/notificationService";
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, ResponsiveContainer, Cell } from 'recharts';

// --- COMPOSANTS INTERNES POUR LA CLARTÉ ---
const StatusBadge = ({ type, children }) => (
  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
    type === 'unread' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
  }`}>
    {children}
  </span>
);

export default function EmailSend() {
  // States groupés par domaine
  const [form, setForm] = useState({ recipients: "", subject: "", message: "", scheduledDate: "", sendNotification: false });
  const [ui, setUi] = useState({ activeTab: "inbox", searchTerm: "", showStats: false, sending: false, loading: true, syncing: false });
  const [data, setData] = useState({ inbox: [], sent: [], archived: [], important: [], templates: [], attachments: [], stats: {} });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const showNotify = useCallback((message, type = "success") => {
    // Intégrer ici votre système de Toast global si disponible
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  }, []);

  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // --- LOGIQUE DE FILTRAGE ---
  const baseMessages = useMemo(() => {
    switch (ui.activeTab) {
      case "unread": return data.inbox.filter(m => m.unread);
      case "archived": return data.archived;
      case "important": return data.important;
      case "sent": return data.sent;
      default: return data.inbox;
    }
  }, [ui.activeTab, data]);

  const filteredMessages = useMemo(() => {
    const term = ui.searchTerm.toLowerCase();
    return baseMessages.filter(m => {
      const subject = m.subject?.toLowerCase() || "";
      const sender = (m.from || m.to || "").toLowerCase();
      return subject.includes(term) || sender.includes(term);
    });
  }, [baseMessages, ui.searchTerm]);

  // --- ACTIONS ---
  const loadAllData = useCallback(async (sync = false) => {
    setUi(prev => ({ ...prev, loading: true }));
    try {
      if (sync) await emailService.sync();
      const templatesPromise = typeof emailService.getTemplates === "function"
        ? emailService.getTemplates()
        : Promise.resolve([]);
      const statsPromise = typeof emailService.getStats === "function"
        ? emailService.getStats()
        : Promise.resolve({});
      const [inbox, sent, archived, important, templates, stats] = await Promise.all([
        emailService.list("inbox"), emailService.list("sent"), 
        emailService.list("archived"), emailService.list("important"),
        templatesPromise, statsPromise
      ]);
      
      const normalize = (list) => list.map(item => {
        const from = item.from_address ?? item.from_email ?? item.from;
        const to = item.to_address ?? item.to_email ?? item.to;
        return {
          ...item,
          from,
          to,
          time: new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
          unread: item.direction === "inbox" ? Boolean(item.meta?.unread) : false
        };
      });

      setData(prev => ({ 
        ...prev, 
        inbox: normalize(inbox), sent: normalize(sent), 
        archived: normalize(archived), important: normalize(important),
        templates: templates || [], stats: stats || {}
      }));
    } catch (err) {
      showNotify("Erreur de synchronisation", "error");
    } finally {
      setUi(prev => ({ ...prev, loading: false, syncing: false }));
    }
  }, [showNotify]);

  useEffect(() => {
    loadAllData();
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, [loadAllData]);

  const handleSend = async (e) => {
    e.preventDefault();
    setUi(prev => ({ ...prev, sending: true }));
    try {
      const payload = {
        to: form.recipients.split(",").map(e => e.trim()),
        subject: form.subject,
        message: form.message,
        scheduled_at: form.scheduledDate || null
      };
      await emailService.send(payload);
      showNotify("Message envoyé !");
      setForm({ recipients: "", subject: "", message: "", scheduledDate: "", sendNotification: false });
      loadAllData();
    } catch {
      showNotify("Échec de l'envoi", "error");
    } finally {
      setUi(prev => ({ ...prev, sending: false }));
    }
  };

  return (
    <div className="p-3 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* HEADER RESPONSIVE */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card p-6 rounded-[2.5rem] border border-border shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-inner">
            <Mail className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
              Centre de Messagerie
              {!isOnline && <Badge variant="destructive" className="animate-pulse"><WifiOff className="w-3 h-3 mr-1"/> Hors-ligne</Badge>}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">Gérez vos communications sortantes et entrantes</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setUi(p => ({...p, showStats: !p.showStats}))} className="rounded-xl font-bold">
            <BarChart3 className="w-4 h-4 mr-2" /> Stats
          </Button>
          <Button variant="outline" size="sm" onClick={() => loadAllData(true)} disabled={ui.syncing} className="rounded-xl font-bold">
            <RefreshCw className={`w-4 h-4 mr-2 ${ui.syncing ? 'animate-spin' : ''}`} /> Sync
          </Button>
        </div>
      </header>

      {/* STATS SECTION (IMAGE PLACEHOLDER) */}
      {ui.showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-5">
          <div className="md:col-span-2 bg-card p-6 rounded-[2rem] border border-border h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(data.stats).map(([name, value]) => ({ name, value }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-primary p-8 rounded-[2rem] text-primary-foreground flex flex-col justify-center">
             <p className="text-primary-foreground/60 uppercase text-[10px] font-black tracking-[0.2em]">Total Envoyés</p>
             <h3 className="text-5xl font-black mt-2">{data.sent.length}</h3>
             <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm font-medium opacity-80 italic">"La communication est la clé du succès collectif."</p>
             </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* FORMULAIRE DE RÉDACTION */}
        <section className="bg-card rounded-[2.5rem] border border-border shadow-sm flex flex-col">
          <div className="p-8 border-b border-border/50 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Nouveau Message</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Destinataire(s)</label>
                <div className="relative group">
                   <input 
                    className="w-full pl-4 pr-12 py-3 bg-muted/30 border-none rounded-2xl focus:ring-2 ring-primary/20 outline-none transition-all text-sm"
                    placeholder="exemple@mail.com..."
                    value={form.recipients}
                    onChange={e => setForm({...form, recipients: e.target.value})}
                   />
                   <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1">Objet</label>
                <input 
                  className="w-full px-4 py-3 bg-muted/30 border-none rounded-2xl focus:ring-2 ring-primary/20 outline-none transition-all text-sm"
                  placeholder="Sujet du message"
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1 italic flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Planification (Optionnel)
                  </label>
                  <input 
                    type="datetime-local"
                    className="w-full px-4 py-3 bg-muted/30 border-none rounded-2xl text-sm outline-none"
                    value={form.scheduledDate}
                    onChange={e => setForm({...form, scheduledDate: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground ml-1 flex items-center gap-1">
                    <Paperclip className="w-3 h-3" /> Pièces jointes
                  </label>
                  <div className="flex items-center justify-center w-full h-[46px] bg-muted/30 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-colors cursor-pointer text-xs font-bold text-muted-foreground">
                     Glisser ou cliquer ici
                  </div>
               </div>
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col">
            <textarea 
              className="flex-1 w-full p-4 bg-muted/20 border-none rounded-[1.5rem] text-sm focus:ring-0 outline-none resize-none min-h-[200px]"
              placeholder="Rédigez votre contenu ici..."
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
            />
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full">
                <input 
                  type="checkbox" 
                  id="notif" 
                  className="rounded-sm accent-primary" 
                  checked={form.sendNotification} 
                  onChange={e => setForm({...form, sendNotification: e.target.checked})}
                />
                <label htmlFor="notif" className="text-xs font-bold cursor-pointer">Notification In-App</label>
              </div>
              <Button 
                onClick={handleSend}
                disabled={ui.sending}
                className="rounded-2xl px-8 py-6 bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
              >
                {ui.sending ? <RefreshCw className="animate-spin w-5 h-5"/> : <Send className="w-5 h-5"/>}
                {form.scheduledDate ? "Programmer" : "Envoyer"}
              </Button>
            </div>
          </div>
        </section>

        {/* LISTE DES MESSAGES */}
        <section className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-full max-h-[850px]">
          <div className="p-6 bg-muted/30 border-b border-border/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black uppercase tracking-widest text-sm italic">Explorateur</h2>
              <div className="flex bg-card p-1 rounded-xl border border-border/50">
                {['inbox', 'sent', 'archived'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setUi({...ui, activeTab: tab})}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${ui.activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                className="w-full pl-11 pr-4 py-3 bg-card border border-border/50 rounded-2xl text-xs font-medium outline-none focus:ring-2 ring-primary/10 transition-all"
                placeholder="Filtrer par sujet ou nom..."
                value={ui.searchTerm}
                onChange={e => setUi({...ui, searchTerm: e.target.value})}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {ui.loading ? (
              <div className="p-20 text-center space-y-4">
                 <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary/40" />
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chargement sécurisé...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-20 text-center opacity-40">
                <Archive className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sm font-bold">Aucun message trouvé</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredMessages.map(email => (
                  <div 
                    key={email.id} 
                    onClick={() => setSelectedEmail(email)}
                    className="p-5 hover:bg-muted/40 cursor-pointer transition-colors group relative"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${email.unread ? 'bg-primary' : 'bg-transparent'}`} />
                        <p className={`text-sm ${email.unread ? 'font-black' : 'font-medium text-muted-foreground'}`}>
                          {ui.activeTab === 'sent' ? `À: ${email.to}` : email.from}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/60">{email.time}</span>
                    </div>
                    <h4 className={`text-xs mb-2 ${email.unread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{email.subject}</h4>
                    
                    <div className="flex items-center justify-between  transition-opacity">
                       <div className="flex gap-1">
                          <button className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"><Reply className="w-3.5 h-3.5"/></button>
                          <button className="p-1.5 hover:bg-yellow-500/10 rounded-lg text-yellow-600 transition-colors"><Star className="w-3.5 h-3.5"/></button>
                          <button className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                       </div>
                       {email.unread && <StatusBadge type="unread">Nouveau</StatusBadge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* MODAL DE LECTURE MODERNE */}
      {selectedEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-foreground/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-card w-full max-w-3xl rounded-[3rem] shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-muted/20 border-b border-border/50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                       {selectedEmail.from?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div>
                       <h3 className="text-xl font-black">{selectedEmail.subject}</h3>
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{selectedEmail.from}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedEmail(null)} className="p-3 hover:bg-muted rounded-full transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-10 text-sm leading-relaxed text-foreground/80 whitespace-pre-line max-h-[60vh] overflow-y-auto">
                 {selectedEmail.message}
              </div>
              <div className="p-8 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                 <Button variant="outline" className="rounded-xl px-6 font-bold" onClick={() => { setSelectedEmail(null); setForm({...form, recipients: selectedEmail.from, subject: `Re: ${selectedEmail.subject}`}); }}>
                    <Reply className="w-4 h-4 mr-2" /> Répondre
                 </Button>
                 <Button className="rounded-xl px-6 font-bold bg-foreground text-background">Fermer</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
