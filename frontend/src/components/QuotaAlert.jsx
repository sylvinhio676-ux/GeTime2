import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function QuotaAlert({ percentageUsed, threshold = 90 }) {
    if (percentageUsed < threshold) return null;

    return (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Quota presque épuisé ({percentageUsed.toFixed(1)}% utilisé)</span>
        </div>
    );
}