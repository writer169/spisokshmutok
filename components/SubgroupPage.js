import { useState, useEffect } from 'react';
import { FiArrowLeft, FiCopy, FiMoreVertical, FiCheck, FiPackage } from 'react-icons/fi';
import { CATEGORIES, STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function SubgroupPage({ items, subgroup, onBack, onUpdateItem, onDeleteItem }) {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const getFilteredItems = () => {
    return items
      .filter(item => 
        subgroup === STATUSES.NEED 
          ? (!item.status || item.status === STATUSES.NEED)
          : item.status === subgroup
      )
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  };

  const handleCopy = () => {
    const filteredItems = getFilteredItems();
    
    if (filteredItems.length === 0) {
      toast.error('Нет вещей для копирования');
      return;
    }

    // Группируем по категориям
    const itemsByCategory = {};
    filteredItems.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item.name);
    });

    // Формируем текст
    let text = `Подгруппа: ${subgroup}\n`;
    CATEGORIES.forEach(category => {
      if (itemsByCategory[category] && itemsByCategory[category].length > 0) {
        text += `${category}:\n`;
        itemsByCategory[category].forEach(name => {
          text += `- ${name}\n`;
        });
      }
    });

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Скопировано в буфер обмена');
    }).catch(() => {
      toast.error('Ошибка копирования');
    });
  };

  const handleCheckboxChange = (itemId) => {
    onUpdateItem(itemId, { status: STATUSES.TAKEN });
  };

  const handleStatusChange = (itemId, newStatus) => {
    onUpdateItem(itemId, { status: newStatus });
    setDropdownOpen(null);
  };

  const handleDelete = (itemId, itemName) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Удалить "{itemName}"?</span>
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onClick={() => {
              onDeleteItem(itemId);
              toast.dismiss(t.id);
            }}
          >
            Удалить
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Отмена
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const renderDropdownOptions = (item) => {
    const currentStatus = item.status || STATUSES.NEED;
    
    const options = [];
    
    if (currentStatus === STATUSES.NEED) {
      options.push({ label: 'Купить', action: () => handleStatusChange(item.id, STATUSES.BUY) });
      options.push({ label: 'Подумать', action: () => handleStatusChange(item.id, STATUSES.THINK) });
    } else if (currentStatus === STATUSES.BUY) {
      options.push({ label: 'Купил', action: () => handleStatusChange(item.id, STATUSES.NEED) });
      options.push({ label: 'Подумать', action: () => handleStatusChange(item.id, STATUSES.THINK) });
    } else if (currentStatus === STATUSES.THINK) {
      options.push({ label: 'Нужно взять', action: () => handleStatusChange(item.id, STATUSES.NEED) });
      options.push({ label: 'Купить', action: () => handleStatusChange(item.id, STATUSES.BUY) });
    } else if (currentStatus === STATUSES.TAKEN) {
      options.push({ label: 'Вернуть в Нужно взять', action: () => handleStatusChange(item.id, STATUSES.NEED) });
      options.push({ label: 'Купить', action: () => handleStatusChange(item.id, STATUSES.BUY) });
      options.push({ label: 'Подумать', action: () => handleStatusChange(item.id, STATUSES.THINK) });
    }
    
    options.push({ label: 'Удалить', action: () => handleDelete(item.id, item.name), danger: true });
    
    return options;
  };

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredItems = getFilteredItems();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">{subgroup}</h1>
        </div>
        
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title="Скопировать список"
        >
          <FiCopy className="w-5 h-5" />
        </button>
      </div>

      {/* Список вещей */}
      <div className="bg-white">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Список пуст</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="item-row">
              <div className="flex items-center flex-1">
                {subgroup !== STATUSES.TAKEN && (
                  <button
                    onClick={() => handleCheckboxChange(item.id)}
                    className="mr-3 w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center hover:border-green-500 transition-colors"
                  >
                    <FiPackage className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                {subgroup === STATUSES.TAKEN && (
                  <div className="mr-3 w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className={`${subgroup === STATUSES.TAKEN ? 'line-through text-gray-500' : ''}`}>
                    {item.name}
                  </span>
                  <span className="text-sm text-gray-500">({item.category})</span>
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === item.id ? null : item.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <FiMoreVertical className="w-4 h-4" />
                </button>
                
                {dropdownOpen === item.id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                    {renderDropdownOptions(item).map((option, idx) => (
                      <button
                        key={idx}
                        onClick={option.action}
                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                          option.danger ? 'text-red-600' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}