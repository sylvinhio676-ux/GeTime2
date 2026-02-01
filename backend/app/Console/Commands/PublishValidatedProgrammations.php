<?php

namespace App\Console\Commands;

use App\Services\ProgrammationAutomationService;
use Illuminate\Console\Command;

class PublishValidatedProgrammations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'programmations:publish-validated';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publie automatiquement les programmations validées sans conflit';

    public function __construct(private ProgrammationAutomationService $automationService)
    {
        parent::__construct();
    }

    public function handle()
    {
        $result = $this->automationService->publishValidated();
        $row = $result['run'] ?? null;
        $this->info("Programmations publiées automatiquement : {$result['published']}");
        foreach ($result['skipped'] as $skip) {
            $this->warn("Programmation {$skip['id']} ignorée ({$skip['reason']})");
        }

        if ($row) {
            $this->info("Création run #{$row['id']} (conflits {$row['conflicts_count']}, alertes quotas {$row['quota_alerts_count']})");
        }
        return self::SUCCESS;
    }
}
