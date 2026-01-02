# MongoDB Setup Guide

## MongoDB Atlas (Cloud) Setup

### 1. Get Your Connection String from MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Click on "Connect" for your cluster
4. Choose "Connect your application"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Update Connection String

Replace the placeholders:
- `<username>` - Your MongoDB Atlas username
- `<password>` - Your MongoDB Atlas password (URL-encode special characters)
- Add your database name after the `/` before the `?`

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/realtime-qa?retryWrites=true&w=majority
```

### 3. URL Encoding Special Characters in Password

If your password contains special characters, you must URL-encode them:

| Character | Encoded |
|-----------|---------|
| `@`       | `%40`   |
| `#`       | `%23`   |
| `$`       | `%24`   |
| `%`       | `%25`   |
| `/`       | `%2F`   |
| `:`       | `%3A`   |
| `?`       | `%3F`   |
| `&`       | `%26`   |
| `=`       | `%3D`   |
| `+`       | `%2B`   |
| ` ` (space)| `%20`   |

**Example:**
- Password: `myP@ss#123`
- Encoded: `myP%40ss%23123`
- Connection string: `mongodb+srv://username:myP%40ss%23123@cluster0.xxxxx.mongodb.net/realtime-qa?retryWrites=true&w=majority`

### 4. Whitelist Your IP Address

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Add your current IP address or use `0.0.0.0/0` for all IPs (less secure, for development only)
4. Click "Confirm"

### 5. Create Database User

1. In MongoDB Atlas, go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database" or create a custom role
6. Click "Add User"

### 6. Update .env File

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-encoded-password@cluster0.xxxxx.mongodb.net/realtime-qa?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## Local MongoDB Setup

If you prefer to use local MongoDB:

1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. In `.env` file, use:
   ```env
   MONGODB_URI=mongodb://localhost:27017/realtime-qa
   ```

## Testing Connection

After setting up, start the server:
```bash
cd backend
npm run dev
```

You should see: `✅ Connected to MongoDB`

If you see an error, check:
1. Connection string format is correct
2. Username and password are correct (and URL-encoded if needed)
3. IP address is whitelisted (for Atlas)
4. Database user has proper permissions
5. Network connection is stable

