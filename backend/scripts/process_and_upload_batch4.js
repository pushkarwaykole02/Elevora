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

const items = [
  {
    company: 'OpenAI',
    role: 'Data Scientist / Machine Learning',
    rawPath: "C:\\Users\\arpit\\Downloads\\OpenAI Interview Experience _ $500K+ Compensation _ Rounds, Process, System Design, Preparation Tips.mp4",
    title: "OpenAI Interview Experience | $500K+ Compensation, Process & System Design",
    destVideo: "openai-interview-experience.mp4",
    destThumb: "openai-interview-experience-thumb.jpg"
  },
  {
    company: 'Databricks',
    role: 'Data Scientist / Distributed Systems',
    rawPath: "C:\\Users\\arpit\\Downloads\\Databricks Interview Experience _ $600K+ Compensation _ Rounds, Process, System Design, Prep Tips.mp4",
    title: "Databricks Interview Experience | $600K+ Compensation, System Design & Prep",
    destVideo: "databricks-interview-experience.mp4",
    destThumb: "databricks-interview-experience-thumb.jpg"
  },
  {
    company: 'UI/UX Design',
    role: 'UX Design Lead',
    rawPath: "C:\\Users\\arpit\\Downloads\\UI_UX Design Real Interview Questions & Answers _ TCS, Wipro, Deloitte, Infosys _ 0–5 Yrs.mp4",
    title: "UI/UX Design Real Interview Questions & Answers | 0-5 Yrs Experience",
    destVideo: "ui-ux-design-interview-experience.mp4",
    destThumb: "ui-ux-design-interview-experience-thumb.jpg"
  },
  {
    company: 'Goldman Sachs',
    role: 'Investment Analyst / SDE',
    rawPath: "C:\\Users\\arpit\\Downloads\\Goldman Sachs Interview Experience SDE 1 _ Complete Hiring Process - Total Rounds_QNS_Projects.mp4",
    title: "Goldman Sachs Interview Experience | Complete Hiring Process & Total Rounds",
    destVideo: "goldman-sachs-interview-experience.mp4",
    destThumb: "goldman-sachs-interview-experience-thumb.jpg"
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
    const durOut = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf-8' });
    return parseFloat(durOut.trim()) || 600;
  } catch (e) {
    return 600;
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

async function processItem(item) {
  console.log(`\n======================================================`);
  console.log(`Processing [${item.company}] - ${item.title}`);
  console.log(`Raw Path: ${item.rawPath}`);
  console.log(`======================================================`);

  if (!fs.existsSync(item.rawPath)) {
    console.error(`ERROR: File not found: ${item.rawPath}`);
    return;
  }

  const duration = getDuration(item.rawPath);
  console.log(`Duration: ${(duration / 60).toFixed(1)} mins (${duration.toFixed(0)}s)`);

  // Target 30 MB to be completely under 50 MB limit
  const targetKbits = 30 * 8192;
  const totalBitrate = Math.floor(targetKbits / duration);
  const audioBitrate = 64;
  const videoBitrate = Math.max(90, Math.min(1200, totalBitrate - audioBitrate));

  console.log(`Calculated Bitrates: Video=${videoBitrate}k, Audio=${audioBitrate}k`);

  const optVideoPath = path.join(UPLOADS_DIR, item.destVideo);
  const optThumbPath = path.join(UPLOADS_DIR, item.destThumb);

  // 1. Transcode
  console.log(`Transcoding to 720p HD with web faststart...`);
  const ffmpegCmd = `ffmpeg -i "${item.rawPath}" -c:v libx264 -b:v ${videoBitrate}k -maxrate ${Math.floor(videoBitrate * 1.15)}k -bufsize ${Math.floor(videoBitrate * 1.5)}k -vf "scale=1280:-2" -c:a aac -b:a ${audioBitrate}k -movflags +faststart -y "${optVideoPath}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  const finalStats = fs.statSync(optVideoPath);
  console.log(`Transcoded Video Size: ${(finalStats.size / (1024*1024)).toFixed(2)} MB`);

  // 2. Extract Thumbnail
  console.log(`Extracting thumbnail frame...`);
  const thumbTimestamp = Math.min(25, Math.floor(duration * 0.12));
  const ffmpegThumbCmd = `ffmpeg -ss 00:00:${thumbTimestamp.toString().padStart(2, '0')} -i "${item.rawPath}" -vframes 1 -q:v 2 -y "${optThumbPath}"`;
  execSync(ffmpegThumbCmd, { stdio: 'inherit' });

  // 3. Copy to frontend public
  fs.copyFileSync(optVideoPath, path.join(FRONTEND_VIDEOS_DIR, item.destVideo));
  fs.copyFileSync(optThumbPath, path.join(FRONTEND_THUMBS_DIR, item.destThumb));
  console.log(`Copied to frontend/public/ (videos & thumbnails)`);

  // 4. Upload to Supabase Storage
  await uploadFile(item.destVideo, optVideoPath, 'video/mp4');
  await uploadFile(item.destThumb, optThumbPath, 'image/jpeg');

  const { data: { publicUrl: videoUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.destVideo);
  const { data: { publicUrl: thumbUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(item.destThumb);

  console.log(`-> Public Video URL: ${videoUrl}`);
  console.log(`-> Public Thumb URL: ${thumbUrl}`);
}

async function main() {
  console.log('=== Starting Batch 4 Processing & Upload (OpenAI, Databricks, UI/UX, Goldman Sachs) ===');
  for (const item of items) {
    await processItem(item);
  }
  console.log('\n=== Batch 4 Finished Successfully! ===');
}

main().catch(err => {
  console.error('Fatal error in batch 4:', err);
  process.exit(1);
});
