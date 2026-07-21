const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function test() {
  const { data, error } = await supabase
    .from('ratings')
    .select('id, user_id, rating, review, profiles!ratings_user_id_fkey(username, display_name, avatar_url), review_likes(user_id)')
    .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);
}

test();
