<?php

namespace App\Console\Commands;

use App\Models\Email;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Webklex\PHPIMAP\ClientManager;

class SyncGmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-gmail-command';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronise les nouveaux messages Gmail avec la base de données';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Démarrage de la synchronisation des messages Gmail...');
        try {
            // Au lieu de la Façade, on utilise le ClientManager pour plus de sécurité
        $cm = new ClientManager(config_path('imap.php'));
        
        // On crée le client en utilisant la configuration 'default' définie dans config/imap.php
        $client = $cm->make([
            'host'          => env('IMAP_HOST'),
            'port'          => env('IMAP_PORT'),
            'encryption'    => env('IMAP_ENCRYPTION'),
            'validate_cert' => true,
            'username'      => env('IMAP_USERNAME'),
            'password'      => env('IMAP_PASSWORD'),
            'protocol'      => 'imap'
        ]);
            $client->connect();

            $folder = $client->getFolder('INBOX');
            //Recupérer les messages non lus
            $messages = $folder->query()->unseen()->get();

            $count = 0;
            foreach ($messages as $message) {
                if (!Email::where('meta->message_id', $message->getMessageId())->exists()) {
                    Email::create([
                        'direction' => 'inbox',
                        'from_address' => $message->getFrom()[0]->mail,
                        'to_address' => config('mail.from.address'),
                        'subject' => $message->getSubject(),
                        'message' => $message->getHTMLBody() ?: $message->getTextBody(),
                        'status' => 'received',
                        'meta' => [
                            'message_id' => $message->getMessageId(),
                            'unread' => true
                        ]
                    ]);
                    $count++;
            }
            
        }
            $this->info("Synchronisation terminée. {$count} nouveaux messages ajoutés.");
        } catch (\Exception $e) {
            $this->error('Erreur lors de la synchronisation des messages Gmail : ' . $e->getMessage());
        }
    }
}
