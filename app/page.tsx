import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleLanguageToggle } from '@/components/simple-language-toggle';
import { MobileNav } from '@/components/mobile-nav';
import { 
  Heart, 
  Settings, 
  Clock, 
  Video, 
  PlayCircle, 
  Users, 
  Star,
  Calendar,
  Headphones,
  Baby,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Music,
  CirclePlay
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Find Your Perfect Practice | Dzen Yoga',
  description:
    'Discover yoga teachers you will love. Customize your practice with any duration, style and length. Connect deeper through webinars and private classes. Create playlists for the whole family.'
};

// This page needs dynamic rendering for i18n
export const dynamic = 'force-dynamic';

// Function to load messages from the /messages folder
async function getMessages(locale: string = 'ru') {
  try {
    const messages = await import(`../messages/${locale}.json`);
    return messages.default || messages;
  } catch {
    // Fallback to Russian if locale file doesn't exist
    try {
      const messages = await import(`../messages/ru.json`);
      return messages.default || messages;
    } catch {
      return {};
    }
  }
}

// Extended translations for homepage content not yet in message files
function getExtendedTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      title: 'Найдите Вашу Идеальную',
      subtitle: 'Практику Йоги',
      description: 'Откройте для себя учителей, которых вы полюбите, настройте каждый аспект вашей практики и установите более глубокую связь с персонализированным руководством',
      startTrial: 'Начать Бесплатно',
      browseClasses: 'Смотреть Классы',
      whyLove: 'Почему Вам Понравится Dzen Yoga',
      whyDescription: 'Каждая функция разработана, чтобы сделать вашу практику идеальной для вас',
      findTeachers: 'Найдите Учителей, Которых Полюбите',
      findTeachersDesc: 'Просматривайте подробные профили, стили преподавания и отзывы студентов, чтобы найти инструкторов, которые резонируют с вашим путешествием.',
      customizeEverything: 'Настройте Все',
      customizeDesc: 'Фильтруйте по продолжительности, интенсивности, стилю, области фокуса и многому другому. Каждый класс идеально подходит вашим потребностям и расписанию.',
      perfectTiming: 'Идеальное Время',
      perfectTimingDesc: 'От 5-минутных утренних растяжек до 90-минутных глубоких потоков. Найдите классы, которые подходят вашему расписанию.',
      crystalClear: 'Кристально Четкое HD',
      crystalClearDesc: 'Каждая поза, каждая подсказка по выравниванию запечатлена в прекрасных деталях. Никогда не пропустите движение с нашим видео студийного качества.',
      smartPlaylists: 'Умные Плейлисты',
      smartPlaylistsDesc: 'Создавайте пользовательские последовательности для разных настроений и целей. Ваше личное путешествие йоги, идеально подобранное.',
      forFamily: 'Для Всей Семьи',
      forFamilyDesc: 'Детская йога, пренатальные классы, практики для пожилых людей. Что-то особенное для каждого члена семьи.',
      yourWay: 'Ваша Йога, Ваш Путь',
      yourWayDesc: 'Организуйте свою практику как ваше любимое приложение для потоковой передачи музыки. Умные плейлисты, которые адаптируются к вашему расписанию и настроению.',
      favoritesCollection: 'Коллекция избранного для быстрого доступа',
      recentlyPlayed: 'История недавно воспроизведенных',
      customPlaylists: 'Пользовательские плейлисты для разных настроений',
      smartRecommendations: 'Умные рекомендации на основе практики',
      exploreMyPractice: 'Исследовать Мою Практику',
      connectDeeper: 'Установите Более Глубокую Связь с Учителями',
      connectDeeperDesc: 'Выйдите за рамки записанных классов. Присоединяйтесь к живым вебинарам, бронируйте персональные сессии и получайте индивидуальное руководство от мирового класса инструкторов.',
      liveWebinars: 'Живые Вебинары',
      liveWebinarsDesc: 'Присоединяйтесь к интерактивным сессиям с экспертными учителями',
      privateClasses: 'Приватные Классы',
      privateClassesDesc: 'Индивидуальные сессии, адаптированные специально для вас',
      meetTeachers: 'Познакомиться с Учителями',
      familyWellness: 'Семейное Благополучие',
      yogaForFamily: 'Йога для Каждого Члена Семьи',
      familyDesc: 'От детской йоги до классов для пожилых людей, у нас есть что-то особенное для каждого в вашей семье',
      kidsTeens: 'Дети и Подростки',
      kidsDesc: 'Веселая, увлекательная йога, которая развивает уверенность и гибкость для молодых умов и тел',
      exploreKids: 'Изучить Детские Классы',
      prenatalPostnatal: 'Пренатальные и Постнатальные',
      prenatalDesc: 'Безопасные, заботливые практики для будущих и новых мам',
      viewPrenatal: 'Посмотреть Пренатальные Классы',
      seniorFriendly: 'Для Пожилых',
      seniorDesc: 'Мягкие, доступные практики, разработанные для зрелых тел и активного старения',
      seniorPrograms: 'Программы для Пожилых',
      readyTransform: 'Готовы Трансформировать Вашу Практику?',
      transformDesc: 'Присоединяйтесь к тысячам, кто открыл свою идеальную практику йоги. Начните бесплатную пробную версию сегодня и ощутите разницу.',
      noCard: 'Кредитная карта не требуется • Отмена в любое время • 14-дневная бесплатная пробная версия'
    },
    en: {
      title: 'Find Your Perfect',
      subtitle: 'Yoga Practice',
      description: 'Discover teachers you\'ll love, customize every aspect of your practice, and connect deeper with personalized guidance',
      startTrial: 'Start Free Trial',
      browseClasses: 'Browse All Classes',
      whyLove: 'Why You\'ll Love Dzen Yoga',
      whyDescription: 'Every feature designed to make your practice perfect for you',
      findTeachers: 'Find Teachers You Love',
      findTeachersDesc: 'Browse detailed profiles, teaching styles, and student reviews to discover instructors who resonate with your journey.',
      customizeEverything: 'Customize Everything',
      customizeDesc: 'Filter by duration, intensity, style, focus area, and more. Every class perfectly matched to your needs and schedule.',
      perfectTiming: 'Perfect Timing',
      perfectTimingDesc: 'From 5-minute morning stretches to 90-minute deep flows. Find classes that fit your schedule, not the other way around.',
      crystalClear: 'Crystal Clear HD',
      crystalClearDesc: 'Every pose, every alignment cue captured in beautiful detail. Never miss a movement with our studio-quality video.',
      smartPlaylists: 'Smart Playlists',
      smartPlaylistsDesc: 'Create custom sequences for different moods and goals. Your personal yoga journey, perfectly curated.',
      forFamily: 'For The Whole Family',
      forFamilyDesc: 'Kids yoga, prenatal classes, senior-friendly practices. Something special for every family member.',
      yourWay: 'Your Yoga, Your Way',
      yourWayDesc: 'Organize your practice like your favorite music streaming app. Smart playlists that adapt to your schedule and mood.',
      favoritesCollection: 'Favorites collection for quick access',
      recentlyPlayed: 'Recently played history',
      customPlaylists: 'Custom playlists for different moods',
      smartRecommendations: 'Smart recommendations based on practice',
      exploreMyPractice: 'Explore My Practice',
      connectDeeper: 'Connect Deeper with Teachers',
      connectDeeperDesc: 'Go beyond recorded classes. Join live webinars, book personal sessions, and receive individual guidance from world-class instructors.',
      liveWebinars: 'Live Webinars',
      liveWebinarsDesc: 'Join interactive sessions with expert teachers',
      privateClasses: 'Private Classes',
      privateClassesDesc: 'One-on-one sessions tailored just for you',
      meetTeachers: 'Meet Our Teachers',
      familyWellness: 'Family Wellness',
      yogaForFamily: 'Yoga for Every Family Member',
      familyDesc: 'From toddler yoga to senior-friendly classes, we have something special for everyone in your family',
      kidsTeens: 'Kids & Teens',
      kidsDesc: 'Fun, engaging yoga that builds confidence and flexibility for young minds and bodies',
      exploreKids: 'Explore Kids Classes',
      prenatalPostnatal: 'Prenatal & Postnatal',
      prenatalDesc: 'Safe, nurturing practices for expecting and new mothers',
      viewPrenatal: 'View Prenatal Classes',
      seniorFriendly: 'Senior Friendly',
      seniorDesc: 'Gentle, accessible practices designed for mature bodies and active aging',
      seniorPrograms: 'Senior Programs',
      readyTransform: 'Ready to Transform Your Practice?',
      transformDesc: 'Join thousands who have discovered their perfect yoga practice. Start your free trial today and experience the difference.',
      noCard: 'No credit card required • Cancel anytime • 14-day free trial'
    },
    'es-MX': {
      title: 'Encuentra Tu Perfecta',
      subtitle: 'Práctica de Yoga',
      description: 'Descubre maestros que amarás, personaliza cada aspecto de tu práctica y conecta más profundamente con orientación personalizada',
      startTrial: 'Comenzar Prueba Gratis',
      browseClasses: 'Ver Todas las Clases',
      whyLove: 'Por Qué Amarás Dzen Yoga',
      whyDescription: 'Cada función diseñada para hacer tu práctica perfecta para ti',
      findTeachers: 'Encuentra Maestros que Ames',
      findTeachersDesc: 'Navega perfiles detallados, estilos de enseñanza y reseñas de estudiantes para descubrir instructores que resuenen con tu viaje.',
      customizeEverything: 'Personaliza Todo',
      customizeDesc: 'Filtra por duración, intensidad, estilo, área de enfoque y más. Cada clase perfectamente adaptada a tus necesidades y horario.',
      perfectTiming: 'Tiempo Perfecto',
      perfectTimingDesc: 'Desde estiramientos matutinos de 5 minutos hasta flujos profundos de 90 minutos. Encuentra clases que se adapten a tu horario.',
      crystalClear: 'HD Cristalino',
      crystalClearDesc: 'Cada postura, cada indicación de alineación capturada en hermosos detalles. Nunca te pierdas un movimiento con nuestro video de calidad de estudio.',
      smartPlaylists: 'Listas Inteligentes',
      smartPlaylistsDesc: 'Crea secuencias personalizadas para diferentes estados de ánimo y objetivos. Tu viaje personal de yoga, perfectamente curado.',
      forFamily: 'Para Toda la Familia',
      forFamilyDesc: 'Yoga para niños, clases prenatales, prácticas para adultos mayores. Algo especial para cada miembro de la familia.',
      yourWay: 'Tu Yoga, Tu Manera',
      yourWayDesc: 'Organiza tu práctica como tu aplicación favorita de música en streaming. Listas inteligentes que se adaptan a tu horario y estado de ánimo.',
      favoritesCollection: 'Colección de favoritos para acceso rápido',
      recentlyPlayed: 'Historial de reproducidos recientemente',
      customPlaylists: 'Listas personalizadas para diferentes estados de ánimo',
      smartRecommendations: 'Recomendaciones inteligentes basadas en la práctica',
      exploreMyPractice: 'Explorar Mi Práctica',
      connectDeeper: 'Conecta Más Profundamente con Maestros',
      connectDeeperDesc: 'Ve más allá de las clases grabadas. Únete a seminarios en vivo, reserva sesiones personales y recibe orientación individual de instructores de clase mundial.',
      liveWebinars: 'Seminarios en Vivo',
      liveWebinarsDesc: 'Únete a sesiones interactivas con maestros expertos',
      privateClasses: 'Clases Privadas',
      privateClassesDesc: 'Sesiones uno a uno adaptadas solo para ti',
      meetTeachers: 'Conoce a Nuestros Maestros',
      familyWellness: 'Bienestar Familiar',
      yogaForFamily: 'Yoga para Cada Miembro de la Familia',
      familyDesc: 'Desde yoga para niños pequeños hasta clases para adultos mayores, tenemos algo especial para todos en tu familia',
      kidsTeens: 'Niños y Adolescentes',
      kidsDesc: 'Yoga divertido y atractivo que desarrolla confianza y flexibilidad para mentes y cuerpos jóvenes',
      exploreKids: 'Explorar Clases para Niños',
      prenatalPostnatal: 'Prenatal y Postnatal',
      prenatalDesc: 'Prácticas seguras y nutritivas para madres embarazadas y nuevas',
      viewPrenatal: 'Ver Clases Prenatales',
      seniorFriendly: 'Amigable para Adultos Mayores',
      seniorDesc: 'Prácticas suaves y accesibles diseñadas para cuerpos maduros y envejecimiento activo',
      seniorPrograms: 'Programas para Adultos Mayores',
      readyTransform: '¿Listo para Transformar Tu Práctica?',
      transformDesc: 'Únete a miles que han descubierto su práctica perfecta de yoga. Comienza tu prueba gratuita hoy y experimenta la diferencia.',
      noCard: 'No se requiere tarjeta de crédito • Cancela en cualquier momento • Prueba gratuita de 14 días'
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.en;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

function FeatureCard({ icon, title, description, image }: FeatureCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
      <div className="aspect-[4/3] relative">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 mb-3">
            {icon}
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function HomePage({ params }: { params?: { locale?: string } } = {}) {
  // Extract locale from URL or default to 'ru'
  const currentLocale = params?.locale || 'ru';
  
  // Load messages from the message files
  const messages = await getMessages(currentLocale);
  
  // Get extended translations for homepage content
  const t = getExtendedTranslations(currentLocale);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header with Language Toggle */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-end">
            <SimpleLanguageToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-16">
        {/* Hero Section */}
        <section 
          className="relative min-h-[90vh] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-zen-5), var(--color-zen-4), var(--color-zen-3))'
          }}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30" />
          
          <div className="relative container mx-auto px-4 py-20 flex flex-col justify-center min-h-[90vh]">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-8 drop-shadow-2xl">
                {messages.homeTitle || t.title}
                <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent block">
                  {messages.homeSubtitle || t.subtitle}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                {t.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="text-lg px-8 py-4 bg-white hover:bg-gray-100"
                  style={{ color: 'var(--color-zen-5)' }}
                >
                  <Link href="/sign-up">
                    {messages.common?.signUp || t.startTrial}
                  </Link>
                </Button>
                
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 zen-gradient border-0 text-white hover:zen-gradient-hover transition-all duration-300"
                >
                  <Link href="/browse">
                    {messages.navigation?.browse || t.browseClasses}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {t.whyLove}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.whyDescription}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <FeatureCard
                icon={<Heart className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
                title={t.findTeachers}
                description={t.findTeachersDesc}
                image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80"
              />
              
              <FeatureCard
                icon={<Settings className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
                title={t.customizeEverything}
                description={t.customizeDesc}
                image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80"
              />
              
              <FeatureCard
                icon={<Clock className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
                title={t.perfectTiming}
                description={t.perfectTimingDesc}
                image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80"
              />
              
              <FeatureCard
                icon={<Video className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
                title={t.crystalClear}
                description={t.crystalClearDesc}
                image="https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=500&q=80"
              />
              
              <FeatureCard
                icon={<PlayCircle className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
                title={t.smartPlaylists}
                description={t.smartPlaylistsDesc}
                image="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=500&q=80"
              />
              
              <FeatureCard
                icon={<Users className="size-12" style={{ color: 'var(--color-zen-5)' }} />}
                title={t.forFamily}
                description={t.forFamilyDesc}
                image="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=500&q=80"
              />
            </div>
          </div>
        </section>

        {/* Playlist Features Section */}
        <section 
          className="py-24"
          style={{ background: 'linear-gradient(135deg, rgb(199, 214, 212, 0.3), rgb(159, 178, 176, 0.3))' }}
        >
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
                  <Headphones className="w-4 h-4 mr-2" />
                  Playlist Features
                </Badge>
                
                <h2 className="text-4xl font-bold mb-6">{t.yourWay}</h2>
                
                <p className="text-xl text-gray-600 mb-8">
                  {t.yourWayDesc}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{t.favoritesCollection}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{t.recentlyPlayed}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{t.customPlaylists}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-lg">{t.smartRecommendations}</span>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="zen-gradient hover:zen-gradient-hover text-white transition-all duration-300"
                >
                  <Link href="/my_practice">
                    {messages.navigation?.myPractice || t.exploreMyPractice} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80"
                    alt="Yoga playlist interface"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 max-w-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <CirclePlay className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Morning Flow</span>
                  </div>
                  <p className="text-sm text-gray-600">5 classes • 45 min total</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Connection Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80"
                    alt="Live yoga webinar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <Badge className="mb-4 bg-red-100 text-red-700 border-red-200">
                  <Video className="w-4 h-4 mr-2" />
                  Live Connection
                </Badge>
                
                <h2 className="text-4xl font-bold mb-6">{t.connectDeeper}</h2>
                
                <p className="text-xl text-gray-600 mb-8">
                  {t.connectDeeperDesc}
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <Calendar className="w-8 h-8 text-blue-500 mb-3" />
                    <h3 className="font-semibold mb-2">{t.liveWebinars}</h3>
                    <p className="text-sm text-gray-600">
                      {t.liveWebinarsDesc}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <Star className="w-8 h-8 text-yellow-500 mb-3" />
                    <h3 className="font-semibold mb-2">{t.privateClasses}</h3>
                    <p className="text-sm text-gray-600">
                      {t.privateClassesDesc}
                    </p>
                  </div>
                </div>
                
                <Button 
                  asChild 
                  className="zen-gradient hover:zen-gradient-hover text-white transition-all duration-300"
                >
                  <Link href="/teachers">
                    {messages.navigation?.teachers || t.meetTeachers} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Family Section */}
        <section 
          className="py-24"
          style={{ background: 'linear-gradient(135deg, rgb(232, 232, 232, 0.5), rgb(199, 214, 212, 0.5))' }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">
                <Baby className="w-4 h-4 mr-2" />
                {t.familyWellness}
              </Badge>
              
              <h2 className="text-4xl font-bold mb-6">{t.yogaForFamily}</h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t.familyDesc}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=400&q=80"
                    alt="Kids yoga"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{t.kidsTeens}</h3>
                  <p className="text-gray-600 mb-4">
                    {t.kidsDesc}
                  </p>
                  <Button variant="outline" size="sm">
                    {t.exploreKids}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80"
                    alt="Prenatal yoga"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{t.prenatalPostnatal}</h3>
                  <p className="text-gray-600 mb-4">
                    {t.prenatalDesc}
                  </p>
                  <Button variant="outline" size="sm">
                    {t.viewPrenatal}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80"
                    alt="Senior yoga"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{t.seniorFriendly}</h3>
                  <p className="text-gray-600 mb-4">
                    {t.seniorDesc}
                  </p>
                  <Button variant="outline" size="sm">
                    {t.seniorPrograms}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-24 text-white"
          style={{ background: 'linear-gradient(135deg, var(--color-zen-5), var(--color-zen-4))' }}
        >
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t.readyTransform}
            </h2>
            
            <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
              {t.transformDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 py-4 bg-white hover:bg-gray-100"
                style={{ color: 'var(--color-zen-5)' }}
              >
                <Link href="/sign-up">
                  {messages.common?.signUp || t.startTrial}
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4 zen-gradient border-0 text-white hover:zen-gradient-hover transition-all duration-300"
              >
                <Link href="/browse">
                  {messages.navigation?.browse || t.browseClasses}
                </Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm opacity-75">
              {t.noCard}
            </p>
          </div>
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
} 