# 📧 Email API Testing Guide

## Setup Before Testing

1. Start the server:
```bash
npm run dev
```

2. Verify server is running:
```
✅ Server running on http://localhost:3000
✅ Email service ready
```

3. Get your auth token by logging in as admin

---

## Using Postman or cURL

### 1. Get Admin Auth Token

**Endpoint:**
```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@iiitmanipul.ac.in",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc..."
}
```

Copy the token for the next requests.

---

### 2. Get All Teachers Performance

**Endpoint:**
```
GET http://localhost:3000/api/admin/all-teachers
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Dr. Priya Sharma",
    "email": "priya@iiit.ac.in",
    "dept": "CSE",
    "subject": "Data Structures",
    "average_rating": 4.5,
    "total_ratings": 42,
    "doubts_answered": 28,
    "last_rated": "2024-03-31T10:30:00Z"
  }
]
```

---

### 3. Get Top 10 Performers

**Endpoint:**
```
GET http://localhost:3000/api/admin/top-performers
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:** Same format as above, sorted by rating DESC.

---

### 4. Send Email to Specific Teacher

**Endpoint:**
```
POST http://localhost:3000/api/teachers/1/send-performance-email
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "message": "Performance email sent to Dr. Priya Sharma",
  "data": {
    "id": 1,
    "name": "Dr. Priya Sharma",
    "email": "priya@iiit.ac.in",
    "average_rating": 4.5,
    "total_ratings": 42
  }
}
```

**Email Received:** HTML formatted with teacher's stats

---

### 5. Send Bulk Emails to All Teachers

**Endpoint:**
```
POST http://localhost:3000/api/teachers/send-bulk-performance-emails
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk emails sent: 18 success, 0 failed",
  "data": {
    "successCount": 18,
    "failureCount": 0,
    "totalTeachers": 18
  }
}
```

---

## cURL Examples

### Get Teachers (with token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/admin/all-teachers
```

### Send Bulk Email
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/teachers/send-bulk-performance-emails
```

### Send to One Teacher
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/teachers/1/send-performance-email
```

---

## Common Response Errors

### 401 Unauthorized
```json
{ "error": "Invalid token" }
```
✅ Solution: Check token is correct, not expired

### 403 Forbidden
```json
{ "error": "Admin only" }
```
✅ Solution: Login as admin, not student

### 404 Not Found
```json
{ "error": "Teacher not found" }
```
✅ Solution: Check teacher ID exists

### 500 Internal Server Error
```json
{ "error": "Failed to send email" }
```
✅ Solution: Check:
- Email service credentials in .env
- Gmail app password is correct
- 2FA is enabled on Gmail

---

## Email Debugging

### Check Email Service
Open browser console and look for:
- ✅ "✅ Email service ready" = OK
- ❌ "Email service error" = Check .env

### Check Database Connection
```bash
mysql -u root -p -e "SELECT * FROM professors LIMIT 1;"
```

### Check Network in Browser
1. Open DevTools (F12)
2. Go to Network tab
3. Send email
4. Look for the POST request
5. Check response status and body

### Email Logs
Check MySQL:
```sql
SELECT * FROM admin_email_logs ORDER BY sent_at DESC;
```

---

## Rate Limiting & Throttling

Currently **no limits** on:
- Number of emails per day
- API request frequency
- Bulk send sizes

**For production:** Add rate limiting!

---

## Performance Notes

- Bulk emails sent **sequentially** (one at a time)
- Large batches (100+ teachers) may take time
- Each email ~2-5 seconds to send

**Future optimization:** Send emails in parallel with queue system

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Email service shows ready
- [ ] Can login as admin
- [ ] Can access /api/admin/all-teachers
- [ ] Can view top performers
- [ ] Can see teacher details
- [ ] Can send email to one teacher
- [ ] Email arrives in inbox
- [ ] Can send bulk email
- [ ] All teacher emails arrive
- [ ] Email history shows in admin panel

---

## Support

If emails don't send:
1. Check .env has correct Gmail app password
2. Verify 2FA is enabled on Gmail account
3. Check server logs for error messages
4. Try sending from browser dev console:

```javascript
fetch('/api/teachers/send-bulk-performance-emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
}).then(r => r.json()).then(console.log)
```

---

**Last Updated:** March 31, 2026
