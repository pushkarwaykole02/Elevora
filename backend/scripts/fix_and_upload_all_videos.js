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

// Target 32 MB to be completely safe under the 50MB Supabase limit
function transcodeAndUpload(rawPath, destVideo, destThumb) {
  console.log(`\n======================================================`);
  console.log(`Processing: ${destVideo}`);
  console.log(`Raw Path: ${rawPath}`);
  console.log(`======================================================`);

  if (!fs.existsSync(rawPath)) {
    console.error(`Raw file not found: ${rawPath}`);
    return;
  }

  // Get duration
  let duration = 600;
  try {
    const durOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawPath}"`, { encoding: 'utf-8' });
    duration = parseFloat(durOut.trim()) || 600;
  } catch (e) {
    console.warn('ffprobe fallback duration 600s');
  }

  console.log(`Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s (${duration.toFixed(1)}s)`);

  // Target 32 MB = 32 * 8192 = 262144 kbits
  const targetKbits = 32 * 8192;
  const totalBitrate = Math.floor(targetKbits / duration);
  const audioBitrate = 80;
  let videoBitrate = totalBitrate - audioBitrate;
  if (videoBitrate < 250) videoBitrate = 250;
  if (videoBitrate > 1500) videoBitrate = 1500;

  console.log(`Calculated Bitrate: video=${videoBitrate}k, audio=${audioBitrate}k`);

  const optVideoPath = path.join(UPLOADS_DIR, destVideo);
  const optThumbPath = path.join(UPLOADS_DIR, destThumb);

  // 1. Transcode video
  console.log(`Transcoding with constrained bitrate...`);
  const ffmpegCmd = `ffmpeg -i "${rawPath}" -c:v libx264 -b:v ${videoBitrate}k -maxrate ${Math.floor(videoBitrate * 1.15)}k -bufsize ${Math.floor(videoBitrate * 1.5)}k -vf "scale=1280:-2" -c:a aac -b:a ${audioBitrate}k -movflags +faststart -y "${optVideoPath}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  const finalStats = fs.statSync(optVideoPath);
  const sizeMB = (finalStats.size / (1024 * 1024)).toFixed(2);
  console.log(`Final file size: ${sizeMB} MB`);

  // 2. Extract thumbnail
  console.log(`Extracting thumbnail...`);
  const thumbTimestamp = Math.min(20, Math.floor(duration * 0.1));
  const ffmpegThumbCmd = `ffmpeg -ss 00:00:${thumbTimestamp.toString().padStart(2, '0')} -i "${rawPath}" -vframes 1 -q:v 2 -y "${optThumbPath}"`;
  execSync(ffmpegThumbCmd, { stdio: 'inherit' });

  // 3. Copy locally
  fs.copyFileSync(optVideoPath, path.join(FRONTEND_VIDEOS_DIR, destVideo));
  fs.copyFileSync(optThumbPath, path.join(FRONTEND_THUMBS_DIR, destThumb));

  // 4. Upload to Supabase
  console.log(`Uploading to Supabase bucket "${BUCKET_NAME}"...`);
  const videoBuffer = fs.readFileSync(optVideoPath);
  const { data: vData, error: vErr } = supabase.storage
    .from(BUCKET_NAME)
    .upload(destVideo, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  return new Promise((resolve) => {
    supabase.storage
      .from(BUCKET_NAME)
      .upload(destVideo, videoBuffer, {
        contentType: 'video/mp4',
        upsert: true
      })
      .then(({ data: vData, error: vErr }) => {
        if (vErr) {
          console.error(`Supabase Video Upload ERROR:`, vErr);
        } else {
          console.log(`Supabase Video Upload SUCCESS: ${vData.path}`);
        }

        const thumbBuffer = fs.readFileSync(optThumbPath);
        return supabase.storage
          .from(BUCKET_NAME)
          .upload(destThumb, thumbBuffer, {
            contentType: 'image/jpeg',
            upsert: true
          });
      })
      .then(({ data: tData, error: tErr }) => {
        if (tErr) {
          console.error(`Supabase Thumb Upload ERROR:`, tErr);
        } else {
          console.log(`Supabase Thumb Upload SUCCESS: ${tData.path}`);
        }
        resolve();
      })
      .catch((err) => {
        console.error('Upload catch error:', err);
        resolve();
      });
  });
}

const queue = [
  {
    rawPath: "C:\\Users\\arpit\\Downloads\\I Survived the Uber Interview Here's What Happened 🗿.mp4",
    destVideo: "uber-interview-experience.mp4",
    destThumb: "uber-interview-experience-thumb.jpg"
  },
  {
    rawPath: "C:\\Users\\arpit\\Downloads\\How He Cracked Apple _ Placement Journey 🔥.mp4",
    destVideo: "apple-interview-experience.mp4",
    destThumb: "apple-interview-experience-thumb.jpg"
  },
  {
    rawPath: "C:\\Users\\arpit\\Downloads\\How I Cracked 80+ LPA Remote Job Offer _ Atlassian Interview Experience.mp4",
    destVideo: "atlassian-interview-experience.mp4",
    destThumb: "atlassian-interview-experience-thumb.jpg"
  }
];

async function main() {
  console.log('=== Optimizing & Uploading Uber, Apple & Atlassian under 50MB limit ===');
  for (const item of queue) {
    await transcodeAndUpload(item.rawPath, item.destVideo, item.destThumb);
  }
  console.log('\n=== All target videos optimized and uploaded! ===');
}

main();
