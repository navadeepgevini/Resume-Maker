'use client';

import type { ResumeTemplate } from '@/types/resume';

interface TemplateSelectorProps {
  selected: ResumeTemplate;
  onSelect: (template: ResumeTemplate) => void;
}

export default function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  const templates: { id: ResumeTemplate; name: string; badge: { text: string; type: 'good' | 'warning' } }[] = [
    { id: 'classic', name: 'Classic', badge: { text: '🟢 Best ATS compatibility', type: 'good' } },
    { id: 'modern', name: 'Modern', badge: { text: '🟡 Lower ATS compatibility (two-column layout)', type: 'warning' } },
    { id: 'bold', name: 'Bold', badge: { text: '🟢 Good ATS compatibility', type: 'good' } },
  ];

  const renderThumbnail = (id: ResumeTemplate) => {
    switch (id) {
      case 'classic':
        return (
          <div className="w-full h-full p-2 flex flex-col items-center gap-[2px]">
            <div className="w-8 h-1 bg-[#1C1C1A] rounded-full mb-[2px]"></div>
            <div className="w-full h-[1px] bg-[#E4E4DF]"></div>
            <div className="w-full flex flex-col gap-1 mt-1">
              <div className="w-full h-[2px] bg-[#6B6B63] rounded-full"></div>
              <div className="w-3/4 h-[2px] bg-[#6B6B63] rounded-full"></div>
              <div className="w-full h-[2px] bg-[#6B6B63] rounded-full"></div>
            </div>
          </div>
        );
      case 'modern':
        return (
          <div className="w-full h-full flex flex-row">
            <div className="w-1/3 h-full bg-[#33415C]"></div>
            <div className="w-2/3 h-full bg-white p-2 flex flex-col gap-1">
              <div className="w-3/4 h-[3px] bg-[#1C1C1A] rounded-full"></div>
              <div className="w-full h-[2px] bg-[#6B6B63] rounded-full mt-1"></div>
              <div className="w-full h-[2px] bg-[#6B6B63] rounded-full"></div>
            </div>
          </div>
        );
      case 'bold':
        return (
          <div className="w-full h-full flex flex-col">
            <div className="w-full h-1/4 bg-[#33415C] p-2 flex items-center">
               <div className="w-8 h-[3px] bg-white rounded-full"></div>
            </div>
            <div className="w-full h-3/4 bg-white p-2 flex flex-col gap-1">
              <div className="w-full h-[2px] bg-[#1C1C1A] rounded-full"></div>
              <div className="w-3/4 h-[2px] bg-[#6B6B63] rounded-full"></div>
              <div className="w-full h-[2px] bg-[#6B6B63] rounded-full"></div>
            </div>
          </div>
        );
    }
  };

  return (
      <div className="flex flex-row gap-3" role="radiogroup" aria-label="Resume Templates">
        {templates.map((template) => {
          const isSelected = selected === template.id;
          return (
            <div
              key={template.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelect(template.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(template.id);
                }
              }}
              className={`relative w-[120px] h-[160px] flex flex-col rounded-[6px] cursor-pointer transition-transform duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#33415C] focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-[#33415C] border-2 scale-[1.02] shadow-sm'
                  : 'border-[#E4E4DF] border hover:border-[#33415C]/40'
              }`}
            >
              <div className="flex-1 bg-[#FAFAF9] rounded-t-[4px] overflow-hidden">
                {renderThumbnail(template.id)}
              </div>
              <div className={`h-8 flex items-center justify-center border-t border-[#E4E4DF] rounded-b-[4px] ${isSelected ? 'bg-[#FAFAF9]' : 'bg-white'}`}>
                <span className="text-xs font-medium text-[#1C1C1A]">{template.name}</span>
              </div>
              
              {/* Badge Tooltip */}
              <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                <span className={`inline-block px-2 py-1 text-[10px] font-medium whitespace-nowrap rounded-md shadow-sm border ${
                  template.badge.type === 'good' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                }`}>
                  {template.badge.text}
                </span>
              </div>
              
              {/* Small Badge Icon always visible */}
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border border-white shadow-sm flex items-center justify-center bg-white">
                <span className="text-[8px]">{template.badge.type === 'good' ? '🟢' : '🟡'}</span>
              </div>
            </div>
          );
        })}
      </div>
  );
}
