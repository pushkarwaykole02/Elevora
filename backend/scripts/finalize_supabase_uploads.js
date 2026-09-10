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

function getDuration(filePath) {
  try {
    const durOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf-8' });
    return parseFloat(durOut.trim()) || 900;
  } catch (e) {
    return 900;
  }
}

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

async function compressAndUpload(sourceFile, destVideoName, destThumbName) {
  console.log(`\n======================================================`);
  console.log(`Optimizing: ${destVideoName} from ${sourceFile}`);
  console.log(`======================================================`);

  const duration = getDuration(sourceFile);
  console.log(`Duration: ${(duration / 60).toFixed(1)} mins (${duration.toFixed(0)}s)`);

  // Target precisely 28 MB to be completely under 50 MB
  // 28 MB = 28 * 8192 = 229376 kbits
  const targetKbits = 28 * 8192;
  const totalBitrate = Math.floor(targetKbits / duration);
  const audioBitrate = 48;
  const videoBitrate = Math.max(80, totalBitrate - audioBitrate);

  console.log(`Bitrates: Video=${videoBitrate}k, Audio=${audioBitrate}k`);

  const optVideoPath = path.join(UPLOADS_DIR, destVideoName);
  const optThumbPath = path.join(UPLOADS_DIR, destThumbName);

  // Compress
  console.log(`Transcoding to target ~28MB...`);
  const ffmpegCmd = `ffmpeg -i "${sourceFile}" -c:v libx264 -b:v ${videoBitrate}k -maxrate ${Math.floor(videoBitrate * 1.15)}k -bufsize ${Math.floor(videoBitrate * 1.5)}k -vf "scale=1280:-2" -c:a aac -b:a ${audioBitrate}k -movflags +faststart -y "${optVideoPath}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log(`Output size: ${(fs.statSync(optVideoPath).size / (1024*1024)).toFixed(2)} MB`);

  // Extract thumb if not present
  if (!fs.existsSync(optThumbPath)) {
    const thumbTimestamp = Math.min(20, Math.floor(duration * 0.1));
    const ffmpegThumbCmd = `ffmpeg -ss 00:00:${thumbTimestamp.toString().padStart(2, '0')} -i "${sourceFile}" -vframes 1 -q:v 2 -y "${optThumbPath}"`;
    execSync(ffmpegThumbCmd, { stdio: 'inherit' });
  }

  // Copy to frontend/public
  fs.copyFileSync(optVideoPath, path.join(FRONTEND_VIDEOS_DIR, destVideoName));
  fs.copyFileSync(optThumbPath, path.join(FRONTEND_THUMBS_DIR, destThumbName));

  // Upload video & thumb
  await uploadFile(destVideoName, optVideoPath, 'video/mp4');
  await uploadFile(destThumbName, optThumbPath, 'image/jpeg');
}

async function main() {
  console.log('=== Finalizing All Supabase Storage Uploads ===');

  // 1. Uber (source from raw downloads)
  const uberRaw = "C:\\Users\\arpit\\Downloads\\I Survived the Uber Interview Here's What Happened 🗿.mp4";
  await compressAndUpload(uberRaw, 'uber-interview-experience.mp4', 'uber-interview-experience-thumb.jpg');

  // 2. Apple (source from backend/uploads/apple-interview-experience.mp4)
  const appleCurrent = path.join(UPLOADS_DIR, 'apple-interview-experience.mp4');
  await compressAndUpload(appleCurrent, 'apple-interview-experience.mp4', 'apple-interview-experience-thumb.jpg');

  // 3. Atlassian (already ~37MB in backend/uploads/)
  const atlassianCurrent = path.join(UPLOADS_DIR, 'atlassian-interview-experience.mp4');
  const atlassianThumb = path.join(UPLOADS_DIR, 'atlassian-interview-experience-thumb.jpg');
  await uploadFile('atlassian-interview-experience.mp4', atlassianCurrent, 'video/mp4');
  await uploadFile('atlassian-interview-experience-thumb.jpg', atlassianThumb, 'image/jpeg');

  console.log('\n=== All missing assets finalized and uploaded! ===');
}

main().catch(console.error);
