import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function SettingMenu({ items, activeTab, onTabChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-5 h-5" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
