# Video Processing Pipeline

## Overview

The video processing pipeline automatically compresses, optimizes, and generates multiple quality versions of uploaded videos using FFmpeg and cloud storage.

## Features

- **Automatic Compression**: Reduces video file size by 40-60%
- **Multiple Quality Versions**: Generates 360p, 480p, 720p, 1080p (based on source resolution)
- **Thumbnail Generation**: Extracts 5 thumbnail images from video
- **Cloud Storage**: Uploads to Cloudinary CDN for global delivery
- **Background Processing**: Uses Bull queue with Redis for async processing
- **Real-time Progress**: WebSocket updates for upload and processing status
- **Auto-retry**: Failed jobs automatically retry 3 times with exponential backoff

## Architecture

```
Upload → Multer (temp storage) → Create Video Record → Queue Job →
FFmpeg Processing → Generate Thumbnails → Create Quality Versions →
Upload to Cloudinary → Update Database → Cleanup → Complete
```

## Setup

### 1. Install FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 2. Configure Cloudinary

Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Ensure Redis is Running

The video queue requires Redis:
```bash
redis-server
```

## API Endpoints

### Upload Video
```
POST /api/video/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- video: File
- title: String
- description: String
- category: String

Response:
{
  "message": "Video uploaded and processing started",
  "video": { ... },
  "jobId": "12345"
}
```

### Check Processing Status
```
GET /api/videos/:id/status

Response:
{
  "videoId": "...",
  "status": "processing",
  "progress": 45,
  "jobId": "12345"
}
```

## Processing Flow

1. **Upload** (0-10%): Video uploaded to server temp storage
2. **Metadata Extraction** (10-20%): FFmpeg extracts duration, resolution, codec
3. **Thumbnail Generation** (20-50%): 5 thumbnails extracted and uploaded to Cloudinary
4. **Quality Generation** (50-90%): Multiple quality versions created and uploaded
5. **Cleanup** (90-100%): Local temp files deleted

## Database Schema

```javascript
{
  videoUrl: String,
  videoVersions: {
    original: String,
    "1080p": String,
    "720p": String,
    "480p": String,
    "360p": String
  },
  thumbnails: [String],
  cdnUrl: String,
  metadata: {
    duration: Number,
    resolution: String,
    fileSize: Number,
    codec: String
  },
  processingStatus: "pending" | "processing" | "completed" | "failed",
  processingProgress: Number,
  processingError: String,
  jobId: String
}
```

## Quality Presets

| Quality | Resolution | Bitrate | Use Case |
|---------|-----------|---------|----------|
| 360p | 640x360 | 500k | Mobile, slow connections |
| 480p | 854x480 | 1000k | Standard mobile |
| 720p | 1280x720 | 2500k | HD, default |
| 1080p | 1920x1080 | 5000k | Full HD |

## Error Handling

- **Job Retry**: Failed jobs retry 3 times with exponential backoff (2s, 4s, 8s)
- **Fallback**: If Cloudinary fails, videos remain in local storage
- **Status Tracking**: Processing errors stored in `processingError` field
- **Cleanup**: Failed jobs clean up temp files to prevent disk bloat

## Monitoring

### Check Queue Status
```javascript
const { videoQueue } = require('./services/videoQueue');

// Get job counts
const counts = await videoQueue.getJobCounts();
console.log(counts); // { waiting, active, completed, failed }

// Get failed jobs
const failed = await videoQueue.getFailed();
```

### Bull Board (Optional)
Install Bull Board for visual queue monitoring:
```bash
npm install bull-board
```

## Performance

- **Processing Time**: ~2x video duration (5min video = 10min processing)
- **Compression**: 40-60% file size reduction
- **Concurrent Jobs**: Configurable (default: 1 per worker)
- **Memory Usage**: ~500MB per active job

## Troubleshooting

### FFmpeg Not Found
```
Error: ffmpeg not found
```
**Solution**: Install FFmpeg and ensure it's in PATH

### Cloudinary Upload Failed
```
Error: Cloudinary upload failed
```
**Solution**: Check API credentials in .env

### Redis Connection Failed
```
Error: Redis connection refused
```
**Solution**: Start Redis server: `redis-server`

### Processing Stuck
```
Status: processing, Progress: 45%
```
**Solution**: Check Bull queue for failed jobs, restart worker

## Future Enhancements

- [ ] HLS adaptive streaming
- [ ] WebM format support
- [ ] Custom watermarks
- [ ] AI-based thumbnail selection
- [ ] Video trimming/editing
- [ ] Subtitle generation
