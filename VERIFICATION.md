# ResumeLens - Verification Checklist

Use this checklist to verify the project is working correctly after setup.

## Pre-Startup Checks

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Project cloned/extracted to local directory
- [ ] OpenRouter API key obtained from https://openrouter.ai
- [ ] `backend/.env` created with LLM_API_KEY set
- [ ] All dependencies installed (`npm run install:all`)

## Backend Startup

1. Open Terminal and navigate to project root
2. Run: `npm run dev:backend`
3. Verify output includes:
   - [ ] `🚀 Resume ATS Score Generator API running on port 5000`
   - [ ] List of API endpoints displayed
   - [ ] No error messages in console

## Backend Endpoint Tests

In a new terminal, test each endpoint:

```bash
# Health check
curl http://localhost:5000/api/health
# Expected: { "status": "ok", ... }
- [ ] Returns OK status

# Get roles
curl http://localhost:5000/api/roles
# Expected: { "roles": [...] }
- [ ] Returns array of roles

# Test with invalid endpoint
curl http://localhost:5000/api/invalid
# Expected: 404 error
- [ ] Returns 404 for invalid endpoints
```

## Frontend Startup

1. Open new Terminal at project root
2. Run: `npm run dev:frontend`
3. Verify output includes:
   - [ ] `VITE v...` version displayed
   - [ ] Development server ready message
   - [ ] Browser opens to http://localhost:3000
   - [ ] No build errors

## Frontend Visual Checks

1. Page loads and displays:
   - [ ] "ResumeLens" header visible
   - [ ] Hero section with tagline
   - [ ] Resume upload area with drag-and-drop indicator
   - [ ] Evaluation mode selection (Job Description / Target Role / General)
   - [ ] Submit button visible

2. Interaction checks:
   - [ ] Can select different evaluation modes
   - [ ] Conditional fields appear based on mode selection
   - [ ] Mode selector cards update their appearance when clicked
   - [ ] File upload area responds to hover

## API Integration Tests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a test resume:
   - [ ] File upload validation works (rejects invalid files)
   - [ ] Shows file size and name in UI
   - [ ] "Check ATS Score" button enabled
4. Submit for analysis:
   - [ ] Network tab shows POST to `/api/analyze`
   - [ ] Request includes file and mode parameters
   - [ ] Response received within 30 seconds
   - [ ] Console shows no CORS errors

## Results Page Checks

After successful analysis, verify:

1. Route changed to `/results`
   - [ ] URL is http://localhost:3000/results

2. Overall score displayed:
   - [ ] Score circle shows correct number (0-100)
   - [ ] Score label matches range (Excellent/Good/Fair/Poor)
   - [ ] Progress bar/circle animation visible

3. Category breakdown displayed:
   - [ ] Multiple category cards visible (usually 3-6)
   - [ ] Each card shows category name and score
   - [ ] Progress bar visual for each category
   - [ ] "View Details" buttons present

4. Strengths and concerns:
   - [ ] "Key Strengths" section visible if available
   - [ ] "Red Flags" section visible if available
   - [ ] "Areas of Concern" section visible if available

5. Suggestions section:
   - [ ] "AI-Powered Suggestions" section visible
   - [ ] List of specific improvement suggestions
   - [ ] Suggestions are actionable and specific

6. Navigation:
   - [ ] "Try Another Resume" button present and functional
   - [ ] Clicking it returns to landing page

## Error Handling Tests

1. Test with invalid resume file:
   - [ ] Upload non-PDF/DOCX file → Error message displayed
   - [ ] Upload corrupted PDF → Error message displayed
   - [ ] Upload image file → Error message displayed

2. Test with missing parameters:
   - [ ] Submit with no resume → Error message shows
   - [ ] Job Description mode with no description → Error message shows
   - [ ] Target Role mode with no role selected → Error message shows

3. Test with API failures (simulate by stopping backend):
   - [ ] Stop backend server
   - [ ] Try to analyze resume
   - [ ] Error message displays in UI
   - [ ] Doesn't hang or freeze
   - [ ] Start backend again and functionality restored

## Performance Checks

1. Resume analysis time:
   - [ ] Completes within 30 seconds (most within 5-10 seconds)
   - [ ] UI shows loading state while processing
   - [ ] Spinner animation visible during analysis

2. Large file test:
   - [ ] Upload 5MB PDF → Processes successfully
   - [ ] Upload 9MB DOCX → Processes successfully
   - [ ] Try to upload 11MB file → Rejected with size error

3. Multiple analyses:
   - [ ] Can analyze multiple resumes in sequence
   - [ ] Results page updates correctly each time
   - [ ] No memory leaks or slowdown with multiple uploads

## Responsive Design Checks

1. Desktop (1920x1080):
   - [ ] Layout looks professional and organized
   - [ ] All buttons and forms properly sized
   - [ ] No horizontal scrolling

2. Tablet (768x1024):
   - [ ] Layout adapts (if responsive CSS implemented)
   - [ ] Touch targets are large enough
   - [ ] Navigation remains functional

3. Mobile (375x667):
   - [ ] Layout is mobile-friendly
   - [ ] Text is readable (not too small)
   - [ ] Buttons are tappable
   - [ ] Modal/cards don't overflow

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Each should show:
- [ ] No console errors
- [ ] No visual glitches
- [ ] Proper styling applied

## Data Privacy Verification

1. Check network traffic:
   - [ ] Resume data sent only to backend
   - [ ] No third-party tracking requests
   - [ ] No resume stored in local storage

2. Check backend logs:
   - [ ] No resume file created in uploads directory (should be cleaned up)
   - [ ] No sensitive data logged to console

## Final Smoke Test

Complete end-to-end flow:

1. [ ] Open http://localhost:3000
2. [ ] See landing page loaded
3. [ ] Upload resume (PDF or DOCX)
4. [ ] Select "General ATS" mode
5. [ ] Click "Check ATS Score"
6. [ ] Wait for analysis
7. [ ] See results page with:
   - [ ] Overall score
   - [ ] Score categories
   - [ ] Strengths and weaknesses
   - [ ] Suggestions
8. [ ] Click "Try Another Resume"
9. [ ] Return to landing page successfully

## Deployment Readiness

Before deploying to production:

- [ ] All checks above passed
- [ ] No console errors or warnings
- [ ] Environment variables set correctly
- [ ] API key valid and has quota
- [ ] Backend logs clean (no errors)
- [ ] Frontend optimized build tested (`npm run build`)
- [ ] Correct CORS origins configured

## Troubleshooting

If any check fails, refer to:

1. **QUICKSTART.md** - Quick setup issues
2. **SETUP.md** - Detailed setup and API documentation
3. **FIX_SUMMARY.md** - What was fixed and how it works
4. **README.md** - Original project documentation

## Success Criteria

✅ **Project is working correctly if:**
- All pre-startup checks pass
- Backend starts without errors
- Frontend loads in browser
- Can upload resume and get analysis
- Results display correctly
- No API errors in console
- Multiple analyses work in sequence

## Sign-Off

Date verified: _______________
Verified by: _______________
Notes: _____________________

All checks passed? Ready to deploy! 🚀
