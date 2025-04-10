import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-7xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Страница не найдена</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Запрашиваемая страница не существует или была перемещена.
        Попробуйте вернуться на главную страницу.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Вернуться назад
        </Button>
        <Button asChild>
          <Link to="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}