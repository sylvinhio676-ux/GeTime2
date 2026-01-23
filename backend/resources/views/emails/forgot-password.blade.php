<!doctype html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>Réinitialisation GeTime</title>
</head>
<body style="font-family: system-ui, sans-serif; background: #f5f5f7; padding: 32px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 32px; border-radius: 24px; box-shadow: 0 10px 30px rgba(15, 15, 15, 0.08);">
        <p style="font-size: 14px; color: #6673fc; letter-spacing: 0.3em;">GeTime</p>
        <h1 style="margin-top: 8px; font-size: 24px; font-weight: 700; color: #111827;">Nouveau mot de passe</h1>
        <p style="color: #4b5563; line-height: 1.5;">Bonjour {{ $user->name }},</p>
        <p style="color: #374151; line-height: 1.5;">
            Un nouveau mot de passe a été généré pour vous accéder à votre compte. Le voici :
        </p>
        <p style="margin: 24px 0; font-size: 20px; font-weight: 600; background: #f3f4f6; padding: 12px 16px; border-radius: 12px;">
            {{ $plainPassword }}
        </p>
        <p style="color: #374151; line-height: 1.5;">
            Pensez à changer ce mot de passe dès votre connexion, dans les <strong>Paramètres > Sécurité</strong>.
        </p>
        <p style="margin-top: 32px; color: #9ca3af; font-size: 12px;">
            Ce message est envoyé automatiquement par GeTime. Si vous n’êtes pas à l’origine de cette demande, contactez l’assistance immédiatement.
        </p>
    </div>
</body>
</html>
