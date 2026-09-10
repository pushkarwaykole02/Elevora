const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend and frontend
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', 'frontend', '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxqtvhdhpcqikllbqjjg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const OPTIMIZED_PATH = path.join(__dirname, '..', 'uploads', 'google-honest-interview-experience-optimized.mp4');
const RAW_PATH = "C:\\Users\\arpit\\Downloads\\My HONEST Google Interview Experience _ Selected.mp4";
const VIDEO_PATH = fs.existsSync(OPTIMIZED_PATH) ? OPTIMIZED_PATH : RAW_PATH;
const BUCKET_NAME = 'catalog-videos';
const DEST_FILE_NAME = 'google-honest-interview-experience.mp4';

async function main() {
  console.log('--- Supabase Video Upload Utility ---');
  console.log('Supabase URL:', SUPABASE_URL);
  
  if (!SUPABASE_KEY) {
    console.error('ERROR: No Supabase API key found in environment variables (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    console.log('Please pass the key as an argument or set it in backend/.env or frontend/.env.local');
    console.log('Usage: node upload_to_supabase.js <SUPABASE_SERVICE_ROLE_KEY_OR_ANON_KEY>');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Check if file exists
  if (!fs.existsSync(VIDEO_PATH)) {
    console.error('ERROR: Video file not found at:', VIDEO_PATH);
    process.exit(1);
  }

  const fileStats = fs.statSync(VIDEO_PATH);
  console.log(`Using Video File: ${VIDEO_PATH}`);
  console.log(`Video File size: ${(fileStats.size / (1024 * 1024)).toFixed(2)} MB`);

  // Ensure bucket exists
  console.log(`Checking bucket "${BUCKET_NAME}"...`);
  const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
  
  if (getBucketsError) {
    console.warn('Warning checking buckets:', getBucketsError.message);
  }

  const bucketExists = buckets && buckets.some(b => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`Creating public bucket "${BUCKET_NAME}"...`);
    const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true
    });
    if (createError) {
      console.log('Bucket creation note:', createError.message);
    } else {
      console.log('Bucket created successfully.');
    }
  } else {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
  }

  // Read file stream/buffer and upload
  console.log(`Uploading "${DEST_FILE_NAME}" to Supabase Storage... This may take a few moments for a 122MB file.`);
  const fileBuffer = fs.readFileSync(VIDEO_PATH);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(DEST_FILE_NAME, fileBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    process.exit(1);
  }

  console.log('Upload successful!', uploadData);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(DEST_FILE_NAME);

  console.log('\n=============================================');
  console.log('Public Video URL:');
  console.log(publicUrl);
  console.log('=============================================\n');
}

// Allow passing key via CLI argument
if (process.argv[2]) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.argv[2];
}

main().catch(err => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
