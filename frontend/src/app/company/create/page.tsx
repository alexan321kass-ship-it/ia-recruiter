'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { Briefcase, ArrowLeft, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    experience: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      await api.post('/jobs', {
        ...formData,
        skills: skillsArray,
        experience: Number(formData.experience)
      });
      router.push('/company');
    } catch (error) {
      console.error('Error al crear vacante', error);
      alert('Error al crear la vacante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full bg-grid">
      <Link href="/company" className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Panel</span>
      </Link>
      <div className="p-8 rounded-3xl border border-white/10 bg-slate-950/95 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center space-x-4 mb-8">
          <div className="h-12 w-12 flex items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Publicar Nueva Vacante</h1>
            <p className="text-slate-400 text-sm">Nuestra IA encontrará automáticamente a los mejores candidatos según esta descripción.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Título del Puesto</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
              placeholder="Ej. Desarrollador Frontend Senior"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Descripción del Puesto</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="block w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Describe el rol, responsabilidades y perfil ideal del candidato..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Habilidades Requeridas (separadas por coma)</label>
              <input
                type="text"
                required
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="block w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                placeholder="React, Node.js, TypeScript"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Años de Experiencia Requeridos Para el Puesto</label>
              <input
                type="number"
                min="0"
                required
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: Number(e.target.value)})}
                className="block w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl text-sm font-semibold text-slate-950 bg-cyan-500 hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Publicar Vacante</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
