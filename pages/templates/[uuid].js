import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TemplatesPage from '../../components/TemplatesPage';

export default function ServicePage() {
  const router = useRouter();
  const { uuid, key } = router.query;
  const [tripItems, setTripItems] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uuid && key) {
      loadData();
    }
  }, [uuid, key]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем данные поездки
      const tripResponse = await fetch(`/api/trip/${uuid}?key=${key}`);
      if (!tripResponse.ok) {
        throw new Error('Ошибка загрузки поездки');
      }
      const tripData = await tripResponse.json();
      setTripItems(tripData.items);

      // Загружаем шаблоны
      const templatesResponse = await fetch('/api/templates');
      if (!templatesResponse.ok) {
        throw new Error('Ошибка загрузки шаблонов');
      }
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData.templates);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
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

  return (
    <TemplatesPage
      uuid={uuid}
      accessKey={key}
      tripItems={tripItems}
      templates={templates}
      onReload={loadData}
    />
  );
}