import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { CATEGORIES, STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function AddItemPage({ uuid, accessKey, onBack, onAddItems }) {
  const [mode, setMode] = useState(null); // 'list' или 'manual'
  const [templates, setTemplates] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(STATUSES.BUY);
  
  // Для ручного добавления
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Прочее');
  const [itemStatus, setItemStatus] = useState(STATUSES.BUY);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'list') {
      loadTemplates();
    }
  }, [mode]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Ошибка загрузки шаблонов');
      }
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Ошибка загрузки шаблонов:', error);
      toast.error('Ошибка загрузки шаблонов');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (template) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item._id === template._id);
      if (isSelected) {
        return prev.filter(item => item._id !== template._id);
      } else {
        return [...prev, template];
      }
    });
  };

  const handleSaveFromList = async () => {
    if (selectedItems.length === 0) {
      toast.error('Выберите вещи для добавления');
      return;
    }

    const itemsToAdd = selectedItems.map(template => ({
      name: template.name,
      category: template.category,
      status: selectedStatus,
      createdAt: new Date()
    }));

    await onAddItems(itemsToAdd);
    onBack();
  };

  const handleSaveManual = async () => {
    if (!itemName.trim()) {
      toast.error('Введите название вещи');
      return;
    }

    const newItem = {
      name: itemName.trim(),
      category: itemCategory,
      status: itemStatus,
      createdAt: new Date()
    };

    // Добавляем в шаблоны
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: [{ name: newItem.name, category: newItem.category }] 
        })
      });
    } catch (error) {
      console.error('Ошибка добавления в шаблоны:', error);
    }

    await onAddItems([newItem]);
    onBack();
  };

  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Добавить вещи</h1>
        </div>

        <div className="p-4 space-y-4">
          <button
            onClick={() => setMode('list')}
            className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium mb-2">Из списка</div>
            <div className="text-sm text-gray-600">Выберите вещи из готового списка</div>
          </button>
          
          <button
            onClick={() => setMode('manual')}
            className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div className="font-medium mb-2">Вручную</div>
            <div className="text-sm text-gray-600">Добавьте новую вещь</div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'list') {
    const itemsByCategory = {};
    templates.forEach(template => {
      if (!itemsByCategory[template.category]) {
        itemsByCategory[template.category] = [];
      }
      itemsByCategory[template.category].push(template);
    });

    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setMode(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Выбрать из списка</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg">Загрузка...</div>
          </div>
        ) : (
          <div className="p-4">
            {/* Статус для всех выбранных */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium mb-2">
                Статус для выбранных вещей:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value={STATUSES.BUY}>Купить</option>
                <option value={STATUSES.THINK}>Подумать</option>
                <option value={STATUSES.TAKEN}>Взял</option>
              </select>
            </div>

            {/* Список шаблонов по категориям */}
            <div className="space-y-4">
              {CATEGORIES.map(category => {
                const categoryTemplates = itemsByCategory[category] || [];
                if (categoryTemplates.length === 0) return null;

                return (
                  <div key={category} className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-3 border-b border-gray-200 font-medium">
                      {category}
                    </div>
                    <div className="p-2">
                      {categoryTemplates.map(template => (
                        <label
                          key={template._id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.some(item => item._id === template._id)}
                            onChange={() => handleSelectItem(template)}
                            className="w-4 h-4 text-green-600"
                          />
                          <span>{template.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Кнопка сохранения */}
            <div className="sticky bottom-4 mt-6">
              <button
                onClick={handleSaveFromList}
                disabled={selectedItems.length === 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Сохранить ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'manual') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setMode(null)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Добавить вруч