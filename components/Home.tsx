
import React from 'react';
import { DocumentTextIcon, ListBulletIcon, SparklesIcon } from './icons/Icons';

type View = 'home' | 'text-generator' | 'bank-generator';

interface HomeProps {
    onSelectMode: (mode: View) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center animate-fade-in">
            <div className="text-center mb-10">
                <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
                    <SparklesIcon className="w-10 h-10 text-primary"/>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                    Trình tạo đề thi Toán AI
                </h1>
                <p className="mt-3 text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
                    Chọn một phương thức để AI có thể giúp bạn tạo ra một đề thi toán hoàn chỉnh một cách nhanh chóng.
                </p>
            </div>

            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModeCard
                    icon={<ListBulletIcon className="w-8 h-8 mb-4 text-primary" />}
                    title="Tạo từ Ngân hàng câu hỏi"
                    description="Chọn các câu hỏi mẫu theo chuyên đề và để AI tạo ra các câu hỏi tương tự."
                    onClick={() => onSelectMode('bank-generator')}
                />
                <ModeCard
                    icon={<DocumentTextIcon className="w-8 h-8 mb-4 text-primary" />}
                    title="Tạo từ Văn bản"
                    description="Dán nội dung tài liệu của bạn để AI phân tích và tạo một đề thi hoàn chỉnh."
                    onClick={() => onSelectMode('text-generator')}
                />
            </div>
        </div>
    );
};

interface ModeCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
}

const ModeCard: React.FC<ModeCardProps> = ({ icon, title, description, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark text-left hover:border-primary dark:hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 transform hover:-translate-y-2"
        >
            {icon}
            <h2 className="text-xl font-bold text-text-light dark:text-text-dark mb-2 group-hover:text-primary transition-colors">{title}</h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">{description}</p>
        </button>
    );
};
