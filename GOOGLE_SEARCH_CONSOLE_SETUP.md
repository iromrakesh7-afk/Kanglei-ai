# Google Search Console Setup Guide for Kanglei AI

## Problem: "Cannot be Indexed" Error

This guide will help you fix the indexing issue when adding kangleiai.in to Google Search Console.

## Changes Made to Fix Indexing

### 1. **Middleware Configuration** (`middleware.ts`)
- Allows Google bot and other search engine crawlers to access all public pages
- Prevents authentication redirects from blocking crawler access
- Identified by user-agent string matching

### 2. **Next.js Configuration** (`next.config.mjs`)
- Added proper HTTP headers for search engines
- X-Robots-Tag header telling Google to index the site
- Proper cache control headers

### 3. **Vercel Configuration** (`vercel.json`)
- Rewrite rules for robots.txt and sitemap.xml
- Proper content-type headers
- Cache control headers (86400 seconds = 24 hours)

### 4. **SEO Metadata**
- **Layout metadata**: robots: 'index, follow, max-image-preview:large'
- **Page metadata**: Proper Open Graph tags
- **JSON-LD Schema**: Structured data for search engines
- **Google Verification**: Meta tag added

### 5. **Public Files**
- `robots.txt`: Allows all crawlers, disallows /api and /admin
- `sitemap.xml`: Includes homepage, sign-in, sign-up pages
- `google08f2464684b82fb0.html`: Verification file

### 6. **API Routes**
- `/api/robots`: Serves robots.txt with proper headers
- `/api/sitemap`: Serves sitemap.xml with proper headers

## Steps to Add to Google Search Console

### Step 1: Deploy Changes
1. Make sure all files are committed to your GitHub repository
2. Deploy to Vercel (changes auto-deploy when pushing to main branch)
3. Wait 2-3 minutes for deployment to complete

### Step 2: Verify Domain Ownership
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add property"
3. Enter: `https://kangleiai.in`
4. Select "URL prefix" option
5. Google will show verification options:
   - **Recommended**: HTML file (google08f2464684b82fb0.html) - Already uploaded
   - Alternative: DNS record, HTML tag, Google Analytics, Google Tag Manager

### Step 3: Verify Using HTML File
1. Google Search Console should detect the HTML file at `https://kangleiai.in/google08f2464684b82fb0.html`
2. Click "Verify" button
3. Should show "Verification successful"

### Step 4: Submit Sitemap
1. Once verified, go to Sitemaps section
2. Enter: `https://kangleiai.in/sitemap.xml`
3. Click "Submit"
4. Google will start crawling your pages

### Step 5: Request Indexing
1. Go to "Pages" section
2. Click on the homepage URL: `https://kangleiai.in/`
3. Click "Inspect URL"
4. Click "Request Indexing"
5. Repeat for `/sign-in` and `/sign-up` if desired

### Step 6: Monitor Crawl Status
1. Go to "Crawl stats" to see if Google is crawling
2. Go to "Coverage" to see indexed pages
3. Go to "Enhancements" to check if structured data (JSON-LD) is recognized

## Testing Indexability

### Test 1: Check robots.txt
```
Visit: https://kangleiai.in/robots.txt
Should see: User-agent: * / Allow: /
```

### Test 2: Check Sitemap
```
Visit: https://kangleiai.in/sitemap.xml
Should see XML with URLs
```

### Test 3: Check Robots Meta Tag
```
Use browser developer tools → Network → index (refresh)
Headers should include: X-Robots-Tag: index, follow...
```

### Test 4: Use Google's URL Inspector
1. Go to Google Search Console
2. Click URL Inspection Tool
3. Enter: `https://kangleiai.in`
4. Should show "URL is on Google"

## Common Issues and Solutions

### Issue: "URL not found in Google index"
**Solution:**
1. Wait 24-48 hours after first verification
2. Submit sitemap again
3. Use URL Inspection → Request Indexing

### Issue: "Blocked by robots.txt"
**Solution:**
1. Check `/robots.txt` - should allow /
2. Verify no `X-Robots-Tag: noindex` headers
3. Check middleware isn't blocking access

### Issue: "Blocked by noindex"
**Solution:**
1. Verify layout.tsx doesn't have noindex
2. Check next.config.mjs headers
3. Look for any conflicting meta tags

### Issue: "SSL Certificate Issues"
**Solution:**
1. Ensure domain SSL is valid
2. In Google Search Console settings, prefer https://
3. Check Vercel deployment status

## Files You Can Delete After Setup
- `GOOGLE_SEARCH_CONSOLE_SETUP.md` (this file)
- `google08f2464684b82fb0.html` (only needed for verification)

## Important Notes

1. **Deployment Required**: All changes are in code. Must deploy to production at kangleiai.in
2. **DNS Setup**: Your domain must be properly configured to point to your Vercel deployment
3. **SSL Certificate**: Must be valid (Vercel handles this automatically)
4. **Wait Time**: After adding domain, wait 2-7 days for initial crawl
5. **Check Status Regularly**: Monitor Search Console for errors or warnings

## Success Indicators

After 3-7 days, you should see:
- Green checkmark next to domain in Search Console
- Homepage showing in "Coverage" section
- Googlebot crawl activity in "Crawl Stats"
- Pages starting to appear in Google Search results

## Questions?

If you still see indexing errors:
1. Check Vercel deployment logs
2. Verify domain DNS configuration
3. Ensure no authentication middleware is blocking bots
4. Check Google Search Console for specific error messages
5. Use Search Console "Coverage" report for detailed error information
