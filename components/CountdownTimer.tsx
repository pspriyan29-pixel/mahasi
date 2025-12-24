'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    targetDate: string | Date;
    onExpire?: () => void;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function CountdownTimer({ targetDate, onExpire }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setIsExpired(true);
                if (onExpire) onExpire();
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onExpire]);

    if (isExpired) {
        return (
            <div className="text-center text-red-400 font-semibold">
                Waktu Habis!
            </div>
        );
    }

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className="glass-strong rounded-lg p-3 min-w-[60px] mb-1">
                <span className="text-2xl font-bold gradient-text">
                    {value.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-xs text-gray-400 uppercase">{label}</span>
        </div>
    );

    return (
        <div className="flex gap-2 justify-center">
            <TimeUnit value={timeLeft.days} label="Hari" />
            <div className="flex items-center pb-6 text-2xl font-bold text-gray-600">:</div>
            <TimeUnit value={timeLeft.hours} label="Jam" />
            <div className="flex items-center pb-6 text-2xl font-bold text-gray-600">:</div>
            <TimeUnit value={timeLeft.minutes} label="Menit" />
            <div className="flex items-center pb-6 text-2xl font-bold text-gray-600">:</div>
            <TimeUnit value={timeLeft.seconds} label="Detik" />
        </div>
    );
}
