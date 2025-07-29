"use client";

import { useState, useEffect } from 'react';
import { PhotoUpload } from '@/components/photo-upload';
import { TeacherDashboard } from '@/components/teacher-dashboard';
import { TeacherOnboarding } from '@/components/teacher-onboarding';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle 
} from 'lucide-react';

interface TeacherApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  avatarUrl?: string;
  teacherApplicationStatus?: string | null;
}

// Locale-aware translations for MyPracticeUI
function getTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      becomeTeacher: 'Стать преподавателем',
      teachWithUs: 'Преподавайте с нами',
      shareYourPractice: 'Поделитесь своей практикой йоги с тысячами студентов по всему миру',
      applyNow: 'Подать заявку',
      applicationSubmitted: 'Заявка подана',
      applicationUnderReview: 'Ваша заявка рассматривается. Мы свяжемся с вами в ближайшее время.',
      applicationApproved: 'Заявка одобрена',
      congratulations: 'Поздравляем! Вы можете начать создавать контент.',
      applicationRejected: 'Заявка отклонена',
      tryAgainLater: 'К сожалению, ваша заявка была отклонена. Вы можете подать заявку снова позже.',
      pending: 'Ожидает',
      approved: 'Одобрено',
      rejected: 'Отклонено',
      underReview: 'На рассмотрении',
      createCourses: 'Создавать курсы',
      globalReach: 'Глобальный охват',
      buildStructured: 'Создавайте структурированный обучающий опыт',
      teachStudentsWorldwide: 'Обучайте студентов по всему миру',
      revenueShareModel: '💰 Модель разделения доходов',
      earn70Percent: 'Зарабатывайте 70% от доходов от подписки студентов, которые посещают ваши занятия каждый месяц.',
      requestToBeTeacher: 'Запросить стать преподавателем',
      submitting: 'Отправка...',
      applicationProcess: 'Процесс подачи заявки занимает 5-10 минут. Мы рассмотрим в течение 2-3 рабочих дней.'
    },
    en: {
      becomeTeacher: 'Become a Teacher',
      teachWithUs: 'Teach with us',
      shareYourPractice: 'Share your yoga practice with thousands of students worldwide',
      applyNow: 'Apply Now',
      applicationSubmitted: 'Application Submitted',
      applicationUnderReview: 'Your application is under review. We will contact you soon.',
      applicationApproved: 'Application Approved',
      congratulations: 'Congratulations! You can start creating content.',
      applicationRejected: 'Application Rejected',
      tryAgainLater: 'Unfortunately, your application was rejected. You can apply again later.',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      underReview: 'Under Review',
      createCourses: 'Create Courses',
      globalReach: 'Global Reach',
      buildStructured: 'Build structured learning experiences',
      teachStudentsWorldwide: 'Teach students worldwide',
      revenueShareModel: '💰 Revenue Share Model',
      earn70Percent: 'Earn 70% of subscription revenue from students who attend your classes each month.',
      requestToBeTeacher: 'Request to be a Teacher',
      submitting: 'Submitting...',
      applicationProcess: 'Application process takes 5-10 minutes. We\'ll review within 2-3 business days.'
    },
    'es-MX': {
      becomeTeacher: 'Convertirse en Profesor',
      teachWithUs: 'Enseña con nosotros',
      shareYourPractice: 'Comparte tu práctica de yoga con miles de estudiantes en todo el mundo',
      applyNow: 'Aplicar Ahora',
      applicationSubmitted: 'Solicitud Enviada',
      applicationUnderReview: 'Su solicitud está siendo revisada. Nos pondremos en contacto pronto.',
      applicationApproved: 'Solicitud Aprobada',
      congratulations: '¡Felicitaciones! Puedes comenzar a crear contenido.',
      applicationRejected: 'Solicitud Rechazada',
      tryAgainLater: 'Desafortunadamente, su solicitud fue rechazada. Puede aplicar nuevamente más tarde.',
      pending: 'Pendiente',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      underReview: 'En Revisión',
      createCourses: 'Crear Cursos',
      globalReach: 'Alcance Global',
      buildStructured: 'Construye experiencias de aprendizaje estructuradas',
      teachStudentsWorldwide: 'Enseña a estudiantes de todo el mundo',
      revenueShareModel: '💰 Modelo de Compartir Ingresos',
      earn70Percent: 'Gana el 70% de los ingresos de suscripción de estudiantes que asisten a tus clases cada mes.',
      requestToBeTeacher: 'Solicitar ser Profesor',
      submitting: 'Enviando...',
      applicationProcess: 'El proceso de solicitud toma 5-10 minutos. Revisaremos en 2-3 días hábiles.'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}

export function MyPracticeUI({ user, initialRole, locale = 'ru' }: { user: User, initialRole: 'student' | 'teacher', locale?: string }) {
  const [showTeacherOnboarding, setShowTeacherOnboarding] = useState(false);
  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const t = getTranslations(locale);

  useEffect(() => {
    // Check teacher application status
    fetch('/api/teacher-application')
      .then(r => r.json())
      .then(data => {
        if (data.application) {
          setApplication(data.application);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error checking application status:', err);
        setLoading(false);
      });
  }, []);

  const handleStartApplication = () => {
    setShowTeacherOnboarding(true);
  };

  const handleApplicationSubmit = async (applicationData: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/teacher-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      const data = await res.json();

      if (res.ok) {
        setApplication(data.application);
        setShowTeacherOnboarding(false);
        // Refresh the page to update the user status
        window.location.reload();
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
    setSubmitting(false);
  };

  const handleCancelApplication = () => {
    setShowTeacherOnboarding(false);
  };

  // If user is already a teacher, show teacher dashboard
  if (initialRole === 'teacher') {
    return (
      <div className="space-y-6">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-6">
          <PhotoUpload userId={user.id} initialUrl={user.avatarUrl} />
          <h2 className="font-bold text-xl uppercase text-center mt-2">{user.name}</h2>
          <Badge variant="default" className="mt-2">
            <Star className="w-3 h-3 mr-1" />
            Teacher
          </Badge>
        </div>

                    <TeacherDashboard user={user} locale={locale} />
      </div>
    );
  }

  // Show onboarding flow if in progress
  if (showTeacherOnboarding) {
    return (
      <TeacherOnboarding 
        onComplete={handleApplicationSubmit}
        onCancel={handleCancelApplication}
      />
    );
  }

  // Show teacher application status or button
  return (
    <div className="space-y-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-6">
        <PhotoUpload userId={user.id} initialUrl={user.avatarUrl} />
        <h2 className="font-bold text-xl uppercase text-center mt-2">{user.name}</h2>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : application ? (
        // Show application status
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                {application.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                {application.status === 'under_review' && <AlertCircle className="w-5 h-5 text-blue-500" />}
                {application.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {application.status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                Teacher Application
              </CardTitle>
              <Badge 
                variant={
                  application.status === 'approved' ? 'default' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
              >
                {application.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Submitted on {new Date(application.submittedAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {application.status === 'pending' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your teacher application is being reviewed. We'll notify you via email once a decision is made.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">What's next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Review process typically takes 2-3 business days</li>
                    <li>• We'll email you with the decision</li>
                    <li>• If approved, you'll get immediate access to teacher tools</li>
                  </ul>
                </div>
              </div>
            )}

            {application.status === 'under_review' && (
              <p className="text-sm text-muted-foreground">
                Your application is currently under detailed review. We'll update you soon!
              </p>
            )}

            {application.status === 'approved' && (
              <div className="space-y-4">
                <p className="text-sm text-green-700">
                  Congratulations! Your teacher application has been approved. You now have access to all teacher features.
                </p>
                <Button onClick={() => window.location.reload()} className="w-full">
                  Access Teacher Dashboard
                </Button>
              </div>
            )}

            {application.status === 'rejected' && (
              <div className="space-y-4">
                <p className="text-sm text-red-700">
                  Unfortunately, your application was not approved at this time. You can submit a new application after addressing any feedback.
                </p>
                <Button 
                  onClick={handleStartApplication} 
                  variant="outline" 
                  className="w-full"
                >
                  Submit New Application
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Show teacher application prompt
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.becomeTeacher}
            </CardTitle>
            <CardDescription>
              {t.shareYourPractice}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">{t.createCourses}</h3>
                <p className="text-xs text-muted-foreground">{t.buildStructured}</p>
              </div>
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">{t.globalReach}</h3>
                <p className="text-xs text-muted-foreground">{t.teachStudentsWorldwide}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">{t.revenueShareModel}</h4>
              <p className="text-sm text-green-800">
                {t.earn70Percent}
              </p>
            </div>

            <Button 
              onClick={handleStartApplication} 
              className="w-full" 
              size="lg"
              disabled={submitting}
            >
              {submitting ? t.submitting : t.requestToBeTeacher}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              {t.applicationProcess}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 