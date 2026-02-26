# Viewer API Documentation

All endpoints are relative to `http://localhost:3000/api`

## 1. System Status
- **GET `/status`**: Checks accessibility and returns operational metadata.

## 2. Posts (Visual Content)
- **GET `/posts`**: List all feed posts with nested user details and engagement counts.
- **POST `/posts`**: Create a new post.
  - Body: `{ "image": string, "caption": string, "userId": string }`
- **GET `/posts/[id]`**: Retrieve full detail for a specific post.
- **PATCH `/posts/[id]`**: Update post caption.
- **DELETE `/posts/[id]`**: Permanently remove a post.
- **POST `/posts/[id]/like`**: Toggle like status for a post.
  - Body: `{ "userId": string }`

## 3. Shots (Short Videos)
- **GET `/shots`**: Fetch all short-form videos.
- **POST `/shots`**: Upload/link a new video shot.
  - Body: `{ "video": string, "caption": string, "userId": string }`

## 4. Users & Profiles
- **GET `/users`**: List all registered creators.
- **POST `/users`**: Register or enable a new user account.
  - Body: `{ "username": "...", "email": "...", "password": "..." }`
- **GET `/profile`**: Fetch current session profile data.

## 5. Metadata
- **Content-Type**: `application/json`
- **Auth Strategy**: (Mocked) Session-based or JSON body `userId` provided.
