# Local Database with Server Synchronization

This document explains how to use the local database feature for offline data storage and synchronization with the server database.

## Overview

The local database solution allows the application to:

1. Store data locally when offline
2. Synchronize data with the server when online
3. Automatically detect network status and switch between local and remote databases
4. Provide a user interface for managing synchronization

## Technology Stack

- **Local Database**: SQLite (via Prisma)
- **Remote Database**: PostgreSQL (via Prisma)
- **ORM**: Prisma with dual schema support
- **Sync Tracking**: Custom fields in local schema to track synchronization status

## Setup

### 1. Install Dependencies

Make sure you have all required dependencies installed:

```bash
npm install
```

### 2. Set Up Local Database

Run the local database setup script:

```bash
npm run local:setup
```

This script will:
- Generate the Prisma client for the local database
- Create the SQLite database file
- Apply the initial migrations

### 3. Configure Environment Variables

Make sure your `.env` file includes the following variables:

```
# Local Database Configuration
ENABLE_LOCAL_DATABASE=true
LOCAL_DATABASE_URL=file:./local.db
LOCAL_DATABASE_SYNC_INTERVAL=300000 # 5 minutes in milliseconds
ENABLE_OFFLINE_MODE=true
```

## Usage

### Automatic Mode

By default, the application will:

1. Try to connect to the remote database
2. If remote connection fails, automatically switch to local database
3. When connection is restored, offer to synchronize data

### Manual Control

You can manually control the database mode and synchronization through the Database Sync Manager:

- **URL**: `/admin/database-sync`
- **Features**:
  - Switch between local and remote database
  - Trigger manual synchronization
  - View synchronization status for each model
  - Monitor pending changes

### API Endpoints

#### Check Database Status

```
GET /api/database/status
```

Response:
```json
{
  "isOnline": true,
  "localDbConnected": true,
  "remoteDbConnected": true,
  "timestamp": "2025-05-29T13:15:00.000Z"
}
```

#### Trigger Synchronization

```
POST /api/database/status
```

Body:
```json
{
  "direction": "BIDIRECTIONAL" // or "TO_SERVER" or "FROM_SERVER"
}
```

Response:
```json
{
  "success": true,
  "results": {
    "User": {
      "recordsProcessed": 5,
      "recordsSucceeded": 5,
      "recordsFailed": 0
    },
    // Other models...
  },
  "errors": {},
  "timestamp": "2025-05-29T13:15:00.000Z"
}
```

## Programmatic Usage

### Database Context

Use the DatabaseContext to access database functionality in your components:

```tsx
import { useDatabase } from '../lib/database/DatabaseContext';

function MyComponent() {
  const { 
    isOnline, 
    syncAllModels, 
    useLocalDatabase 
  } = useDatabase();

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Using: {useLocalDatabase ? 'Local Database' : 'Remote Database'}</p>
      <button onClick={syncAllModels}>Sync Now</button>
    </div>
  );
}
```

### Database Service

Use the DatabaseService for model operations with automatic sync tracking:

```tsx
import { useModelService } from '../lib/database/databaseService';

function PostList() {
  const [posts, setPosts] = useState([]);
  const postService = useModelService('Post');

  useEffect(() => {
    const loadPosts = async () => {
      const data = await postService.findMany({
        include: { user: true }
      });
      setPosts(data);
    };
    
    loadPosts();
  }, []);

  const createPost = async (postData) => {
    const newPost = await postService.create(postData);
    setPosts([...posts, newPost]);
  };

  return (
    // Component JSX
  );
}
```

## Troubleshooting

### Sync Errors

If synchronization fails:

1. Check network connectivity
2. Verify that both databases are accessible
3. Check the sync logs in the SyncLog table
4. Try manual synchronization for specific models

### Data Conflicts

When conflicts occur during synchronization:

1. The system will mark the record with `syncStatus: CONFLICT`
2. You can view conflicts in the Sync Manager
3. Manually resolve conflicts by selecting which version to keep

## Best Practices

1. Always check for network connectivity before performing critical operations
2. Use the `useDatabaseOperation` hook for operations that need sync tracking
3. Periodically trigger synchronization when online
4. Implement conflict resolution UI for important data models
