# 📚 API Client Documentation - Complete Suite

Welcome to the ImpactEdu Web API Client documentation! This comprehensive suite provides everything you need to integrate with the backend API.

## 🎯 Start Here

**New to the API Client?** → Read [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)

**Want to build something?** → Check [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

**Just need quick syntax?** → Use [CHEAT_SHEET.md](./CHEAT_SHEET.md)

## 📖 Documentation Files

### 1. 🚀 [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)
Complete overview of what was created and how to use it.
- What's included
- Quick start guide
- Feature list
- Next steps

### 2. 📋 [API_REFERENCE.md](./API_REFERENCE.md)
Comprehensive reference for all 55+ API endpoints.
- Every endpoint documented
- Request/response examples
- Error codes explained
- Configuration details

### 3. 💻 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
Real-world code examples and patterns.
- 7 complete feature implementations
- React component patterns
- Custom hooks examples
- Error handling strategies
- Best practices

### 4. ⚡ [CHEAT_SHEET.md](./CHEAT_SHEET.md)
Quick copy-paste reference for common tasks.
- 40+ code snippets
- All CRUD operations
- React patterns
- Can be used offline

### 5. 🔧 [services-index.md](./services-index.md)
Navigation guide and system overview.
- File organization
- Feature matrix
- Endpoint categories
- Contributing guidelines

### 6. 📝 [api.types.ts](./api.types.ts)
Complete TypeScript type definitions.
- 25+ exported interfaces
- Full IDE autocompletion
- Type safety for all responses
- Import for type annotations

### 7. 🔌 [api.ts](./api.ts)
Main API client implementation.
- 55+ API methods
- Automatic retry logic
- Error handling
- Token management

## 🎓 Learning Path

```
1. Start Here
   ↓
2. SETUP_SUMMARY.md (5 min read)
   ↓
3. Choose Your Path:
   
   Path A: Learn by Example
   └─→ IMPLEMENTATION_GUIDE.md
   
   Path B: Quick Reference
   └─→ CHEAT_SHEET.md
   
   Path C: Deep Dive
   └─→ API_REFERENCE.md
   ↓
4. Start Building!
```

## 🚀 Quick Start

```typescript
// 1. Import the client
import { apiClient } from '@/services/api';

// 2. Use in your component
const courses = await apiClient.getCourses();

// 3. With types (optional)
import type { Course } from '@/services/api.types';
const course: Course = await apiClient.getCourse('id');
```

## 📊 What's Available

### Core Features
- ✅ User Authentication (login, register, logout)
- ✅ Course Management (create, browse, search)
- ✅ Learning Progress (track lessons, quizzes, certificates)
- ✅ Community Features (discussions, follow users)
- ✅ Reviews & Ratings (submit reviews, rate courses)
- ✅ Notifications (get, mark read, delete)
- ✅ Wishlist Management (save courses)
- ✅ Instructor Tools (create courses, manage lessons)
- ✅ Payments (initiate, verify, subscribe)
- ✅ Analytics (track events, view statistics)
- ✅ Admin Features (manage users, moderate content)

### Features of the Client Itself
- ✅ Automatic token management
- ✅ Retry logic with exponential backoff
- ✅ Comprehensive error handling
- ✅ TypeScript support
- ✅ Form data/file upload support
- ✅ Request interceptors
- ✅ 30-second timeout
- ✅ Auto-login redirect on 401

## 🔑 Key Concepts

### 1. Simple Requests
```typescript
const courses = await apiClient.getCourses();
```

### 2. Error Handling
```typescript
try {
  const course = await apiClient.getCourse(id);
} catch (error: any) {
  alert('Error: ' + error.message);
}
```

### 3. Type Safety
```typescript
import type { CourseProgress } from '@/services/api.types';
const progress: CourseProgress = await apiClient.getCourseProgress(id);
```

### 4. React Patterns
```typescript
const [data, setData] = useState(null);
useEffect(() => {
  apiClient.getCourses().then(r => setData(r.data));
}, []);
```

## 📍 File Structure

```
src/services/
├── README.md (this file)
├── SETUP_SUMMARY.md              ← Start here for overview
├── api.ts                         ← Main client (55+ methods)
├── api.types.ts                   ← TypeScript types
├── API_REFERENCE.md               ← Full endpoint docs
├── IMPLEMENTATION_GUIDE.md        ← Code examples
├── CHEAT_SHEET.md                 ← Quick reference
└── services-index.md              ← Navigation & overview
```

## 🎯 Use Cases

### For Building Course Pages
→ See IMPLEMENTATION_GUIDE.md → "Course Discovery & Browsing"

### For Student Profile
→ See IMPLEMENTATION_GUIDE.md → "User Profile Management"

### For Lesson Player
→ See IMPLEMENTATION_GUIDE.md → "Course Learning & Progress"

### For Discussion Forum
→ See IMPLEMENTATION_GUIDE.md → "Forum & Discussions"

### For Course Reviews
→ See IMPLEMENTATION_GUIDE.md → "Course Reviews & Ratings"

### For Checkout
→ See IMPLEMENTATION_GUIDE.md → "Shopping & Payments"

## 🔍 Finding What You Need

| I want to... | I should read... |
|---|---|
| Use the API client | SETUP_SUMMARY.md |
| Learn by examples | IMPLEMENTATION_GUIDE.md |
| Quick copy-paste code | CHEAT_SHEET.md |
| Look up an endpoint | API_REFERENCE.md |
| Understand the system | services-index.md |
| Get type definitions | api.types.ts |
| See the code | api.ts |

## 💡 Pro Tips

1. **Use TypeScript**: Import types from `api.types.ts` for IDE autocomplete
2. **Handle Errors**: Always use try-catch with API calls
3. **Check Cheat Sheet**: Before writing code, check CHEAT_SHEET.md
4. **Monitor Loading**: Implement loading states for user feedback
5. **Cache Data**: Reuse responses to reduce API calls

## 🔒 Security Checklist

- ✅ Never store passwords in localStorage
- ✅ Tokens are auto-managed (you don't need to touch them)
- ✅ Auto-redirect to login on 401
- ✅ Always validate user input
- ✅ Use HTTPS in production
- ✅ Implement CSRF protection
- ✅ Monitor for suspicious activity

## ⚙️ Configuration

The client is configured in `api.ts`:

```typescript
// Base URL (from environment)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// Timeout: 30 seconds
timeout: 30000

// Retries: 3 attempts with exponential backoff
maxRetries = 3
```

To configure base URL:
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## 📈 Performance Notes

- Client implements automatic retry logic (3 attempts)
- Requests timeout after 30 seconds
- Exponential backoff: 1s, 2s, 4s delays
- Form data/multipart requests fully supported
- Request interception for auth tokens

## 🧪 Testing

When testing components that use the API client:

```typescript
jest.mock('@/services/api', () => ({
  apiClient: {
    getCourses: jest.fn(() => 
      Promise.resolve({ data: [{ id: '1', title: 'Test' }] })
    ),
  },
}));
```

## 🆘 Common Questions

**Q: How do I authenticate?**
A: Use `apiClient.login()` then the token is auto-managed

**Q: What happens when token expires?**
A: Auto-redirected to `/auth/login` on 401 error

**Q: How do I upload files?**
A: Use `uploadProfilePicture()` or `uploadLessonMedia()` methods

**Q: Can I make custom requests?**
A: Yes, use generic `get()`, `post()`, `put()`, `delete()` methods

**Q: How do I add caching?**
A: Wrap the API client calls with a caching library or Map

## 📞 Documentation by Feature

| Feature | Where to Learn |
|---------|---|
| Authentication | IMPLEMENTATION_GUIDE.md → Example 1 |
| Courses | IMPLEMENTATION_GUIDE.md → Example 2 |
| Learning | IMPLEMENTATION_GUIDE.md → Example 3 |
| Profile | IMPLEMENTATION_GUIDE.md → Example 4 |
| Reviews | IMPLEMENTATION_GUIDE.md → Example 5 |
| Discussions | IMPLEMENTATION_GUIDE.md → Example 6 |
| Payments | IMPLEMENTATION_GUIDE.md → Example 7 |

## 🚀 Next Steps

1. **Browse the documentation** - each file serves a different purpose
2. **Review examples** - check IMPLEMENTATION_GUIDE.md for your use case
3. **Start coding** - import apiClient and build
4. **Reference** - use CHEAT_SHEET.md and API_REFERENCE.md as needed

## 📊 Statistics

- **API Client Methods:** 55+
- **Documented Endpoints:** 55+
- **TypeScript Interfaces:** 25+
- **Code Examples:** 40+
- **Documentation Pages:** 7
- **Total Documentation:** 10,000+ words

## ✨ Features at a Glance

```
Authentication          ✅ 3 methods
User Management         ✅ 7 methods
Course Management       ✅ 8 methods
Learning & Progress     ✅ 4 methods
Discussions             ✅ 5 methods
Notifications           ✅ 4 methods
Reviews & Ratings       ✅ 3 methods
Wishlist               ✅ 3 methods
Instructor Tools       ✅ 6 methods
Payments               ✅ 5 methods
Analytics              ✅ 2 methods
Admin Features         ✅ 4 methods
Generic Methods        ✅ 4 methods
─────────────────────────────────
Total                  ✅ 55+ methods
```

## 🎓 Learning Resources

- **Official Docs:** [API_REFERENCE.md](./API_REFERENCE.md)
- **Code Examples:** [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Quick Ref:** [CHEAT_SHEET.md](./CHEAT_SHEET.md)
- **System Info:** [services-index.md](./services-index.md)
- **Overview:** [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)

## 📞 Support

If you can't find what you need:
1. Check the Quick Find table above
2. Search the relevant documentation file
3. Review IMPLEMENTATION_GUIDE.md for similar features
4. Look at CHEAT_SHEET.md for quick patterns

---

**Status:** ✅ Complete & Production Ready
**Version:** 1.0
**Last Updated:** 2024

**Happy coding! 🚀**
