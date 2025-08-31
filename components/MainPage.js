import { useState, useEffect } from 'react';
import { FiShoppingCart, FiHelpCircle, FiPackage, FiPlus, FiChevronDown, FiChevronRight, FiMoreVertical, FiCheck } from 'react-icons/fi';
import { CATEGORIES, STATUSES, SUBGROUP_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function MainPage({ items, onOpenSubgroup, onOpenAdd, onUpdateItem, onDeleteItem }) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getItemsByCategory = (category) => {
    return items.filter(item => item.category === category);
  };

  const getItemsBySubgroup = (categoryItems, status) => {
    return categoryItems.filter(item => 
      status === STATUSES.NEED ? (!item.status || item.status === STATUSES.NEED) : item.status === status
    );
  };

  const getItemsToTakeCount = () => {
    return items.filter(item => !item.status || item.status !== STATUSES.TAKEN).length;
  };

  const getSubgroupCount = (status) => {
    return items.filter(item => 
      status === STATUSES.NEED ? (!item.status || item.status === STATUSES.NEED) : item.status === status
    ).length;
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

  const renderItem = (item) => {
    const currentStatus = item.status || STATUSES.NEED;
    const showCheckbox = currentStatus !== STATUSES.TAKEN;
    
    return (
      <div key={item.id} className="item-row">
        <div className="flex items-center flex-1">
          {showCheckbox && (
            <button
              onClick={() => handleCheckboxChange(item.id)}
              className="mr-3 w-6 h-6 border-2 border-gray-300 rounded flex items-center justify-center hover:border-green-500 transition-colors"
            >
              <FiPackage className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {currentStatus === STATUSES.TAKEN && (
            <div className="mr-3 w-6 h-6 bg-green-500 rounded flex items-center justify-center">
              <FiCheck className="w-4 h-4 text-white" />
            </div>
          )}
          <span className={`${currentStatus === STATUSES.TAKEN ? 'line-through text-gray-500' : ''}`}>
            {item.name}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(dropdownOpen === item.id ? null : item.id)}
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
    );
  };

  const renderSubgroup = (categoryItems, status, title, bgColor) => {
    const subgroupItems = getItemsBySubgroup(categoryItems, status);
    
    if (subgroupItems.length === 0) return null;
    
    return (
      <div className="mb-3">
        <div className={`subgroup-header ${bgColor}`}>
          {title}
        </div>
        <div className="bg-white border border-gray-200 rounded-b-lg">
          {subgroupItems
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .map(renderItem)}
        </div>
      </div>
    );
  };

  const renderCategory = (category) => {
    const categoryItems = getItemsByCategory(category);
    if (categoryItems.length === 0) return null;

    const isExpanded = expandedCategories[category];

    return (
      <div key={category} className="mb-4">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <span className="font-medium">{category}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">({categoryItems.length})</span>
            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {renderSubgroup(categoryItems, STATUSES.NEED, 'Нужно взять', SUBGROUP_COLORS[STATUSES.NEED])}
            {renderSubgroup(categoryItems, STATUSES.BUY, 'Купить', SUBGROUP_COLORS[STATUSES.BUY])}
            {renderSubgroup(categoryItems, STATUSES.THINK, 'Подумать', SUBGROUP_COLORS[STATUSES.THINK])}
            {renderSubgroup(categoryItems, STATUSES.TAKEN, 'Взял', SUBGROUP_COLORS[STATUSES.TAKEN])}
          </div>
        )}
      </div>
    );
  };

  // Закрываем dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Кнопки подгрупп */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => onOpenSubgroup(STATUSES.BUY)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          <FiShoppingCart className="w-4 h-4" />
          <span>Купить</span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            {getSubgroupCount(STATUSES.BUY)}
          </span>
        </button>
        
        <button
          onClick={() => onOpenSubgroup(STATUSES.THINK)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          <FiHelpCircle className="w-4 h-4" />
          <span>Подумать</span>
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
            {getSubgroupCount(STATUSES.THINK)}
          </span>
        </button>
        
        <button
          onClick={() => onOpenSubgroup(STATUSES.TAKEN)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
        >
          <FiPackage className="w-4 h-4" />
          <span>Взял</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            {getSubgroupCount(STATUSES.TAKEN)}
          </span>
        </button>
        
        <button
          onClick={onOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg ml-auto"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Счётчик */}
      <div className="mb-6 text-lg font-medium">
        Нужно взять: {getItemsToTakeCount()}
      </div>

      {/* Категории */}
      <div className="space-y-4">
        {CATEGORIES.map(renderCategory)}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FiPackage className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Список пуст</p>
          <p className="text-sm">Нажмите "+" чтобы добавить вещи</p>
        </div>
      )}
    </div>
  );
}