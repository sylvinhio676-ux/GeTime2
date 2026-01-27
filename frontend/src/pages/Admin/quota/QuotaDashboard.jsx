import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { quotaService } from '@/services/quotaService';
import { subjectService } from '@/services/subjectService';
import Pagination from '@/components/Pagination';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function QuotaDashboard() {
    const [stats, setStats] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, subjectsData] = await Promise.all([
                quotaService.getStats(),
                subjectService.getQuotaStatus()
            ]);
            setStats(statsData);
            setSubjects(subjectsData.subjects || []);
        } catch (error) {
            console.error('Error loading quota data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubjects = subjects.filter(s =>
        !statusFilter || s.status === statusFilter
    );

    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(filteredSubjects.length / PAGE_SIZE);
    const pagedSubjects = filteredSubjects.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    const pieData = stats ? [
        { name: 'En cours', value: stats.in_progress, color: '#00C49F' },
        { name: 'Terminées', value: stats.completed, color: '#FF8042' },
        { name: 'Non programmées', value: stats.not_programmed, color: '#FFBB28' },
    ] : [];

    if (loading) {
        return <div className="p-4">Chargement...</div>;
    }

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/80 to-secondary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">Tableau de bord des Quotas</h1>
                        <p className="text-muted-foreground text-xs md:text-sm font-medium">Suivi des heures programmées par matière</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <CalendarDays className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Matières</p>
                            <p className="text-2xl font-bold">{stats?.total_subjects || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">En cours</p>
                            <p className="text-2xl font-bold">{stats?.in_progress || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Terminées</p>
                            <p className="text-2xl font-bold">{stats?.completed || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Non programmées</p>
                            <p className="text-2xl font-bold">{stats?.not_programmed || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Répartition des statuts</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Top 10 matières par utilisation</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={subjects.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="subject" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="percentage_used" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Subjects Table */}
            <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30">
                    <h3 className="text-lg font-bold">Détail par matière</h3>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-border rounded-xl text-sm"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminées</option>
                        <option value="not_programmed">Non programmées</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-muted-foreground/80 text-[10px] uppercase font-black tracking-widest border-b border-border/60">
                            <tr>
                                <th className="px-8 py-4">Matière</th>
                                <th className="px-8 py-4">Enseignant</th>
                                <th className="px-8 py-4">Statut</th>
                                <th className="px-8 py-4">Quota utilisé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {pagedSubjects.map((subject) => (
                                <tr key={subject.subject} className="group hover:bg-muted/50 transition-colors">
                                    <td className="px-8 py-4 font-medium">{subject.subject}</td>
                                    <td className="px-8 py-4">{subject.teacher}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            subject.status === 'completed' ? 'bg-red-100 text-red-800' :
                                            subject.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {subject.status === 'completed' ? 'Terminée' :
                                             subject.status === 'in_progress' ? 'En cours' : 'Non programmée'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">{subject.percentage_used.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );
}