import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('trip_planner');

    switch (req.method) {
      case 'GET':
        const templates = await db.collection('templates').find({}).toArray();
        return res.status(200).json({ templates });

      case 'POST':
        const { items } = req.body;
        
        if (!Array.isArray(items)) {
          return res.status(400).json({ error: 'items должен быть массивом' });
        }

        // Добавляем новые шаблоны (избегаем дубликатов по имени)
        for (const item of items) {
          await db.collection('templates').updateOne(
            { name: item.name },
            { 
              $set: { 
                name: item.name,
                category: item.category || 'Прочее'
              }
            },
            { upsert: true }
          );
        }

        return res.status(200).json({ success: true });

      case 'PUT':
        const { _id, name, category } = req.body;
        
        await db.collection('templates').updateOne(
          { _id: new ObjectId(_id) },
          { $set: { name, category } }
        );

        return res.status(200).json({ success: true });

      case 'DELETE':
        if (req.body.deleteAll) {
          await db.collection('templates').deleteMany({});
        } else if (req.body.ids) {
          const { ObjectId } = require('mongodb');
          const objectIds = req.body.ids.map(id => new ObjectId(id));
          await db.collection('templates').deleteMany({ _id: { $in: objectIds } });
        } else {
          const { _id } = req.body;
          const { ObjectId } = require('mongodb');
          await db.collection('templates').deleteOne({ _id: new ObjectId(_id) });
        }

        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Templates API Error:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}