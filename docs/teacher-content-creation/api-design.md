# Teacher Content Creation System - API Design Documentation

## API Overview

The Teacher Content Creation API follows RESTful principles with additional GraphQL support for complex queries. All endpoints require authentication and use JWT tokens for authorization.

## Base Configuration

### Base URLs
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://staging-api.dzenyoga.com/v1`
- **Production**: `https://api.dzenyoga.com/v1`

### Authentication
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Common Headers
```http
X-Request-ID: <uuid>
X-Client-Version: 1.0.0
X-Language: en
```

## REST API Endpoints

### Content Management

#### Create Content
```http
POST /api/v1/content
```

**Request Body:**
```json
{
  "type": "class",
  "title": "Morning Vinyasa Flow",
  "description": "Energizing 45-minute flow to start your day",
  "difficulty": "intermediate",
  "duration_minutes": 45,
  "language": "en",
  "tags": ["vinyasa", "morning", "energizing"],
  "metadata": {
    "focus_areas": ["core", "flexibility"],
    "props_needed": ["mat", "blocks"],
    "music_playlist": "spotify:playlist:xyz"
  },
  "type_specific_data": {
    "style": "vinyasa",
    "peak_poses": ["crow_pose", "wheel_pose"],
    "warmup_duration": 10,
    "cooldown_duration": 8
  },
  "pricing": {
    "type": "free"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "class",
    "title": "Morning Vinyasa Flow",
    "slug": "morning-vinyasa-flow",
    "status": "draft",
    "created_at": "2024-02-01T10:00:00Z",
    "updated_at": "2024-02-01T10:00:00Z",
    "_links": {
      "self": "/api/v1/content/550e8400-e29b-41d4-a716-446655440000",
      "edit": "/api/v1/content/550e8400-e29b-41d4-a716-446655440000",
      "publish": "/api/v1/content/550e8400-e29b-41d4-a716-446655440000/publish",
      "media": "/api/v1/content/550e8400-e29b-41d4-a716-446655440000/media"
    }
  }
}
```

#### Get Content
```http
GET /api/v1/content/{id}
```

**Query Parameters:**
- `include`: Comma-separated list of related data to include
  - Options: `media`, `sequences`, `analytics`, `relationships`, `versions`
- `fields`: Comma-separated list of fields to return (sparse fieldsets)

**Example:**
```http
GET /api/v1/content/550e8400-e29b-41d4-a716-446655440000?include=media,sequences&fields=id,title,media
```

#### Update Content
```http
PUT /api/v1/content/{id}
PATCH /api/v1/content/{id}
```

**Request Body (PATCH - partial update):**
```json
{
  "title": "Updated Morning Vinyasa Flow",
  "metadata": {
    "focus_areas": ["core", "flexibility", "balance"]
  }
}
```

#### Delete Content
```http
DELETE /api/v1/content/{id}
```

**Query Parameters:**
- `permanent`: Boolean (default: false) - Soft delete vs hard delete

#### List Content
```http
GET /api/v1/content
```

**Query Parameters:**
```typescript
interface ContentListParams {
  // Filtering
  type?: ContentType;
  status?: ContentStatus;
  difficulty?: Difficulty;
  teacher_id?: string;
  tags?: string[]; // Comma-separated
  
  // Search
  q?: string; // Full-text search
  
  // Sorting
  sort?: string; // Format: field:direction (e.g., "created_at:desc")
  
  // Pagination
  page?: number;
  limit?: number; // Max 100
  
  // Time filters
  created_after?: string; // ISO 8601
  created_before?: string;
  published_after?: string;
  published_before?: string;
  
  // Include related data
  include?: string; // Comma-separated
}
```

**Example:**
```http
GET /api/v1/content?type=class&difficulty=intermediate&tags=vinyasa,morning&sort=published_at:desc&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "pages": 8
  },
  "links": {
    "first": "/api/v1/content?page=1&limit=20",
    "prev": null,
    "next": "/api/v1/content?page=2&limit=20",
    "last": "/api/v1/content?page=8&limit=20"
  }
}
```

### Content Status Management

#### Publish Content
```http
POST /api/v1/content/{id}/publish
```

**Request Body (optional):**
```json
{
  "scheduled_for": "2024-02-15T09:00:00Z",
  "notify_students": true,
  "social_share": {
    "facebook": true,
    "instagram": true,
    "twitter": false
  }
}
```

#### Unpublish Content
```http
POST /api/v1/content/{id}/unpublish
```

#### Archive Content
```http
POST /api/v1/content/{id}/archive
```

#### Submit for Review
```http
POST /api/v1/content/{id}/review
```

**Request Body:**
```json
{
  "reviewer_notes": "Please check the audio quality in the meditation section",
  "reviewers": ["user_id_1", "user_id_2"]
}
```

### Media Management

#### Upload Media
```http
POST /api/v1/content/{id}/media
```

**Request Headers:**
```http
Content-Type: multipart/form-data
```

**Request Body (FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileBlob);
formData.append('type', 'video');
formData.append('purpose', 'main');
formData.append('metadata', JSON.stringify({
  title: 'Main class video',
  description: 'Full class recording'
}));
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "media_123",
    "url": "https://storage.dzenyoga.com/media/...",
    "cdn_url": "https://cdn.dzenyoga.com/media/...",
    "type": "video",
    "duration_seconds": 2700,
    "processing_status": "processing",
    "created_at": "2024-02-01T10:00:00Z"
  }
}
```

#### Chunked Upload (Large Files)
```http
POST /api/v1/media/upload/init
```

**Request Body:**
```json
{
  "filename": "class-video.mp4",
  "file_size": 524288000,
  "mime_type": "video/mp4",
  "content_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "upload_id": "upload_xyz",
  "chunk_size": 5242880,
  "total_chunks": 100,
  "upload_urls": [
    "https://storage.dzenyoga.com/upload/chunk/1",
    "https://storage.dzenyoga.com/upload/chunk/2"
  ]
}
```

#### Upload Chunk
```http
PUT /api/v1/media/upload/{upload_id}/chunk/{chunk_number}
```

#### Complete Upload
```http
POST /api/v1/media/upload/{upload_id}/complete
```

#### Get Media Status
```http
GET /api/v1/media/{id}/status
```

**Response:**
```json
{
  "status": "processing",
  "progress": 45,
  "estimated_completion": "2024-02-01T10:05:00Z",
  "outputs": {
    "hls": "pending",
    "thumbnail": "completed",
    "preview": "processing"
  }
}
```

### Pose Sequence Management

#### Add Pose to Sequence
```http
POST /api/v1/content/{id}/sequences
```

**Request Body:**
```json
{
  "pose_id": "pose_123",
  "sequence_order": 5,
  "duration_seconds": 30,
  "side": "right",
  "breath_count": 5,
  "instruction_override": "Keep your back knee lifted",
  "verbal_cues": ["Ground through your front foot", "Lift your heart"],
  "transition_in": "From downward dog",
  "transition_out": "Step back to plank"
}
```

#### Update Sequence
```http
PUT /api/v1/content/{id}/sequences/{sequence_id}
```

#### Reorder Sequences
```http
POST /api/v1/content/{id}/sequences/reorder
```

**Request Body:**
```json
{
  "sequences": [
    {"id": "seq_1", "order": 1},
    {"id": "seq_3", "order": 2},
    {"id": "seq_2", "order": 3}
  ]
}
```

#### Generate Sequence with AI
```http
POST /api/v1/content/{id}/sequences/generate
```

**Request Body:**
```json
{
  "focus": "hip_opening",
  "duration_minutes": 20,
  "difficulty": "intermediate",
  "peak_pose": "pigeon_pose",
  "include_poses": ["warrior_1", "warrior_2"],
  "exclude_poses": ["headstand", "scorpion"]
}
```

### Content Relationships

#### Create Relationship
```http
POST /api/v1/content/{id}/relationships
```

**Request Body:**
```json
{
  "child_id": "content_456",
  "relationship_type": "contains",
  "sequence_order": 1,
  "is_required": true,
  "unlock_after_days": 0,
  "metadata": {
    "notes": "Foundation class for the program"
  }
}
```

#### List Relationships
```http
GET /api/v1/content/{id}/relationships
```

**Query Parameters:**
- `type`: Filter by relationship type
- `direction`: `parents` | `children` | `both`

### Templates

#### List Templates
```http
GET /api/v1/templates
```

**Query Parameters:**
- `type`: Content type filter
- `category`: Template category
- `is_public`: Boolean
- `is_featured`: Boolean

#### Use Template
```http
POST /api/v1/content/from-template
```

**Request Body:**
```json
{
  "template_id": "template_123",
  "overrides": {
    "title": "My Custom Class",
    "duration_minutes": 60
  }
}
```

### Analytics

#### Get Content Analytics
```http
GET /api/v1/content/{id}/analytics
```

**Query Parameters:**
- `period`: `day` | `week` | `month` | `year` | `all`
- `metrics`: Comma-separated list of metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "view_count": 1234,
      "unique_viewers": 567,
      "completion_rate": 0.78,
      "avg_watch_time_seconds": 1890,
      "rating": 4.7
    },
    "timeline": [
      {
        "date": "2024-02-01",
        "views": 45,
        "completions": 35
      }
    ],
    "demographics": {
      "age_groups": {...},
      "locations": {...}
    },
    "engagement": {
      "drop_off_points": [...],
      "replay_sections": [...],
      "skip_sections": [...]
    }
  }
}
```

#### Get Teacher Analytics
```http
GET /api/v1/teachers/{id}/analytics
```

### AI Integration

#### Generate Content
```http
POST /api/v1/ai/generate
```

**Request Body:**
```json
{
  "type": "class",
  "prompt": "Create a 30-minute morning flow focusing on back flexibility",
  "parameters": {
    "difficulty": "beginner",
    "include_poses": ["cat_cow", "cobra"],
    "style": "hatha",
    "props": ["mat", "strap"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Gentle Morning Back Opening Flow",
    "description": "A nurturing 30-minute practice...",
    "sequences": [...],
    "metadata": {...},
    "suggestions": [
      "Consider adding child's pose between intense backbends",
      "Include a counter-pose like knees-to-chest"
    ]
  }
}
```

#### Validate Safety
```http
POST /api/v1/ai/validate-safety
```

**Request Body:**
```json
{
  "content_id": "content_123",
  "check_types": ["pose_progression", "contraindications", "warmup_cooldown"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "is_safe": false,
    "warnings": [
      {
        "type": "progression",
        "severity": "high",
        "message": "Wheel pose appears without adequate preparation",
        "suggestion": "Add bridge pose and supported backbends first"
      }
    ],
    "recommendations": [...]
  }
}
```

#### Generate Description
```http
POST /api/v1/ai/generate-description
```

**Request Body:**
```json
{
  "content_id": "content_123",
  "style": "engaging",
  "length": "medium",
  "include_seo": true,
  "target_audience": "beginners"
}
```

## GraphQL API

### Schema Overview

```graphql
type Query {
  content(id: ID!): Content
  contents(
    filter: ContentFilter
    sort: ContentSort
    pagination: PaginationInput
  ): ContentConnection!
  
  myContent(status: ContentStatus): [Content!]!
  
  pose(id: ID!): Pose
  poses(filter: PoseFilter): [Pose!]!
  
  template(id: ID!): Template
  templates(type: ContentType): [Template!]!
}

type Mutation {
  createContent(input: CreateContentInput!): Content!
  updateContent(id: ID!, input: UpdateContentInput!): Content!
  deleteContent(id: ID!, permanent: Boolean): Boolean!
  
  publishContent(id: ID!, scheduled: DateTime): Content!
  unpublishContent(id: ID!): Content!
  
  uploadMedia(contentId: ID!, file: Upload!): MediaAsset!
  
  addPoseToSequence(
    contentId: ID!
    input: PoseSequenceInput!
  ): PoseSequence!
  
  generateContentWithAI(
    prompt: String!
    parameters: AIParameters
  ): GeneratedContent!
}

type Subscription {
  contentProcessing(id: ID!): ProcessingUpdate!
  mediaUploadProgress(id: ID!): UploadProgress!
}
```

### Example Queries

#### Complex Content Query
```graphql
query GetContentWithDetails($id: ID!) {
  content(id: $id) {
    id
    title
    description
    type
    status
    
    teacher {
      id
      name
      avatar
    }
    
    media {
      id
      type
      url
      duration
    }
    
    sequences {
      id
      order
      pose {
        name_english
        name_sanskrit
        category
      }
      duration_seconds
    }
    
    analytics {
      view_count
      completion_rate
      avg_rating
    }
    
    relationships {
      children {
        id
        title
        type
      }
    }
  }
}
```

#### Batch Operations
```graphql
mutation BatchUpdateContent($updates: [BatchUpdateInput!]!) {
  batchUpdate(updates: $updates) {
    successful {
      id
      title
    }
    failed {
      id
      error
    }
  }
}
```

## WebSocket API

### Real-time Updates

#### Connection
```javascript
const ws = new WebSocket('wss://api.dzenyoga.com/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'jwt_token'
  }));
};
```

#### Subscribe to Updates
```javascript
// Subscribe to content processing updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'content.processing',
  content_id: 'content_123'
}));

// Subscribe to media upload progress
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'media.upload',
  upload_id: 'upload_xyz'
}));
```

#### Message Format
```json
{
  "type": "update",
  "channel": "content.processing",
  "data": {
    "content_id": "content_123",
    "status": "processing",
    "progress": 75,
    "current_step": "Generating thumbnails"
  },
  "timestamp": "2024-02-01T10:00:00Z"
}
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required",
        "code": "required"
      }
    ],
    "request_id": "req_123abc"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `PROCESSING_ERROR` | 422 | Business logic error |
| `MEDIA_ERROR` | 400 | Media upload/processing failed |
| `SERVER_ERROR` | 500 | Internal server error |

## Rate Limiting

### Limits by Endpoint

| Endpoint Pattern | Limit | Window |
|-----------------|-------|---------|
| `GET /api/v1/content` | 100 | 1 minute |
| `POST /api/v1/content` | 10 | 1 minute |
| `POST /api/v1/media/*` | 5 | 1 minute |
| `POST /api/v1/ai/*` | 20 | 1 hour |
| All other endpoints | 60 | 1 minute |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
```

## Webhooks

### Webhook Events

Teachers can subscribe to webhooks for various events:

```json
{
  "event": "content.published",
  "data": {
    "content_id": "content_123",
    "title": "Morning Flow",
    "published_at": "2024-02-01T10:00:00Z"
  },
  "timestamp": "2024-02-01T10:00:00Z",
  "signature": "sha256=..."
}
```

### Available Events
- `content.created`
- `content.published`
- `content.deleted`
- `media.processed`
- `media.failed`
- `review.completed`
- `analytics.milestone` (e.g., 1000 views)

## SDK Examples

### JavaScript/TypeScript SDK

```typescript
import { DzenYogaSDK } from '@dzenyoga/sdk';

const sdk = new DzenYogaSDK({
  apiKey: process.env.DZENYOGA_API_KEY,
  environment: 'production'
});

// Create content
const content = await sdk.content.create({
  type: 'class',
  title: 'Morning Flow',
  difficulty: 'beginner',
  duration: 30
});

// Upload media
const media = await sdk.media.upload(content.id, {
  file: videoFile,
  type: 'video',
  purpose: 'main'
});

// Publish content
await sdk.content.publish(content.id);

// Get analytics
const analytics = await sdk.analytics.getContent(content.id, {
  period: 'month'
});
```

### Python SDK

```python
from dzenyoga import DzenYogaClient

client = DzenYogaClient(api_key="...")

# Create content
content = client.content.create(
    type="meditation",
    title="Evening Meditation",
    duration=15
)

# Add media
media = client.media.upload(
    content_id=content.id,
    file_path="meditation.mp3",
    type="audio"
)

# Generate with AI
generated = client.ai.generate(
    prompt="Create a 10-minute breathing exercise for stress relief",
    type="breathing"
)
```

## Testing

### Test Environment
- Base URL: `https://sandbox-api.dzenyoga.com/v1`
- Test API Keys available in dashboard
- Data is reset daily

### Postman Collection
Available at: `https://api.dzenyoga.com/postman-collection.json`

### cURL Examples

```bash
# Create content
curl -X POST https://api.dzenyoga.com/v1/content \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "class",
    "title": "Test Class",
    "duration_minutes": 30
  }'

# Upload media
curl -X POST https://api.dzenyoga.com/v1/content/$ID/media \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@video.mp4" \
  -F "type=video" \
  -F "purpose=main"
```

## API Versioning

- Current version: `v1`
- Version in URL path: `/api/v1/...`
- Deprecation notice: 6 months
- Sunset period: 12 months after deprecation

### Version Headers
```http
X-API-Version: 1
X-API-Deprecation: 2025-01-01
X-API-Sunset: 2025-07-01
```

This comprehensive API design provides a robust foundation for the teacher content creation system, supporting both simple and complex use cases while maintaining consistency and scalability.