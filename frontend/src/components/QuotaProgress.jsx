import React from 'react';
import { Progress } from '@/components/ui/progress';

export default function QuotaProgress({ totalQuota, usedQuota, remainingQuota, className = '' }) {
    const percentage = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;
    const isCompleted = remainingQuota <= 0;

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quota utilisé</span>
                <span className={`font-medium ${isCompleted ? 'text-red-600' : 'text-foreground'}`}>
                    {usedQuota.toFixed(1)}h / {totalQuota.toFixed(1)}h
                </span>
            </div>
            <Progress
                value={Math.min(percentage, 100)}
                className={`h-2 ${isCompleted ? 'bg-red-100' : ''}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Restant: {remainingQuota.toFixed(1)}h</span>
                <span>{percentage.toFixed(1)}%</span>
            </div>
        </div>
    );
}