import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainPage from '../../components/MainPage';
import SubgroupPage from '../../components/SubgroupPage';
import AddItemPage from '../../components/AddItemPage';
import toast from 'react-hot-toast';

export default function TripPage() {
  const router = useRouter();
  const { uuid, key } = router.query;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('main');
  const [currentSubgroup, setCurrentSubgroup] = useState(null);

  useEffect(() => {
    if (uuid && key) {
      loadTrip();
    }
  }, [uuid, key]);

  const loadTrip = async () => {
    try {
      const response = await fetch(`/api/trip/${uuid}?key=${key}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки поездки');
      }
      const data = await response.json();
      setItems(data.items);
      
      // Сохраняем в localStorage для оффлайн
      localStorage.setItem(`trip_${uuid}_${key}`, JSON.stringify(data.items));
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      
      // Пытаемся загрузить из localStorage
      const cached = localStorage.getItem(`trip_${uuid}_${key}`);
      if (cached) {
        setItems(JSON.parse(cached));
        toast.error('Загружено из кэша. Проверьте соединение.');
      } else {
        toast.error('Ошибка загрузки поездки');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (itemId, updates) => {
    try {
      const response = await fetch(`/api/trip/${uuid}?key=${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, updates })
      });

      if (!response.ok) {
        throw new Error('Ошибка обновления');
      }

      // Обновляем локальное состояние
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
      ));
      
      // Обновляем кэш
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
      );
      localStorage.setItem(`trip_${uuid}_${key}`, JSON.stringify(updatedItems));
      
    } catch (error) {
      console.error('Ошибка обновления:', error);
      toast.error('Ошибка обновления вещи');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`/api/trip/${uuid}?key=${key}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      // Обновляем локальное состояние
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      
      // Обновляем кэш
      localStorage.setItem(`trip_${uuid}_${key}`, JSON.stringify(updatedItems));
      
      toast.success('Вещь удалена');
    } catch (error) {
      console.error('Ошибка удаления:', error);
      toast.error('Ошибка удаления вещи');
    }
  };

  const addItems = async (newItems) => {
    try {
      const response = await fetch(`/api/trip/${uuid}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newItems })
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления');
      }

      // Перезагружаем данные
      await loadTrip();
      toast.success('Вещи добавлены');
    } catch (error) {
      console.error('Ошибка добавления:', error);
      toast.error('Ошибка добавления вещей');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!uuid || !key) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Неверная ссылка</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'subgroup':
        return (
          <SubgroupPage
            items={items}
            subgroup={currentSubgroup}
            onBack={() => setCurrentPage('main')}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
          />
        );
      case 'add':
        return (
          <AddItemPage
            uuid={uuid}
            accessKey={key}
            onBack={() => setCurrentPage('main')}
            onAddItems={addItems}
          />
        );
      default:
        return (
          <MainPage
            items={items}
            onOpenSubgroup={(subgroup) => {
              setCurrentSubgroup(subgroup);
              setCurrentPage('subgroup');
            }}
            onOpenAdd={() => setCurrentPage('add')}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderPage()}
    </div>
  );
}