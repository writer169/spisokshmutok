import { useState } from 'react';
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
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a