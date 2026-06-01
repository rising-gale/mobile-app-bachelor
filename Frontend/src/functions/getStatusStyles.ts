// Функция для определения цвета бейджа статуса
const getStatusStyles = (result?: string) => {
  switch (result) {
    case 'OK':
    case 'Ok':
      return { container: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' };
    case 'Denied':
    case 'DENIED':
      return { container: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' };
    case 'Problematic':
    case 'PROBLEMATIC':
      return { container: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' };
    default:
      return { container: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400' };
  }
};

export default getStatusStyles;