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

const videos = [
  {
    company: 'Uber',
    rawPath: "C:\\Users\\arpit\\Downloads\\I Survived the Uber Interview Here's What Happened 🗿.mp4",
    title: "I Survived the Uber Interview | Here's What Happened",
    destVideo: "uber-interview-experience.mp4",
    destThumb: "uber-interview-experience-thumb.jpg"
  },
  {
    company: 'Stripe',
    rawPath: "C:\\Users\\arpit\\Downloads\\Stripe SDE2 Interview Experience _ 1 Crore+ CTC _ Rounds, Preparation, Tips to Crack the Process.mp4",
    title: "Stripe SDE2 Interview Experience | 1 Crore+ CTC Rounds & Prep",
    destVideo: "stripe-interview-experience.mp4",
    destThumb: "stripe-interview-experience-thumb.jpg"
  },
  {
    company: 'Atlassian',
    rawPath: "C:\\Users\\arpit\\Downloads\\How I Cracked 80+ LPA Remote Job Offer _ Atlassian Interview Experience.mp4",
    title: "How I Cracked 80+ LPA Remote Offer | Atlassian Interview Experience",
    destVideo: "atlassian-interview-experience.mp4",
    destThumb: "atlassian-interview-experience-thumb.jpg"
  }
];

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const FRONTEND_VIDEOS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'videos');
const FRONTEND_THUMBS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'thumbnails');

[UPLOADS_DIR, FRONTEND_VIDEOS_DIR, FRONTEND_THUMBS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function getDuration(filePath) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf-8' });
    return parseFloat(out.trim()) || 400;
  } catch (err) {
    console.warn('ffprobe fallback for:', filePath);
    return 400;
  }
}

async function processVideo(item) {
  console.log(`\n======================================================`);
  console.log(`Processing [${item.company}] - ${item.title}`);
  console.log(`======================================================`);

  if (!fs.existsSync(item.rawPath)) {
    console.error(`ERROR: File not found: ${item.rawPath}`);
    return;
  }

  const rawStats = fs.statSync(item.rawPath);
  console.log(`Original file size: ${(rawStats.size / (1024 * 1024)).toFixed(2)} MB`);

  const duration = getDuration(item.rawPath);
  console.log(`Duration: ${Math.floor(duration / 60)}m ${Math.floor(duration % 60)}s (${duration.toFixed(1)}s)`);

  // Target: ~37 MB total file size
  const targetKbits = 37 * 8192;
  let targetBitrate = Math.floor(targetKbits / duration);
  if (targetBitrate > 1500) targetBitrate = 1500;
  if (targetBitrate < 350) targetBitrate = 350;

  const audioBitrate = 96;
  const videoBitrate = targetBitrate - audioBitrate;

  console.log(`Calculated Video Bitrate: ${videoBitrate}k (Audio: ${audioBitrate}k)`);

  const optVideoPath = path.join(UPLOADS_DIR, item.destVideo);
  const optThumbPath = path.join(UPLOADS_DIR, item.destThumb);

  // 1. Transcode video
  console.log(`Transcoding video to 720p HD web stream...`);
  const ffmpegVideoCmd = `ffmpeg -i "${item.rawPath}" -c:v libx264 -b:v ${videoBitrate}k -maxrate ${Math.floor(videoBitrate * 1.25)}k -bufsize ${Math.floor(videoBitrate * 2)}k -vf "scale=1280:-2" -c:a aac -b:a ${audioBitrate}k -movflags +faststart -y "${optVideoPath}"`;
  execSync(ffmpegVideoCmd, { stdio: 'inherit' });

  const optStats = fs.statSync(optVideoPath);
  console.log(`Transcoded video size: ${(optStats.size / (1024 * 1024)).toFixed(2)} MB`);

  // 2. Extract thumbnail
  console.log(`Extracting thumbnail frame...`);
  const thumbTimestamp = Math.min(25, Math.floor(duration * 0.15));
  const ffmpegThumbCmd = `ffmpeg -ss 00:00:${thumbTimestamp.toString().padStart(2, '0')} -i "${item.rawPath}" -vframes 1 -q:v 2 -y "${optThumbPath}"`;
  execSync(ffmpegThumbCmd, { stdio: 'inherit' });

  // 3. Copy to frontend public for local fallback
  fs.copyFileSync(optVideoPath, path.join(FRONTEND_VIDEOS_DIR, item.destVideo));
  fs.copyFileSync(optThumbPath, path.join(FRONTEND_THUMBS_DIR, item.destThumb));
  console.log(`Copied to frontend/public/ (videos & thumbnails)`);

  // 4. Upload to Supabase Storage
  console.log(`Uploading video "${item.destVideo}" to Supabase Storage...`);
  const videoBuffer = fs.readFileSync(optVideoPath);
  const { data: vData, error: vErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(item.destVideo, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });

  if (vErr) {
    console.error(`ERROR uploading video:`, vErr);
  } else {
    console.log(`Video uploaded successfully! Path: ${vData.path}`);
  }

  console.log(`Uploading thumbnail "${item.destThumb}" to Supabase Storage...`);
  const thumbBuffer = fs.readFileSync(optThumbPath);
  const { data: tData, error: tErr } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(item.destThumb, thumbBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (tErr) {
    console.error(`ERROR uploading thumbnail:`, tErr);
  } else {
    console.log(`Thumbnail uploaded successfully! Path: ${tData.path}`);
  }

  const { data: { publicUrl: publicVideoUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.destVideo);
  const { data: { publicUrl: publicThumbUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.destThumb);

  console.log(`-> Public Video URL: ${publicVideoUrl}`);
  console.log(`-> Public Thumb URL: ${publicThumbUrl}`);
}

async function main() {
  console.log('=== Starting Batch 3 Video Processing & Supabase Upload (Uber, Stripe, Atlassian) ===');
  for (const v of videos) {
    await processVideo(v);
  }
  console.log('\n=== All 3 Videos & Thumbnails Processed and Uploaded to Supabase! ===');
}

main().catch(err => {
  console.error('Fatal error in batch upload:', err);
  process.exit(1);
});
