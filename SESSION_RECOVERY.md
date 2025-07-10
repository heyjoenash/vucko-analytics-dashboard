# Session Recovery Document - Signals & Actions App
**Last Updated:** 2025-01-10 15:45 PST

## 🚨 Critical Fixes Applied

### 1. JavaScript Syntax Errors Fixed
- **Line 705**: Fixed complex onerror handler that was breaking JavaScript execution
  - Changed from innerHTML manipulation to simple image replacement with base64 SVG
  - Original had nested quotes causing syntax errors
  
### 2. Smart Quotes Removed
- Replaced all smart quotes (', ', ", ") with regular quotes throughout the file
- Used sed commands to clean up the entire file

### 3. Tailwind CSS CDN Fixed
- Updated from `https://cdn.tailwindcss.com` to `https://cdn.tailwindcss.com?plugins=forms,typography`
- This fixed the PostCSS plugin errors in console

## 🔍 Potential Remaining Issues

### 1. Supabase Configuration
- The `anonKey` in config.js is actually a service_role key (check the JWT payload)
- This might cause CORS issues in browser environments
- Consider getting the proper anon key from Supabase dashboard

### 2. Dependencies to Verify
- Supabase JS library loading from CDN
- Font Awesome CSS loading
- Swiss Design CSS file exists at `styles/swiss-design.css`
- Sidebar component exists at `components/sidebar.html`

## 🛠️ Quick Diagnostic Steps

1. **Check Browser Console**
   ```
   - Open http://localhost:4200 in Chrome
   - Open Developer Tools (F12)
   - Check Console tab for any red errors
   - Check Network tab for any failed resource loads
   ```

2. **Test Debug Page**
   ```
   - Open http://localhost:4200/debug.html
   - This will show which dependencies are loading correctly
   ```

3. **Verify Server Running**
   ```bash
   ps aux | grep "python.*http.server.*4200"
   # If not running:
   cd /Users/josephnash/github/signals-actions-lite/app
   python3 -m http.server 4200
   ```

## 📋 Complete Fix Commands Applied

```bash
# 1. Fixed Tailwind CDN in index.html (line 10)
# 2. Fixed onerror handler (line 705) 
# 3. Removed all smart quotes
sed -i '' "s/'/'/g" index.html
sed -i '' "s/'/'/g" index.html
sed -i '' 's/"/"/g' index.html
sed -i '' 's/"/"/g' index.html

# 4. Restarted server
pkill -f "python.*http.server.*4200"
python3 -m http.server 4200 > /dev/null 2>&1 &
```

## 🚀 Next Steps if Still Broken

1. **Check Supabase Connection**
   - Verify the Supabase URL is correct
   - Get proper anon key (not service role) from Supabase dashboard
   - Test connection with curl or Postman

2. **Simplify and Test**
   - Try opening debug.html first
   - Comment out Supabase calls temporarily
   - Add more console.log statements

3. **Browser Cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Try in a new incognito window
   - Clear all site data for localhost:4200

4. **Alternative Recovery**
   - The app has backups in git history
   - Other working HTML files: strategies.html, audiences.html, personas.html
   - Can rebuild from these if needed

## 📍 Current App State
- Main file: `/Users/josephnash/github/signals-actions-lite/app/index.html`
- Server should be running on: http://localhost:4200
- Database: Supabase (misuahtcociqkmkajvrw.supabase.co)
- Has data: 283 people imported from Apify run

## 🆘 Emergency Recovery
If all else fails, there are other working pages in the app:
- http://localhost:4200/strategies.html
- http://localhost:4200/audiences.html  
- http://localhost:4200/personas.html

These use the same structure and can be used as reference for fixing index.html.