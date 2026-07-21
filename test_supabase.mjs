import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) env[key.trim()] = value.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('lists')
    .select(`
      id,
      items:list_items(
        position,
        video:videos(thumbnail_url)
      ),
      items_count:list_items(count)
    `)
    .limit(1)
    .limit(4, { foreignTable: 'list_items' })
    .order('position', { foreignTable: 'list_items', ascending: true });

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

run();
