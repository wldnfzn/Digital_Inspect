import { Hono } from 'hono';
import sql from '../lib/db';
import { authMiddleware, roleGuard } from '../middleware/auth';

const settingsRoutes = new Hono();
settingsRoutes.use('*', authMiddleware);

// ====================
// FORKLIFT TEMPLATES
// ====================

settingsRoutes.get('/templates/forklift', async (c) => {
  try {
    const categories = await sql`SELECT * FROM inspection_categories ORDER BY sort_order ASC, created_at ASC`;
    const items = await sql`SELECT * FROM inspection_items ORDER BY sort_order ASC, created_at ASC`;
    
    const mapped = categories.map(cat => ({
      ...cat,
      items: items.filter(i => i.category_id === cat.id)
    }));
    
    return c.json({ data: mapped });
  } catch (error: any) {
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

// Sync full template structure
settingsRoutes.post('/templates/forklift/sync', roleGuard(['SUPER_ADMIN']), async (c) => {
  try {
    const { categories } = await c.req.json(); // Expected format: [{ name: '...', items: [{name: '...'}, ...] }]
    
    // We do a full replace for simplicity in this demo, though ideally we should upsert
    await sql`DELETE FROM inspection_categories`; // cascade will delete items
    
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const [newCat] = await sql`
        INSERT INTO inspection_categories (name, sort_order) 
        VALUES (${cat.name}, ${i}) RETURNING id
      `;
      
      if (cat.items && cat.items.length > 0) {
        for (let j = 0; j < cat.items.length; j++) {
          const item = cat.items[j];
          await sql`
            INSERT INTO inspection_items (category_id, name, is_critical, sort_order)
            VALUES (${newCat.id}, ${typeof item === 'string' ? item : item.name}, ${false}, ${j})
          `;
        }
      }
    }
    
    return c.json({ message: 'Template synchronized successfully' });
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default settingsRoutes;
