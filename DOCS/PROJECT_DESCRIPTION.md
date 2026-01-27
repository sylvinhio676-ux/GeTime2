# GeTime2 - Description detaillee

## Vue d'ensemble
GeTime2 est une plateforme de planification et de pilotage logistique pour campus et
etablissements. Elle centralise les ressources (salles, enseignants, filieres),
automatise la programmation des cours et fournit un tableau de bord operationnel
pour reduire les conflits d'horaires et optimiser l'occupation.

## Tables metier (schema principal)
- `etablishments`: etablissements (nom, description, city).
- `campuses`: campus (campus_name, localisation, etablishment_id).
- `schools`: ecoles (school_name, description, responsible_user_id nullable).
- `sectors`: filieres/secteurs (sector_name, code, school_id).
- `specialties`: specialites (specialty_name, code nullable, description,
  number_student, sector_id, programmer_id, level_id nullable).
- `levels`: niveaux (name_level, specialty_id nullable).
- `years`: annees academiques (date_star, date_end).
- `teachers`: enseignants (registration_number, user_id).
- `subjects`: matieres (subject_name, hour_by_week, total_hour, type_subject,
  color nullable, teacher_id, specialty_id).
- `rooms`: salles (code, capacity, is_available, type_room, campus_id).
- `programmers`: planificateurs (registration_number unique, user_id,
  etablishment_id).
- `programmations`: seances planifiees (day, hour_star, hour_end, status,
  subject_id, programmer_id, year_id, room_id nullable).
- `disponibilities`: disponibilites (day, hour_star, hour_end, subject_id,
  etablishment_id nullable).
- `specialty_programmations`: pivot many-to-many entre `specialties` et
  `programmations`.

## Tables techniques / securite
- `users`: comptes (name, email, phone, password, email_verified_at,
  remember_token).
- `roles`, `permissions`, `model_has_roles`, `model_has_permissions`,
  `role_has_permissions` (Spatie permissions).
- `personal_access_tokens` (Sanctum).
- `password_reset_tokens`, `sessions` (auth/session).
- `notifications` (Laravel notifications).
- `emails` (journal d'envois d'emails).
- `audit_logs` (actions utilisateurs).
- `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs` (infra Laravel).

## Fonctionnalites existantes (implementees)
- Authentification token (Sanctum) + stockage localStorage cote frontend.
- CRUD complet API pour 15 modeles metier.
- Interface React pour:
  - Gestion des campus (liste, creation, edition, suppression, validation).
  - Gestion des enseignants (liste, creation, edition, suppression,
    selection d'utilisateur).
  - Navigation et etat connecte/deconnecte.
- UI/UX: etats de chargement, erreurs, confirmations, tables responsive,
  notifications de succes.

## Fonctionnalites mises en avant (vision produit)
- Orchestration du planning et des ressources en temps reel.
- Reduction des conflits d'horaires et validation rapide des plannings.
- Optimisation de l'occupation des salles et visibilite globale.

📋 Analyse Complète du Projet GeTime2
🎯 Vue d'Ensemble
GeTime2 est un système de gestion d'emploi du temps universitaire complet et moderne, développé avec une architecture Laravel (Backend) + React (Frontend). Le système permet de gérer l'ensemble du processus de planification académique : des matières aux salles, en passant par les enseignants et les programmations, avec un système avancé de gestion des quotas horaires.

🏗️ Architecture Générale
Backend (Laravel 11.x)
Framework : Laravel avec Sanctum pour l'authentification API
Base de données : MySQL avec migrations et seeders
Authentification : JWT via Sanctum + rôles/permissions (Spatie)
Architecture : MVC avec Services, Events, Notifications
API : RESTful avec versioning et middleware de sécurité
Frontend (React 18.x)
Framework : React avec Vite pour le build
UI : TailwindCSS + shadcn/ui components
Routing : React Router avec guards d'authentification
State : Context API + hooks personnalisés
HTTP : Axios avec interceptors
🔧 Modules Backend Détaillés
1. 👤 Module Utilisateurs & Authentification
Modèles : User, Teacher, Programmer
Contrôleurs : Auth\AuthController, UserController
Fonctionnalités :

Authentification multi-rôles (super_admin, admin, teacher, programmer)
Gestion des permissions granulaires
Tokens d'appareil pour notifications push
Profils enseignants et programmeurs
2. 🏫 Module Structure Académique
Modèles : School, Sector, Specialty, Level, Year, Campus, Location
Contrôleurs : SchoolController, SectorController, SpecialtyController, etc.
Fonctionnalités :

Hiérarchie complète : École → Secteurs → Spécialités → Niveaux → Années
Géolocalisation avec campus et salles
Gestion des capacités et types de salles
3. 📚 Module Matières & Enseignants
Modèles : Subject, Teacher
Contrôleurs : SubjectController, TeacherController
Fonctionnalités :

Définition des matières avec heures totales/hebdomadaires
Association enseignant-spécialité
Types de matières (cours, TD, TP)
Couleurs pour visualisation
4. 📅 Module Programmations
Modèles : Programmation, Disponibility, SpecialtyProgrammation
Contrôleurs : ProgrammationController, DisponibilityController
Services : DisponibilityConversionService, DisponibilityToProgrammationService
Fonctionnalités :

Création de créneaux horaires avec vérification de conflits
Conversion automatique des disponibilités en programmations
Publication hebdomadaire avec événements
Validation et statut de programmation
5. 🏛️ Module Salles & Ressources
Modèles : Room, Campus
Contrôleurs : RoomController, CampusController
Fonctionnalités :

Gestion des salles par campus
Types de salles (amphi, salle normale, labo)
Capacités et disponibilités
Association enseignant-salles favorites
6. 📊 Module Quotas & Statistiques
Modèles : SubjectQuota
Contrôleurs : QuotaController
Services : QuotaService
Fonctionnalités :

Quotas horaires par matière-enseignant
Suivi automatique des heures utilisées
Calculs temps réel des quotas restants
Statuts : en cours, terminé, non programmé
Alertes et blocages de programmation
7. 🔔 Module Notifications & Communication
Modèles : Notification, Email, DeviceToken
Contrôleurs : NotificationController, EmailController, DeviceTokenController
Services : FcmService
Fonctionnalités :

Notifications push (Firebase)
Système d'emails avec Mailtrap
Templates de notifications
Archivage et marquage lu/non lu
8. 📋 Module Audit & Traçabilité
Modèles : AuditLog
Contrôleurs : AuditLogController
Fonctionnalités :

Journalisation automatique de toutes les actions
Traçabilité complète des modifications
Middleware d'audit sur les routes API
9. 📍 Module Tracking & Analytics
Contrôleurs : TrackingController
Fonctionnalités :

Suivi des parcours utilisateurs
Analytics de navigation
Métriques d'utilisation
🎨 Modules Frontend Détaillés
1. 🔐 Module Authentification
Pages : Login, ForgotPassword
Services : auth.js
Fonctionnalités :

Connexion avec Sanctum
Récupération de mot de passe
Guards de route par rôles
2. 📊 Dashboard & Navigation
Pages : Dashboard
Composants : Sidebar, Navbar, NotificationBell
Layouts : DashboardLayouts
Fonctionnalités :

Dashboard responsive avec métriques
Navigation latérale adaptative
Indicateur de notifications temps réel
3. 👥 Gestion des Utilisateurs
Pages : UserList, TeacherList, ProgrammerList
Services : userService, teacherService, programmerService
Fonctionnalités :

CRUD complet des utilisateurs
Gestion des rôles et permissions
Profils détaillés avec associations
4. 🏫 Gestion Académique
Pages : SchoolList, SectorList, SpecialtyList, LevelList, YearList, CampusList, LocationList
Services : Correspondants
Fonctionnalités :

Interfaces CRUD pour chaque entité
Tables responsives avec recherche/filtrage
Modales de création/édition
Vues mobiles optimisées
5. 📚 Gestion des Matières
Pages : SubjectList
Services : subjectService, quotaService
Composants : QuotaProgress, QuotaAlert
Fonctionnalités :

Liste des matières avec quotas intégrés
Colonnes : nom, heures, quota utilisé/restant/statut
Filtres par statut de quota
Alertes visuelles pour quotas faibles
6. 📅 Gestion des Programmations
Pages : ProgrammationList, DisponibilityList, TableGris
Services : programmationService, disponibilityService
Fonctionnalités :

Vue calendrier (TableGris)
Liste des programmations avec filtres
Gestion des disponibilités
Conversion auto disponibilité→programmation
7. 🏛️ Gestion des Ressources
Pages : RoomList
Services : roomService
Fonctionnalités :

Gestion des salles par campus
Filtres par type/capacité
Association enseignant-salles
8. 📊 Module Quotas & Rapports
Pages : QuotaDashboard
Services : quotaService
Composants : QuotaProgress, QuotaAlert
Fonctionnalités :

Dashboard avec graphiques (Recharts)
Statistiques globales et par matière
Table détaillée avec statuts
Métriques temps réel
9. ⚙️ Module Paramètres
Pages : Settings
Fonctionnalités :

Configuration système
Gestion des préférences utilisateur
Thème sombre/clair
10. 📧 Module Communications
Pages : NotificationList, EmailSend, AuditLogList
Services : notificationService, emailService, auditLogService
Fonctionnalités :

Gestion des notifications
Envoi d'emails groupés
Journal d'audit complet
🔗 Interconnexions & Flux de Données
Flux de Programmation
Création de disponibilité → DisponibilityController::store()
Validation quota → QuotaService::isQuotaExceeded()
Conversion auto → DisponibilityConversionService
Création programmation → ProgrammationController::store()
Mise à jour quota → QuotaService::updateQuotaOnCreate()
Notification → Events + Firebase
Gestion des Quotas
Calcul automatique lors de chaque programmation
Blocage si quota dépassé
Statuts : not_programmed → in_progress → completed
Dashboard avec métriques temps réel
Authentification & Autorisation
Middleware auth:sanctum + role_or_permission
Guards frontend avec vérification rôles
Permissions granulaires par entité
🛠️ Services & Logique Métier
QuotaService
DisponibilityConversionService
Conversion disponibilité → programmation
Vérifications de conflits
Attribution automatique de salles
FcmService
Envoi notifications push
Gestion tokens d'appareil
Templates de messages
📱 Interfaces Utilisateur
Responsive Design
Breakpoints : sm: (640px), md: (768px), lg: (1024px)
Tables : Version desktop + mobile avec cartes
Modales : Adaptatives avec scroll sur mobile
Navigation : Sidebar repliable
UX Features
Loading states avec skeletons
Notifications toast en bas à droite
Confirmations avant suppressions
Recherche/filtrage temps réel
Pagination optimisée
🔒 Sécurité & Performance
Sécurité
CSRF protection via Sanctum
Rate limiting sur les APIs
Validation stricte des données
Audit logging automatique
Permissions par rôle/ressource
Performance
Lazy loading des relations Eloquent
Caching des données fréquentes
Pagination côté serveur
Optimisation queries avec eager loading
Bundle splitting frontend
🚀 Points Forts du Système
Architecture modulaire facilitant l'extension
Gestion fine des quotas avec blocage automatique
Interface responsive adaptée mobile/desktop
Système de notifications complet (push + email)
Traçabilité totale avec audit logs
Authentification robuste multi-rôles
Conversion intelligente disponibilité→programmation
Dashboard analytique avec métriques temps réel
📊 Statistiques du Projet
Modèles Eloquent : ~15 entités principales
Contrôleurs API : ~20 contrôleurs RESTful
Services métier : ~8 services spécialisés
Événements : ~4 événements avec listeners
Notifications : Push + Email + Database
Pages Frontend : ~25 pages React
Composants UI : ~50+ composants réutilisables
Routes API : ~80+ endpoints sécurisés
