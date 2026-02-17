# MongoDB Setup Instructions

This application has been updated to use MongoDB as its primary database.

## Prerequisites

1.  **MongoDB Server**: You need a running MongoDB instance.
    *   **Local**: Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community) and run it as a service. It typically runs on `mongodb://localhost:27017`.
    *   **Cloud**: Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database) and get your connection string.

## Configuration

The database connection string is located in the `.env` file:

```env
DATABASE_URL="mongodb://localhost:27017/viewer"
```

If you are using a cloud database or a different port, update this value.

## Initialization

After starting your MongoDB server, run the following command to set up the database structure (indexes):

```bash
npx prisma db push
```

## Running the App

Once the database is connected, start the application:

```bash
npm run dev
```

## Note on Video/Image Storage

-   **Metadata**: All posts, shots, users, and comments are stored in MongoDB.
-   **Files**: Large media files (videos/images) are still saved to the local `public/uploads` directory for performance. The paths to these files are stored in MongoDB.
-   **Structure**: The database uses native MongoDB `ObjectId`s for all records.
