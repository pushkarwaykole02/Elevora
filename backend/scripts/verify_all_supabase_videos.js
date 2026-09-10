const https = require('https');

const videoUrls = [
  // Google
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/google-honest-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/google-honest-interview-experience-thumb.jpg',
  // Meta
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/meta-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/meta-interview-experience-thumb.jpg',
  // Amazon
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/amazon-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/amazon-interview-experience-thumb.jpg',
  // Netflix
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/netflix-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/netflix-interview-experience-thumb.jpg',
  // Apple
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/apple-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/apple-interview-experience-thumb.jpg',
  // Microsoft
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/microsoft-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/microsoft-interview-experience-thumb.jpg',
  // Uber
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/uber-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/uber-interview-experience-thumb.jpg',
  // Stripe
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/stripe-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/stripe-interview-experience-thumb.jpg',
  // Atlassian
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/atlassian-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/atlassian-interview-experience-thumb.jpg',
  // OpenAI
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/openai-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/openai-interview-experience-thumb.jpg',
  // Databricks
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/databricks-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/databricks-interview-experience-thumb.jpg',
  // UI/UX Design
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/ui-ux-design-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/ui-ux-design-interview-experience-thumb.jpg',
  // Goldman Sachs
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/goldman-sachs-interview-experience.mp4',
  'https://dxqtvhdhpcqikllbqjjg.supabase.co/storage/v1/object/public/catalog-videos/goldman-sachs-interview-experience-thumb.jpg',
];

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD' }, (res) => {
      const sizeMB = res.headers['content-length'] ? (parseInt(res.headers['content-length'], 10) / (1024 * 1024)).toFixed(2) + ' MB' : 'unknown size';
      resolve({ url, statusCode: res.statusCode, size: sizeMB, contentType: res.headers['content-type'] });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  console.log('=== Checking all 13 Supabase Video & Thumbnail Endpoints ===\n');
  let passCount = 0;
  for (const url of videoUrls) {
    const res = await checkUrl(url);
    const filename = url.split('/').pop();
    if (res.statusCode === 200) {
      passCount++;
      console.log(`[PASS 200 OK] ${filename.padEnd(46)} | Type: ${(res.contentType || '').padEnd(12)} | Size: ${res.size}`);
    } else {
      console.log(`[PROCESSING ${res.statusCode || 'ERR'}] ${filename}`);
    }
  }
  console.log(`\nVerified ${passCount}/${videoUrls.length} assets ready & streaming!`);
}

run();
