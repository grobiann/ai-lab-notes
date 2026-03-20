const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oylrhcumrrdjtmyyvkhl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bHJoY3VtcnJkanRteXl2a2hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjI1ODg1MSwiZXhwIjoyMDg3ODM0ODUxfQ.OaI2r0jLz1fde5QCFwYDjLOWCjkA4isUgy8Vt4BLtjI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPost() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, is_published, published_at')
      .eq('slug', 'vertex-animation-texture-optimization')
      .single();

    if (error) {
      console.error('❌ Post not found in DB:', error);
      process.exit(1);
    }

    console.log('✅ Post found in Supabase:');
    console.log('- ID:', data.id);
    console.log('- Title:', data.title);
    console.log('- Slug:', data.slug);
    console.log('- Published:', data.is_published);
    console.log('- Published At:', data.published_at);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

checkPost();
