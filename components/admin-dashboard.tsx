"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  Calendar,
  MessageSquare,
  Sparkles,
  Moon,
  Settings
} from 'lucide-react';
import Link from 'next/link';

// Simple fallback translations for when next-intl context is not available
const getFallbackTranslations = (locale: string = 'ru') => {
  const translations = {
    ru: {
      adminDashboard: 'Админ панель',
      teacherApplications: 'Заявки преподавателей',
      pending: 'Ожидает',
      approved: 'Одобрено', 
      rejected: 'Отклонено',
      approve: 'Одобрить',
      reject: 'Отклонить',
      viewApplication: 'Просмотреть заявку',
      noApplications: 'Заявки не найдены',
      loading: 'Загрузка...',
      name: 'Имя',
      email: 'Email',
      submittedAt: 'Подано',
      status: 'Статус',
      actions: 'Действия',
      experience: 'Уровень опыта',
      certifications: 'Подготовка',
      bio: 'Дополнительная информация',
      reviewNotes: 'Заметки для проверки',
      addFeedback: 'Добавить отзыв...',
      reviewNotesLabel: 'Заметки по проверке',
      reviewedOn: 'Проверено'
    },
    en: {
      adminDashboard: 'Admin Dashboard',
      teacherApplications: 'Teacher Applications',
      pending: 'Pending',
      approved: 'Approved', 
      rejected: 'Rejected',
      approve: 'Approve',
      reject: 'Reject',
      viewApplication: 'View Application',
      noApplications: 'No applications found',
      loading: 'Loading...',
      name: 'Name',
      email: 'Email',
      submittedAt: 'Submitted',
      status: 'Status',
      actions: 'Actions',
      experience: 'Experience Level',
      certifications: 'Training Background',
      bio: 'Additional Info',
      reviewNotes: 'Review Notes',
      addFeedback: 'Add feedback...',
      reviewNotesLabel: 'Review Notes',
      reviewedOn: 'Reviewed on'
    },
    'es-MX': {
      adminDashboard: 'Panel Administrador',
      teacherApplications: 'Solicitudes de Profesores',
      pending: 'Pendiente',
      approved: 'Aprobado', 
      rejected: 'Rechazado',
      approve: 'Aprobar',
      reject: 'Rechazar',
      viewApplication: 'Ver solicitud',
      noApplications: 'No se encontraron solicitudes',
      loading: 'Cargando...',
      name: 'Nombre',
      email: 'Email',
      submittedAt: 'Enviado',
      status: 'Estado',
      actions: 'Acciones',
      experience: 'Nivel de Experiencia',
      certifications: 'Preparación',
      bio: 'Información Adicional',
      reviewNotes: 'Notas de Revisión',
      addFeedback: 'Agregar comentario...',
      reviewNotesLabel: 'Notas de Revisión',
      reviewedOn: 'Revisado el'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
};

interface TeacherApplication {
  id: string;
  userId: string;
  experienceLevel: string;
  trainingBackground: string;
  offlinePractice?: string;
  regularStudentsCount?: string;
  revenueModel: string;
  motivation?: string;
  additionalInfo?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

interface AdminDashboardProps {
  locale?: string;
}

// Hook to safely use translations with fallback
function useSafeTranslations(locale: string = 'ru') {
  try {
    return useTranslations();
  } catch {
    return (key: string) => {
      const fallback = getFallbackTranslations(locale);
      return fallback[key as keyof typeof fallback] || key;
    };
  }
}

export function AdminDashboard({ locale = 'ru' }: AdminDashboardProps = {}) {
  const t = useSafeTranslations(locale);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/teacher-applications');
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStatusUpdate(id: string, status: 'approved' | 'rejected', reviewNotes: string) {
    try {
      const response = await fetch(`/api/admin/teacher-applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes }),
    });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error updating application:', error);
        alert(`${t('common.error')}: ${error.error || t('errors.failedToSave')}`);
        return;
      }

      // refresh applications list
    const res = await fetch('/api/admin/teacher-applications');
    if (res.ok) {
      const data = await res.json();
      setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(t('errors.networkError'));
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'secondary';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {t(`teacher.application.${status}`)}
      </Badge>
    );
  };

  if (loading) {
    return <p className="text-center py-20">{t('common.loading')}</p>;
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">{t('admin.noApplicationsYet')}</h3>
          <p className="text-muted-foreground">{t('admin.applicationsWillAppear')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('adminDashboard')}</h1>
      </div>

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('teacherApplications')}
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Spiritual Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">{t('noApplications')}</h3>
                <p className="text-muted-foreground">Applications will appear here when teachers apply</p>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  {application.user?.name || 'Unknown User'}
                  {getStatusBadge(application.status)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{application.user?.email || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">
                  {t('submittedAt')}: {new Date(application.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                                 <p className="text-sm font-medium">{t('experience')}</p>
                                   <p className="text-sm capitalize">{application.experienceLevel?.replace('_', ' ') || 'N/A'}</p>
              </div>
                <div className="space-y-2">
                 <p className="text-sm font-medium">{t('certifications')}</p>
                                   <p className="text-sm">{application.trainingBackground || 'N/A'}</p>
                </div>
              <div className="space-y-2">
                 <p className="text-sm font-medium">{t('bio')}</p>
                 <p className="text-sm">{application.additionalInfo || 'N/A'}</p>
              </div>
            </div>

            {application.status === 'pending' && (
              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                                         <p className="text-sm font-medium">{t('reviewNotes')}</p>
                    <textarea
                                              placeholder={t('addFeedback')}
                      rows={3}
                      className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => {
                        const notes = (document.querySelector(`textarea[placeholder="${t('addFeedback')}"]`) as HTMLTextAreaElement)?.value || '';
                        handleStatusUpdate(application.id, 'approved', notes);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('approve')}
                    </Button>
                    <Button 
                      onClick={() => {
                        const notes = (document.querySelector(`textarea[placeholder="${t('addFeedback')}"]`) as HTMLTextAreaElement)?.value || '';
                        handleStatusUpdate(application.id, 'rejected', notes);
                      }}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                                              {t('reject')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {application.status !== 'pending' && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium">{t('reviewNotesLabel')}</p>
                <p className="text-sm mt-1">{application.reviewNotes || 'N/A'}</p>
                {application.reviewedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('reviewedOn')} {new Date(application.reviewedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="spiritual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/spiritual/chakras">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Chakra Management</h2>
                    <p className="text-gray-600">Manage chakra information and daily focus schedule</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/spiritual/moon-phases">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Moon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Moon Phases</h2>
                    <p className="text-gray-600">Configure moon phase data and practice guidelines</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/spiritual/quotes">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Yoga Quotes</h2>
                    <p className="text-gray-600">Manage daily quotes and inspirational texts</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/admin/spiritual/calendar">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Schedule Overview</h2>
                    <p className="text-gray-600">View and manage the spiritual content calendar</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Admin Settings</h3>
              <p className="text-gray-600">Configure admin panel settings and preferences</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
