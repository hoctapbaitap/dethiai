
import React, { useState } from 'react';
import { HomeIcon, SunIcon, MoonIcon, SettingsIcon, DocumentTextIcon, ChevronDownIcon } from './icons/Icons';
import { mathBank } from '../data/math-bank';

interface SidebarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onGoHome: () => void;
  onSelectTextGenerator: () => void;
  onSelectBankGenerator: (gradeId: string, chapterId: string, topicId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const { isDarkMode, toggleDarkMode, onGoHome, onSelectTextGenerator, onSelectBankGenerator } = props;
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 bg-surface-light dark:bg-surface-dark p-4 flex flex-col justify-between border-r border-border-light dark:border-border-dark hidden md:flex">
      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        <SidebarButton
          text="Trang chủ"
          icon={<HomeIcon className="w-5 h-5" />}
          onClick={onGoHome}
          isPrimary
        />

        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark mb-2">Tạo đề thi</h3>
          <nav className="space-y-1">
            <p className="px-3 py-2 text-sm font-medium text-text-light dark:text-text-dark">Ngân hàng câu hỏi</p>
            <div className="space-y-1 pl-2">
              {mathBank.map(grade => (
                <div key={grade.id}>
                  <button onClick={() => toggleItem(grade.id)} className="w-full flex items-center justify-between p-2 text-sm rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700">
                    <span>{grade.name}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${openItems[grade.id] ? 'rotate-180' : ''}`} />
                  </button>
                  {openItems[grade.id] && (
                    <div className="pl-3 mt-1 space-y-1 border-l border-border-light dark:border-border-dark ml-2">
                      {grade.chapters.map(chapter => (
                        <div key={chapter.id}>
                          <button onClick={() => toggleItem(chapter.id)} className="w-full flex items-center justify-between p-2 text-sm text-left rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700">
                             <span className="truncate pr-2">{chapter.name}</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform flex-shrink-0 ${openItems[chapter.id] ? 'rotate-180' : ''}`} />
                          </button>
                           {openItems[chapter.id] && (
                             <div className="pl-3 mt-1 space-y-1 border-l border-border-light dark:border-border-dark ml-2">
                                {chapter.topics.map(topic => (
                                     <button key={topic.id} onClick={() => onSelectBankGenerator(grade.id, chapter.id, topic.id)} className="w-full text-left p-2 text-sm rounded-md text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary transition-colors">
                                        <span className="truncate">{topic.name}</span>
                                     </button>
                                ))}
                             </div>
                           )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <SidebarButton
              text="Tạo từ văn bản"
              icon={<DocumentTextIcon className="w-5 h-5" />}
              onClick={onSelectTextGenerator}
            />
          </nav>
        </div>
      </div>

      <div className="flex-shrink-0">
        <div className="space-y-1">
            <SidebarButton
                text={isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}
                icon={isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                onClick={toggleDarkMode}
            />
            <SidebarButton
                text="Cài đặt"
                icon={<SettingsIcon className="w-5 h-5" />}
                onClick={() => {}}
            />
        </div>
      </div>
    </aside>
  );
};


interface SidebarButtonProps {
    icon: React.ReactNode;
    text: string;
    onClick: () => void;
    isPrimary?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, text, onClick, isPrimary = false }) => {
    const baseClasses = "w-full flex items-center space-x-3 px-3 py-2 rounded-md font-medium text-sm transition-colors";
    const primaryClasses = "bg-primary text-white hover:bg-primary-focus";
    const secondaryClasses = "text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-text-light dark:hover:text-text-dark";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses}`}>
            {icon}
            <span>{text}</span>
        </button>
    );
};
