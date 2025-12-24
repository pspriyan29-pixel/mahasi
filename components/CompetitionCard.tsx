'use client';

import { Trophy, Calendar, Users, DollarSign } from 'lucide-react';

interface CompetitionCardProps {
    competition: {
        id: string;
        title: string;
        description: string;
        category: string;
        banner_url?: string;
        registration_deadline: string;
        max_participants: number;
        current_participants: number;
        first_prize?: string;
        status: string;
    };
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
    const deadline = new Date(competition.registration_deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const participantPercentage = (competition.current_participants / competition.max_participants) * 100;

    const statusColors = {
        draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        open: 'bg-green-500/20 text-green-400 border-green-500/30',
        ongoing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        closed: 'bg-red-500/20 text-red-400 border-red-500/30',
        finished: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };

    return (
        <div className="glass-strong rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 group">
            {/* Banner */}
            <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-hidden">
                {competition.banner_url ? (
                    <img
                        src={competition.banner_url}
                        alt={competition.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-20 h-20 text-purple-400 opacity-50" />
                    </div>
                )}

                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[competition.status as keyof typeof statusColors]}`}>
                    {competition.status.toUpperCase()}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-sm">
                    {competition.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all">
                    {competition.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {competition.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Deadline</p>
                            <p className="text-white font-semibold">{daysLeft} hari</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Peserta</p>
                            <p className="text-white font-semibold">
                                {competition.current_participants}/{competition.max_participants}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Participant Progress */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Kuota Peserta</span>
                        <span>{participantPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${Math.min(participantPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>

                {/* Prize */}
                {competition.first_prize && (
                    <div className="flex items-center gap-2 mb-4 p-3 glass rounded-lg">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Hadiah Utama</p>
                            <p className="text-white font-semibold">{competition.first_prize}</p>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <a
                    href={`/competitions/${competition.id}`}
                    className="block w-full btn-primary text-center py-3"
                >
                    Lihat Detail
                </a>
            </div>
        </div>
    );
}
