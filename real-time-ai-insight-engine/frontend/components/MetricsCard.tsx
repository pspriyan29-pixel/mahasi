'use client';

interface MetricsCardProps {
    title: string;
    value: string;
    icon: string;
}

export default function MetricsCard({ title, value, icon }: MetricsCardProps) {
    return (
        <div className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                <span className="text-2xl">{icon}</span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    );
}
