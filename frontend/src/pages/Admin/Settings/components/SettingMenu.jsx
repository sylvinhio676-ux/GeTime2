import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function SettingMenu({ items, activeTab, onTabChange }) {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-4 sticky top-24">
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-2xl
                transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-100 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-600'
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
