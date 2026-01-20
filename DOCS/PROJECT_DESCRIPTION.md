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
