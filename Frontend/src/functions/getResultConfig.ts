// Конфигурация стилей для результатов проверок
const getResultConfig = (result?: string) => {
  switch (result?.toUpperCase()) {
    case 'OK':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        icon: 'check-circle-outline',
        label: 'Перевірку пройдено',
      };
    case 'DENIED':
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/30',
        icon: 'close-circle-outline',
        label: 'В доступі відмовлено',
      };
    case 'PROBLEMATIC':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/30',
        icon: 'alert-circle-outline',
        label: 'Проблемний транспорт',
      };
    default:
      return {
        text: 'text-slate-400',
        bg: 'bg-slate-500/10 border-slate-500/30',
        icon: 'help-circle-outline',
        label: result || 'Невідомий статус',
      };
  }
};

export default getResultConfig;