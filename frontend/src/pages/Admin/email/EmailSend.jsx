import React, { useEffect, useMemo, useState } from "react";
import { Mail, Send, Users, X, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emailService } from "@/services/emailService";

export default function EmailSend() {
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [loadingList, setLoadingList] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const isInbox = activeTab === "inbox";
  const isUnread = activeTab === "unread";
  const baseMessages = isUnread ? inboxMessages.filter((item) => item.unread) : (isInbox ? inboxMessages : sentMessages);
  const filteredMessages = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return baseMessages;
    return baseMessages.filter((item) => {
      const name = isInbox ? item.from : item.to;
      return name.toLowerCase().includes(term) || item.subject.toLowerCase().includes(term);
    });
  }, [baseMessages, isInbox, searchTerm]);

  const showNotify = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 4000);
  };

  const normalizeEmail = (item) => {
    const direction = item.direction || "sent";
    return {
      id: item.id,
      from: item.from_address || "Inconnu",
      to: item.to_address || "—",
      subject: item.subject || "Sans objet",
      message: item.message || "",
      time: new Date(item.created_at).toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      unread: direction === "inbox" ? Boolean(item.meta?.unread) : false,
    };
  };

  const markEmailRead = async (email) => {
    if (!email || email.direction !== "inbox" || !email.unread) return;
    try {
      await emailService.markRead(email.id);
      setInboxMessages((prev) =>
        prev.map((item) => (item.id === email.id ? { ...item, unread: false } : item))
      );
      setSelectedEmail((prev) => (prev && prev.id === email.id ? { ...prev, unread: false } : prev));
    } catch {
      showNotify("Impossible de marquer l'email comme lu.", "error");
    }
  };

  const loadEmails = async (shouldSync = true) => {
    let syncFailed = false;
    try {
      setLoadingList(true);
      if (shouldSync) {
        try {
          await emailService.sync();
        } catch {
          syncFailed = true;
        }
      }
      const [inbox, sent] = await Promise.all([emailService.list("inbox"), emailService.list("sent")]);
      setInboxMessages(inbox.map(normalizeEmail));
      setSentMessages(sent.map(normalizeEmail));
      if (syncFailed) {
        showNotify("Synchronisation impossible, affichage des emails locaux.", "error");
      }
    } catch {
      showNotify("Impossible de charger les emails.", "error");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await loadEmails(true);
    setSyncing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!recipients.trim() || !subject.trim() || !message.trim()) {
      showNotify("Veuillez remplir tous les champs.", "error");
      return;
    }
    setSending(true);
    try {
      const recipientList = recipients
        .split(",")
        .map((email) => email.trim())
        .filter(Boolean);
      await emailService.send({
        to: recipientList,
        subject,
        message,
      });
      showNotify("Email envoyé avec succès.", "success");
      await loadEmails();
      setSubject("");
      setMessage("");
    } catch {
      showNotify("Erreur lors de l'envoi de l'email.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/80 rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Envoyer un email</h1>
            <p className="text-muted-foreground text-xs md:text-sm font-medium">Communication ciblée vers les utilisateurs</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSync}
            disabled={syncing || loadingList}
            className="bg-card border border-border/60 text-foreground/80 hover:bg-muted rounded-full px-4 py-2 h-auto text-xs font-bold gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Synchronisation..." : "Synchroniser"}
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-bold text-foreground/80">
            <Users className="w-4 h-4" />
            Gestion des destinataires
          </div>
        </div>
      </div>

      {notification.show && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-bottom-10 ${
          notification.type === "error" ? "bg-delta-negative/10 border-delta-negative/20 text-delta-negative" : "bg-delta-positive/10 border-delta-positive/20 text-delta-positive"
        }`}>
          {notification.type === "error" ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <p className="text-sm font-bold">{notification.message}</p>
          <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={handleSubmit} className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/60 bg-muted/40">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                  Destinataires
                </label>
                <input
                  type="text"
                  value={recipients}
                  onChange={(event) => setRecipients(event.target.value)}
                  placeholder="email1@exemple.com, email2@exemple.com"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
                  Objet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Sujet de l'email"
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-card text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 ml-1">
              Message
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ecrivez votre message..."
              className="mt-2 w-full px-4 py-3 rounded-2xl border border-border bg-card text-sm focus:ring-4 focus:ring-muted/40 outline-none transition-all resize-none"
            />
          </div>
          <div className="p-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-card">
            <p className="text-xs text-muted-foreground">
              Astuce: vous pouvez coller plusieurs emails séparés par des virgules.
            </p>
            <Button
              type="submit"
              disabled={sending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-6 h-auto shadow-md gap-2 font-bold"
            >
              <Send className="w-4 h-4" />
              {sending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </form>

        <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/60 bg-muted/40 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Boite de reception</p>
              <h2 className="text-lg font-black text-foreground">Derniers messages</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Rechercher..."
                  className="w-40 sm:w-48 px-3 py-2 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground focus:ring-4 focus:ring-muted/40 outline-none"
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {filteredMessages.length} message{filteredMessages.length > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setActiveTab("inbox")}
                  className={`rounded-full px-3 py-1 transition ${
                    activeTab === "inbox" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/60"
                  }`}
                >
                  Boite de reception
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`rounded-full px-3 py-1 transition ${
                    activeTab === "unread" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/60"
                  }`}
                >
                  Non lus
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sent")}
                  className={`rounded-full px-3 py-1 transition ${
                    activeTab === "sent" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/60"
                  }`}
                >
                  Envoyes
                </button>
              </div>
            </div>
          </div>
          {activeTab === "inbox" || activeTab === "unread" ? (
            <>
              {loadingList ? (
                <div className="p-6 text-sm text-muted-foreground/80">Chargement...</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {filteredMessages.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground/80">
                      {activeTab === "unread" ? "Aucun email non lu." : "Aucun email reçu."}
                    </div>
                  ) : (
                    filteredMessages.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          const selected = { ...item, direction: "inbox" };
                          setSelectedEmail(selected);
                          markEmailRead(selected);
                        }}
                        className="w-full text-left p-5 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{item.from}</p>
                            {item.unread && (
                              <span className="text-[10px] font-black uppercase tracking-widest bg-muted text-foreground/80 px-2 py-0.5 rounded-full">
                                Non lu
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-semibold text-muted-foreground/80">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.subject}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
              <div className="p-5 border-t border-border/60 text-xs text-muted-foreground">
                Boite de reception en lecture seule. Ajoutez un webhook pour les emails entrants.
              </div>
            </>
          ) : (
            <>
              {loadingList ? (
                <div className="p-6 text-sm text-muted-foreground/80">Chargement...</div>
              ) : (
                <div className="divide-y divide-border/60">
                  {filteredMessages.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground/80">Aucun email envoyé.</div>
                  ) : (
                    filteredMessages.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setSelectedEmail({ ...item, direction: "sent" })}
                        className="w-full text-left p-5 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-foreground">A: {item.to}</p>
                          <span className="text-[11px] font-semibold text-muted-foreground/80">{item.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{item.subject}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
              <div className="p-5 border-t border-border/60 text-xs text-muted-foreground">
                Liste des emails envoyes depuis GeTime.
              </div>
            </>
          )}
        </div>
      </div>

      {selectedEmail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-foreground/40">
          <div className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">
                  {selectedEmail.direction === "inbox" ? "Email reçu" : "Email envoyé"}
                </p>
                <h3 className="text-lg font-black text-foreground">{selectedEmail.subject}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmail(null)}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground/80">
                  {selectedEmail.direction === "inbox" ? `De: ${selectedEmail.from}` : `A: ${selectedEmail.to}`}
                </span>
                <span>{selectedEmail.time}</span>
              </div>
              <div className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                {selectedEmail.message || "Aucun contenu disponible."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
