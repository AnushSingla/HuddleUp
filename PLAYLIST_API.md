# Playlist API Documentation

## Overview
Simple playlist system for HuddleUp that allows users to create and manage video playlists.

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header).

### Base URL: `/api/playlists`

### 1. Create Playlist
**POST** `/api/playlists`

**Request Body:**
```json
{
  "name": "My Playlist",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Playlist created successfully",
  "playlist": {
    "_id": "playlist_id",
    "name": "My Playlist",
    "description": "Optional description",
    "userId": "user_id",
    "videos": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get User's Playlists
**GET** `/api/playlists`

**Response:**
```json
{
  "success": true,
  "playlists": [
    {
      "_id": "playlist_id",
      "name": "My Playlist",
      "description": "Optional description",
      "userId": "user_id",
      "videos": [
        {
          "_id": "video_id",
          "title": "Video Title",
          "thumbnail": "thumbnail_url",
          "duration": 120
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 3. Get Specific Playlist
**GET** `/api/playlists/:id`

**Response:**
```json
{
  "success": true,
  "playlist": {
    "_id": "playlist_id",
    "name": "My Playlist",
    "description": "Optional description",
    "userId": "user_id",
    "videos": [
      {
        "_id": "video_id",
        "title": "Video Title",
        "thumbnail": "thumbnail_url",
        "duration": 120,
        "uploadedBy": "uploader_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Add Video to Playlist
**POST** `/api/playlists/:id/videos`

**Request Body:**
```json
{
  "videoId": "video_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Video added to playlist successfully",
  "playlist": {
    // Updated playlist object
  }
}
```

### 5. Remove Video from Playlist
**DELETE** `/api/playlists/:id/videos/:videoId`

**Response:**
```json
{
  "success": true,
  "message": "Video removed from playlist successfully",
  "playlist": {
    // Updated playlist object
  }
}
```

### 6. Delete Playlist
**DELETE** `/api/playlists/:id`

**Response:**
```json
{
  "success": true,
  "message": "Playlist deleted successfully"
}
```

## Error Responses

All endpoints return error responses in this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (login required)
- `404` - Not Found (playlist or video not found)
- `500` - Internal Server Error

## Frontend Integration

The playlist functionality is integrated into the Explore page with:

1. **PlaylistManager Component**: Displays user's playlists with create/delete functionality
2. **AddToPlaylist Component**: Modal for adding videos to existing playlists
3. **Add to Playlist Button**: Added to each video card for easy playlist management

## Usage

1. Users must be logged in to access playlist features
2. Playlists are private to each user (no sharing functionality)
3. Videos can be added to multiple playlists
4. Duplicate videos in the same playlist are prevented
5. Deleting a playlist removes all video references but doesn't delete the videos themselves