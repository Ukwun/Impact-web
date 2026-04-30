import { test, expect, request as playwrightRequest } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Course Upload API (Cloudflare R2/S3)', () => {
  const apiUrl = '/api/courses/upload';
  const facilitatorToken = process.env.PLAYWRIGHT_FACILITATOR_TOKEN || 'test-facilitator-token';

  test('should upload a video, pdf, and doc to S3/R2 and create course', async () => {
    const videoPath = path.resolve(__dirname, 'fixtures', 'sample-video.mp4');
    const pdfPath = path.resolve(__dirname, 'fixtures', 'sample.pdf');
    const docPath = path.resolve(__dirname, 'fixtures', 'sample.docx');

    const apiRequest = await playwrightRequest.newContext({
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
      extraHTTPHeaders: {
        authorization: `Bearer ${facilitatorToken}`,
      },
    });

    const response = await apiRequest.post(apiUrl, {
      multipart: {
        title: 'Playwright E2E Course',
        description: 'Course uploaded via Playwright',
        difficulty: 'BEGINNER',
        duration: '60',
        language: 'English',
        videoFile: fs.createReadStream(videoPath),
        pdfFile: fs.createReadStream(pdfPath),
        wordFile: fs.createReadStream(docPath),
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.uploadedFiles.length).toBe(3);
    expect(json.data.uploadedFiles[0].url).toMatch(/^https:\/\//);
    expect(json.data.course.title).toBe('Playwright E2E Course');
  });
});
