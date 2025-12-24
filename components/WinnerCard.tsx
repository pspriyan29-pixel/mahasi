'use client';

import { Trophy, Award, Medal } from 'lucide-react';

interface WinnerCardProps {
    winner: {
        id: string;
        rank: number;
        user_name: string;
        competition_title: string;
        prize_amount?: string;
        announcement_date: string;
    };
}

export default function WinnerCard({ winner }: WinnerCardProps) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-8 h-8 text-yellow-400" />;
            case 2:
                return <Medal className="w-8 h-8 text-gray-300" />;
            case 3:
                return <Medal className="w-8 h-8 text-orange-400" />;
            default:
                return <Award className="w-8 h-8 text-purple-400" />;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-yellow-500 to-orange-500';
            case 2:
                return 'from-gray-400 to-gray-600';
            case 3:
                return 'from-orange-500 to-red-500';
            default:
                return 'from-purple-500 to-pink-500';
        }
    };

    const getRankLabel = (rank: number) => {
        switch (rank) {
            case 1:
                return 'Juara 1';
            case 2:
                return 'Juara 2';
            case 3:
                return 'Juara 3';
            default:
                return `Juara ${rank}`;
        }
    };

    return (
        <div className="glass-strong rounded-2xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-start gap-4">
                {/* Rank Icon */}
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(winner.rank)} flex items-center justify-center flex-shrink-0`}>
                    {getRankIcon(winner.rank)}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRankColor(winner.rank)} text-white`}>
                            {getRankLabel(winner.rank)}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold mb-1">{winner.user_name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{winner.competition_title}</p>

                    {winner.prize_amount && (
                        <div className="glass rounded-lg p-3 mb-3">
                            <p className="text-gray-500 text-xs mb-1">Hadiah</p>
                            <p className="text-white font-bold">{winner.prize_amount}</p>
                        </div>
                    )}

                    <p className="text-gray-500 text-xs">
                        Diumumkan {new Date(winner.announcement_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>
        </div>
    );
}
