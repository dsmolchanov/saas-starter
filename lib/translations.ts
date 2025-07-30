// Utility for server-side translations
export function getErrorTranslations(locale: string = 'ru') {
  const translations = {
    ru: {
      titleRequired: 'Название обязательно',
      unauthenticated: 'Не авторизован',
      classNotFound: 'Занятие не найдено',
      failedToFetchClasses: 'Не удалось загрузить занятия',
      failedToCreateClass: 'Не удалось создать занятие',
      failedToUpdateClass: 'Не удалось обновить занятие',
      failedToDeleteClass: 'Не удалось удалить занятие',
      invalidCourse: 'Неверный курс или у вас нет прав на добавление занятий в этот курс',
      invalidCourseAssignment: 'Неверный курс или у вас нет прав на назначение этого занятия курсу',
    },
    en: {
      titleRequired: 'Title is required',
      unauthenticated: 'Unauthenticated',
      classNotFound: 'Class not found',
      failedToFetchClasses: 'Failed to fetch classes',
      failedToCreateClass: 'Failed to create class',
      failedToUpdateClass: 'Failed to update class',
      failedToDeleteClass: 'Failed to delete class',
      invalidCourse: 'Invalid course or you do not have permission to add classes to this course',
      invalidCourseAssignment: 'Invalid course or you do not have permission to assign this class to that course',
    },
    'es-MX': {
      titleRequired: 'El título es obligatorio',
      unauthenticated: 'No autenticado',
      classNotFound: 'Clase no encontrada',
      failedToFetchClasses: 'Error al cargar las clases',
      failedToCreateClass: 'Error al crear la clase',
      failedToUpdateClass: 'Error al actualizar la clase',
      failedToDeleteClass: 'Error al eliminar la clase',
      invalidCourse: 'Curso inválido o no tienes permisos para agregar clases a este curso',
      invalidCourseAssignment: 'Curso inválido o no tienes permisos para asignar esta clase a ese curso',
    }
  };
  
  return translations[locale as keyof typeof translations] || translations.ru;
}