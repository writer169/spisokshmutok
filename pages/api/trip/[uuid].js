import clientPromise from '../../../lib/mongodb';
import { STATUSES } from '../../../utils/constants';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('trip_planner');
    const { uuid } = req.query;
    const { key } = req.query;

    if (!uuid || !key) {
      return res.status(400).json({ error: 'UUID и key обязательны' });
    }

    switch (req.method) {
      case 'GET':
        const trip = await db.collection('trips').findOne({ 
          tripId: uuid, 
          key: key 
        });
        
        if (!trip) {
          // Создаем новую поездку если не найдена
          const newTrip = {
            tripId: uuid,
            key: key,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await db.collection('trips').insertOne(newTrip);
          return res.status(200).json({ items: [] });
        }
        
        // Проверяем срок (30 дней)
        const daysPassed = (new Date() - trip.updatedAt) / (1000 * 60 * 60 * 24);
        if (daysPassed > 30) {
          await db.collection('trips').deleteOne({ tripId: uuid, key: key });
          return res.status(404).json({ error: 'Поездка удалена по истечении срока' });
        }
        
        return res.status(200).json({ items: trip.items || [] });

      case 'POST':
        const { items } = req.body;
        
        if (!Array.isArray(items)) {
          return res.status(400).json({ error: 'items должен быть массивом' });
        }

        // Добавляем новые вещи
        const itemsToAdd = items.map(item => ({
          ...item,
          id: Date.now() + Math.random(),
          updatedAt: new Date()
        }));

        await db.collection('trips').updateOne(
          { tripId: uuid, key: key },
          { 
            $push: { items: { $each: itemsToAdd } },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );

        return res.status(200).json({ success: true });

      case 'PUT':
        const { itemId, updates } = req.body;
        
        // Обновляем вещь с любыми переданными полями
        await db.collection('trips').updateOne(
          { tripId: uuid, key: key, 'items.id': itemId },
          { 
            $set: { 
              'items.$.status': updates.status,
              'items.$.name': updates.name,  // Добавленная строка
              'items.$.updatedAt': new Date(),
              updatedAt: new Date()
            }
          }
        );

        return res.status(200).json({ success: true });

      case 'DELETE':
        if (req.body.deleteAll) {
          await db.collection('trips').updateOne(
            { tripId: uuid, key: key },
            { 
              $set: { 
                items: [],
                updatedAt: new Date()
              }
            }
          );
        } else {
          const { itemId } = req.body;
          await db.collection('trips').updateOne(
            { tripId: uuid, key: key },
            { 
              $pull: { items: { id: itemId } },
              $set: { updatedAt: new Date() }
            }
          );
        }

        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}