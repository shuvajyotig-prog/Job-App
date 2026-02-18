import React from 'react';
import { CareerArticle } from '../types';
import { Clock, Tag, ArrowUpRight, Newspaper, Zap } from 'lucide-react';
import { Badge } from './ui/Badge';

// Mock data for the feed
const MOCK_ARTICLES: CareerArticle[] = [
    {
        id: '1',
        title: 'Top 5 Skills Tech Giants Are Hiring For in 2024',
        excerpt: 'From AI literacy to advanced cloud architecture, see what’s in demand this quarter.',
        category: 'Market Trends',
        readTime: '5 min read',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Today'
    },
    {
        id: '2',
        title: 'Negotiating Your Salary: A Senior Dev’s Guide',
        excerpt: 'Don’t leave money on the table. Practical scripts and strategies for your next offer.',
        category: 'Career Advice',
        readTime: '8 min read',
        imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: 'Yesterday'
    },
    {
        id: '3',
        title: 'The Rise of "Fractional" Roles',
        excerpt: 'Why part-time executive roles are booming and how to land one.',
        category: 'Gig Economy',
        readTime: '4 min read',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: '2 days ago'
    },
    {
        id: '4',
        title: 'Mastering the System Design Interview',
        excerpt: 'Key concepts you need to know for L5+ engineering interviews at FAANG.',
        category: 'Interview Prep',
        readTime: '12 min read',
        imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        date: '3 days ago'
    }
];

export const CareerFeedTab: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto pb-24">
            
            <div className="bg-neo-black text-white rounded-[2rem] p-8 md:p-12 mb-10 shadow-neo relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-electric opacity-20 blur-[80px] rounded-full pointer-events-none -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-acid text-neo-black rounded-full text-xs font-black mb-4">
                        <Zap size={14} fill="currentColor" /> DAILY DIGEST
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black mb-4 tracking-tight">
                        Career Fuel
                    </h1>
                    <p className="text-slate-300 text-lg max-w-xl font-medium">
                        Stay ahead of the curve with curated insights, market trends, and actionable advice for your career journey.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {MOCK_ARTICLES.map((article, idx) => (
                    <article 
                        key={article.id} 
                        className="group bg-white rounded-2xl border-2 border-neo-black overflow-hidden hover:shadow-neo transition-all duration-300 cursor-pointer flex flex-col h-full"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img 
                                src={article.imageUrl} 
                                alt={article.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold border-2 border-neo-black shadow-sm">
                                    {article.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-3">
                                <span>{article.date}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} /> {article.readTime}
                                </span>
                            </div>
                            <h2 className="text-xl font-display font-bold text-neo-black mb-3 leading-tight group-hover:text-electric transition-colors">
                                {article.title}
                            </h2>
                            <p className="text-slate-600 mb-6 flex-1 text-sm leading-relaxed">
                                {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-neo-black transition-colors">Read Article</span>
                                <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-neo-black group-hover:bg-neo-black group-hover:text-white transition-all">
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button className="px-6 py-3 bg-white border-2 border-neo-black rounded-xl font-bold shadow-[4px_4px_0px_black] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_black] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all">
                    Load More Articles
                </button>
            </div>
        </div>
    );
};
