# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-upload.spec.ts >> Course Upload API (Cloudflare R2/S3) >> should upload a video, pdf, and doc to S3/R2 and create course
- Location: e2e\course-upload.spec.ts:9:7

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/courses/upload
    - user-agent: Playwright/1.59.1 (x64; windows 10.0) node/22.20
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWNpbGl0YXRvci10ZXN0LTAwMSIsImVtYWlsIjoiZmFjaWxpdGF0b3JAdGVzdC5jb20iLCJyb2xlIjoiRkFDSUxJVEFUT1IiLCJpYXQiOjE3Nzc1MDQ4MDMsImV4cCI6MTc4MDA5NjgwM30.wTwAHg4te_QidSqtNbFWg_-MHYzvManIUeLKeF5AdZc
    - content-type: multipart/form-data; boundary=----WebKitFormBoundaryOwhfEBIs6ozTzgzf
    - content-length: 1304

```