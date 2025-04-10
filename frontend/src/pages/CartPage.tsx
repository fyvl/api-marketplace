import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function CartPage() {
  const { items, loading, error, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Состояние для отображения диалога очистки корзины
  const [showClearCartDialog, setShowClearCartDialog] = useState(false);
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Корзина</h1>
        <p className="mb-6">Для доступа к корзине необходимо авторизоваться</p>
        <Button asChild>
          <Link to="/login">Войти</Link>
        </Button>
      </div>
    );
  }
  
  if (loading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <p>Загрузка...</p>
      </div>
    );
  }
  
  if (error && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Корзина</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Повторить попытку
        </Button>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Корзина пуста</h1>
        <p className="mb-6">В вашей корзине пока нет товаров</p>
        <Button asChild>
          <Link to="/apis">Перейти в каталог API</Link>
        </Button>
      </div>
    );
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateQuantity = (itemId: number, value: string) => {
    const quantity = parseInt(value);
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(itemId, quantity);
    }
  };
  
  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
  };
  
  const handleClearCart = () => {
    clearCart();
    setShowClearCartDialog(false);
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Корзина</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="px-6">
              <div className="flex justify-between items-center">
                <CardTitle>Товары в корзине</CardTitle>
                <AlertDialog open={showClearCartDialog} onOpenChange={setShowClearCartDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Очистить корзину
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Очистить корзину?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие удалит все товары из вашей корзины. 
                        Вы уверены, что хотите продолжить?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearCart}>
                        Очистить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">API</TableHead>
                    <TableHead>Тариф</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/apis/${item.api.id}`}
                          className="hover:text-blue-600"
                        >
                          {item.api.name} (v{item.api.version})
                        </Link>
                        <div className="text-sm text-gray-500">
                          Тип: {item.api.type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {item.plan.money_type.types_of_use}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.plan.unit_of_payment}
                        </div>
                      </TableCell>
                      <TableCell>{item.price} ₽</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Оформление заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span>Товаров:</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Подытог:</span>
                <span>{total} ₽</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Итого:</span>
                <span>{total} ₽</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
              >
                Оформить заказ
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}