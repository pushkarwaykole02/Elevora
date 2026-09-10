const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', 'frontend', '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dxqtvhdhpcqikllbqjjg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required in backend/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'catalog-videos';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const FRONTEND_VIDEOS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'videos');
const FRONTEND_THUMBS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'thumbnails');

async function uploadFile(fileName, filePath, contentType) {
  console.log(`Uploading "${fileName}" (${(fs.statSync(filePath).size / (1024*1024)).toFixed(2)} MB)...`);
  const fileBuffer = fs.readFileSync(filePath);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true
    });
  
  if (error) {
    console.error(`FAILED to upload ${fileName}:`, error);
  } else {
    console.log(`SUCCESS uploaded ${fileName} -> ${data.path}`);
  }
}

async function fixApple() {
  const currentApple = path.join(UPLOADS_DIR, 'apple-interview-experience.mp4');
  const tempApple = path.join(UPLOADS_DIR, 'apple-interview-experience-temp.mp4');
  const thumbApple = path.join(UPLOADS_DIR, 'apple-interview-experience-thumb.jpg');

  console.log('Transcoding Apple to ~28MB using temporary output...');
  // Duration is 22 mins = 1320s
  // 28 MB = 28 * 8192 = 229376 kbits
  // totalBitrate = 173k (audio 48k, video 125k)
  const ffmpegCmd = `ffmpeg -i "${currentApple}" -c:v libx264 -b:v 125k -maxrate 150k -bufsize 200k -vf "scale=1280:-2" -c:a aac -b:a 48k -movflags +faststart -y "${tempApple}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  fs.copyFileSync(tempApple, currentApple);
  fs.copyFileSync(tempApple, path.join(FRONTEND_VIDEOS_DIR, 'apple-interview-experience.mp4'));
  fs.unlinkSync(tempApple);

  await uploadFile('apple-interview-experience.mp4', currentApple, 'video/mp4');
  if (fs.existsSync(thumbApple)) {
    fs.copyFileSync(thumbApple, path.join(FRONTEND_THUMBS_DIR, 'apple-interview-experience-thumb.jpg'));
    await uploadFile('apple-interview-experience-thumb.jpg', thumbApple, 'image/jpeg');
  }
}

async function uploadAtlassian() {
  const atlassianVideo = path.join(UPLOADS_DIR, 'atlassian-interview-experience.mp4');
  const atlassianThumb = path.join(UPLOADS_DIR, 'atlassian-interview-experience-thumb.jpg');

  if (fs.existsSync(atlassianVideo)) {
    fs.copyFileSync(atlassianVideo, path.join(FRONTEND_VIDEOS_DIR, 'atlassian-interview-experience.mp4'));
    await uploadFile('atlassian-interview-experience.mp4', atlassianVideo, 'video/mp4');
  }
  if (fs.existsSync(atlassianThumb)) {
    fs.copyFileSync(atlassianThumb, path.join(FRONTEND_THUMBS_DIR, 'atlassian-interview-experience-thumb.jpg'));
    await uploadFile('atlassian-interview-experience-thumb.jpg', atlassianThumb, 'image/jpeg');
  }
}

async function main() {
  console.log('=== Uploading Apple and Atlassian to Supabase ===');
  await fixApple();
  await uploadAtlassian();
  console.log('=== Finished Apple & Atlassian! ===');
}

main().catch(console.error);
