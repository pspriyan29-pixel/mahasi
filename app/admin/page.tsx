'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, Trophy, Users, Award, Settings, LogOut,
    Plus, Edit, Trash2, Eye, TrendingUp, Menu, X
} from 'lucide-react';

export default function AdminPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const stats = [
        { label: 'Total Kompetisi', value: '24', icon: Trophy, color: 'from-purple-500 to-pink-500', trend: '+12%' },
        { label: 'Total Peserta', value: '487', icon: Users, color: 'from-blue-500 to-cyan-500', trend: '+23%' },
        { label: 'Kompetisi Aktif', value: '8', icon: TrendingUp, color: 'from-green-500 to-emerald-500', trend: '+5%' },
        { label: 'Pemenang', value: '156', icon: Award, color: 'from-yellow-500 to-orange-500', trend: '+18%' },
    ];

    const recentCompetitions = [
        { id: 1, title: 'Hackathon 2025', participants: 45, status: 'active', deadline: '15 Feb 2025' },
        { id: 2, title: 'UI/UX Design Challenge', participants: 32, status: 'active', deadline: '20 Feb 2025' },
        { id: 3, title: 'Business Plan Competition', participants: 28, status: 'closed', deadline: '10 Feb 2025' },
    ];

    return (
        <div className="min-h-screen animated-bg">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 glass-strong p-6 z-50 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold gradient-text">Admin Panel</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="space-y-2">
                    {[
                        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
                        { icon: Trophy, label: 'Kompetisi', href: '/admin/competitions' },
                        { icon: Users, label: 'Peserta', href: '/admin/participants' },
                        { icon: Award, label: 'Pemenang', href: '/admin/winners' },
                        { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
                    ].map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:glass transition-all"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:glass transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="md:hidden glass p-3 rounded-lg mb-4"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Admin <span className="gradient-text">Dashboard</span>
                        </h1>
                        <p className="text-gray-400">Kelola kompetisi dan peserta</p>
                    </div>
                    <Link href="/admin/competitions/create" className="btn-primary">
                        <Plus className="w-5 h-5 inline mr-2" />
                        Buat Kompetisi Baru
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="premium-card animate-scale-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} p-3`}>
                                    <stat.icon className="w-full h-full text-white" />
                                </div>
                                <span className="text-sm text-green-400">{stat.trend}</span>
                            </div>
                            <p className="text-3xl font-bold mb-1">{stat.value}</p>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Competitions */}
                <div className="glass-strong rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Kompetisi Terbaru</h2>
                        <Link href="/admin/competitions" className="text-purple-400 hover:text-purple-300">
                            Lihat Semua →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Kompetisi</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Peserta</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Deadline</th>
                                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCompetitions.map((competition) => (
                                    <tr key={competition.id} className="border-b border-gray-800 hover:glass transition-all">
                                        <td className="py-4 px-4 font-semibold">{competition.title}</td>
                                        <td className="py-4 px-4">{competition.participants}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${competition.status === 'active'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {competition.status === 'active' ? 'Aktif' : 'Ditutup'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-400">{competition.deadline}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 glass rounded-lg hover:glass-strong transition-all">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 glass rounded-lg hover:glass-strong transition-all">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 glass rounded-lg hover:glass-strong transition-all text-red-400">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/competitions" className="premium-card group cursor-pointer">
                        <Trophy className="w-12 h-12 mb-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">Kelola Kompetisi</h3>
                        <p className="text-gray-400 text-sm">Buat, edit, atau hapus kompetisi</p>
                    </Link>

                    <Link href="/admin/winners" className="premium-card group cursor-pointer">
                        <Award className="w-12 h-12 mb-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">Umumkan Pemenang</h3>
                        <p className="text-gray-400 text-sm">Pilih dan umumkan pemenang</p>
                    </Link>

                    <Link href="/admin/participants" className="premium-card group cursor-pointer">
                        <Users className="w-12 h-12 mb-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">Kelola Peserta</h3>
                        <p className="text-gray-400 text-sm">Lihat dan kelola data peserta</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}
