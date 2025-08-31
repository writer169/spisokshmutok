import { useState } from 'react';
import { FiTrash2, FiEdit2, FiUpload, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { CATEGORIES, STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function TemplatesPage({ uuid, accessKey, tripItems, templates, onReload }) {
  const [selectedTripItems, setSelectedTripItems] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', category: 'Прочее' });
  const [importData, setImportData] = useState('');

  const handleSelectTripItem = (itemId) => {
    setSelectedTripItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleDeleteSelectedTripItems = async () => {
    if (selectedTripItems.length === 0) {
      toast.error('Выберите вещи для удаления');
      return;
    }

    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Удалить {selectedTripItems.length} вещей из поездки?</span>
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onClick={async () => {
              try {
                for (const itemId of selectedTripItems) {
                  await fetch(`/api/trip/${uuid}?key=${accessKey}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId })
                  });
                }
                setSelectedTripItems([]);
                await onReload();
                toast.success('Вещи удалены');
              } catch (error) {
                toast.error('Ошибка удаления');
              }
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

  const handleDeleteAllTripItems = async () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span>Удалить все вещи из поездки?</span>
        <div className="flex gap-2">
          <button
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            onClick={async () => {
              try {
                await fetch(`/api/trip/${uuid}?key=${accessKey}`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ deleteAll: true })
                });
                await onReload();
                toast.success('Все вещи удалены');
              } catch (error) {
                toast.error('Ошибка удаления');
              }
              toast.dismiss(t.id);
            }}
          >
            Удалить все
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

  const handleUpdateTripItem = async (item, field, value) => {
    try {
      await fetch(`/api/trip/${uuid}?key=${accessKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          itemId: item.id, 
          updates: { [field]: value }
        })
      });
      await onReload();
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const handleSaveEditTemplate = async () => {
    try {
      await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate)
      });
      setEditingTemplate(null);
      await onReload();
      toast.success('Шаблон обновлён');
    } catch (error) {
      toast.error('Ошибка обновления шаблона');
    }
  };

  const handleDeleteSelectedTemplates = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Выберите шаблоны для удаления');
      return;
    }

    try {
      await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedTemplates })
      });
      setSelectedTemplates([]);
      await onReload();
      toast.success('Шаблоны удалены');
    } catch (error) {
      toast.error('Ошибка удаления шаблонов');
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast.error('Введите название');
      return;
    }

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: [{ name: newTemplate.name.trim(), category: newTemplate.category }] 
        })
      });
      setNewTemplate({ name: '', category: 'Прочее' });
      await onReload();
      toast.success('Шаблон добавлен');
    } catch (error) {
      toast.error('Ошибка добавления шаблона');
    }
  };

  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      if (!Array.isArray(data)) {
        throw new Error('Данные должны быть массивом');
      }

      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data })
      });
      
      setImportData('');
      await onReload();
      toast.success(`Импортировано ${data.length} шаблонов`);
    } catch (error) {
      toast.error('Ошибка импорта. Проверьте формат JSON');
    }
  };

  const handleExport = () => {
    const exportData = templates.map(t => ({ name: t.name, category: t.category }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Управление поездкой</h1>

      {/* Поездка */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Вещи поездки ({tripItems.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelectedTripItems}
              disabled={selectedTripItems.length === 0}
              className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FiTrash2 className="w-4 h-4 mr-1" />
              Удалить выбранное ({selectedTripItems.length})
            </button>
            <button
              onClick={handleDeleteAllTripItems}
              className="btn-danger text-sm"
            >
              Удалить все
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {tripItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Нет вещей в поездке
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTripItems.length === tripItems.length && tripItems.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTripItems(tripItems.map(item => item.id));
                          } else {
                            setSelectedTripItems([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 text-left">Название</th>
                    <th className="p-3 text-left">Категория</th>
                    <th className="p-3 text-left">Статус</th>
                    <th className="p-3 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {tripItems.map(item => (
                    <tr key={item.id} className="border-t border-gray-200">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedTripItems.includes(item.id)}
                          onChange={() => handleSelectTripItem(item.id)}
                        />
                      </td>
                      <td className="p-3">
                        {editingTrip === item.id ? (
                          <input
                            type="text"
                            defaultValue={item.name}
                            onBlur={(e) => {
                              if (e.target.value !== item.name) {
                                handleUpdateTripItem(item, 'name', e.target.value);
                              }
                              setEditingTrip(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.target.blur();
                              }
                            }}
                            className="w-full p-1 border border-gray-300 rounded"
                            autoFocus
                          />
                        ) : (
                          <span onClick={() => setEditingTrip(item.id)} className="cursor-pointer hover:bg-gray-100 p-1 rounded">
                            {item.name}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateTripItem(item, 'category', e.target.value)}
                          className="p-1 border border-gray-300 rounded"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={item.status || STATUSES.NEED}
                          onChange={(e) => handleUpdateTripItem(item, 'status', e.target.value)}
                          className="p-1 border border-gray-300 rounded"
                        >
                          <option value={STATUSES.NEED}>Нужно взять</option>
                          <option value={STATUSES.BUY}>Купить</option>
                          <option value={STATUSES.THINK}>Подумать</option>
                          <option value={STATUSES.TAKEN}>Взял</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            toast((t) => (
                              <div className="flex flex-col gap-2">
                                <span>Удалить "{item.name}"?</span>
                                <div className="flex gap-2">
                                  <button
                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                    onClick={async () => {
                                      try {
                                        await fetch(`/api/trip/${uuid}?key=${accessKey}`, {
                                          method: 'DELETE',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ itemId: item.id })
                                        });
                                        await onReload();
                                        toast.success('Вещь удалена');
                                      } catch (error) {
                                        toast.error('Ошибка удаления');
                                      }
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
                          }}
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Шаблоны */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Шаблоны ({templates.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelectedTemplates}
              disabled={selectedTemplates.length === 0}
              className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FiTrash2 className="w-4 h-4 mr-1" />
              Удалить выбранное ({selectedTemplates.length})
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary text-sm"
            >
              <FiDownload className="w-4 h-4 mr-1" />
              Экспорт
            </button>
          </div>
        </div>

        {/* Добавление нового шаблона */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">Добавить шаблон</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Название вещи"
              className="flex-1 p-2 border border-gray-300 rounded"
            />
            <select
              value={newTemplate.category}
              onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
              className="p-2 border border-gray-300 rounded"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={handleAddTemplate}
              disabled={!newTemplate.name.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Добавить
            </button>
          </div>
        </div>

        {/* Импорт */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">Импорт JSON</h3>
          <div className="space-y-2">
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='[{"name": "Название", "category": "Категория"}, ...]'
              className="w-full p-2 border border-gray-300 rounded h-24 font-mono text-sm"
            />
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FiUpload className="w-4 h-4 mr-1" />
              Импортировать
            </button>
          </div>
        </div>

        {/* Таблица шаблонов */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {templates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Нет шаблонов
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTemplates.length === templates.length && templates.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTemplates(templates.map(t => t._id));
                          } else {
                            setSelectedTemplates([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 text-left">Название</th>
                    <th className="p-3 text-left">Категория</th>
                    <th className="p-3 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map(template => (
                    <tr key={template._id} className="border-t border-gray-200">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.includes(template._id)}
                          onChange={() => handleSelectTemplate(template._id)}
                        />
                      </td>
                      <td className="p-3">
                        {editingTemplate?._id === template._id ? (
                          <input
                            type="text"
                            value={editingTemplate.name}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-1 border border-gray-300 rounded"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => setEditingTemplate(template)} 
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            {template.name}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {editingTemplate?._id === template._id ? (
                          <select
                            value={editingTemplate.category}
                            onChange={(e) => setEditingTemplate(prev => ({ ...prev, category: e.target.value }))}
                            className="p-1 border border-gray-300 rounded"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          template.category
                        )}
                      </td>
                      <td className="p-3">
                        {editingTemplate?._id === template._id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveEditTemplate}
                              className="text-green-600 hover:bg-green-50 p-1 rounded"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTemplate(null)}
                              className="text-gray-600 hover:bg-gray-50 p-1 rounded"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingTemplate(template)}
                            className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Ссылка на основную страницу */}
      <div className="text-center">
        <a
          href={`/trip/${uuid}?key=${accessKey}`}
          className="btn-primary inline-block"
        >
          Вернуться к списку вещей
        </a>
      </div>
    </div>
  );
}