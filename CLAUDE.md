# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome browser extension (飞书收藏插件) that allows users to save web page bookmarks to Feishu's multidimensional tables. Built with Manifest V3, it integrates with the Feishu Open Platform API for data synchronization.

## Common Development Commands

```bash
# Install dependencies
npm install

# Build the extension (validates files, creates icons, generates package info)
npm run build

# Validate plugin files only
npm run validate

# Create/update icons only
npm run icons

# Test the plugin (opens test.html in browser)
npm run test
```

## High-Level Architecture

### Extension Components
- **Background Service Worker** (`background.js`): Central message hub, handles Feishu API calls, manages sync tasks
- **Content Script** (`content.js`): Injected into web pages to extract metadata
- **Popup Interface** (`popup/`): Toolbar button interface for quick bookmarking
- **Options Page** (`options/`): Settings and data management interface

### Core Libraries
- **FeishuAPI** (`lib/feishu-api.js`): Handles authentication and API calls to Feishu Open Platform
- **StorageManager** (`lib/storage.js`): Manages local storage with Chrome Extension storage API

### Data Flow
1. User clicks extension icon → Popup collects page info + user input (tags, notes)
2. Background script validates and saves to local storage via StorageManager
3. Background script syncs to Feishu every 30 minutes via FeishuAPI
4. Failed syncs are queued for retry

### Message Passing Pattern
All communication between components uses Chrome Extension messaging:
```javascript
// Popup to Background
chrome.runtime.sendMessage({action: 'saveToFeishu', data: {...}})

// Background to Content
chrome.tabs.sendMessage(tabId, {action: 'getPageInfo'})
```

### Error Handling
- API errors: Retry with exponential backoff
- Network failures: Queue for later sync
- Authentication errors: Prompt user to reconfigure settings
- Storage errors: Fallback to in-memory cache

## Key Implementation Details

### Feishu API Integration
- Base URL: `https://open.feishu.cn/open-apis`
- Authentication: Tenant access token with 2-hour expiry
- Required endpoints: `/auth/v3/tenant_access_token/internal`, `/bitable/v1/apps/{app_token}/tables/{table_id}/records`

### Storage Schema
```javascript
// Collection record
{
  id: string,
  title: string,
  url: string,
  description: string,
  tags: string[],
  notes: string,
  icon: string,
  keywords: string[],
  createdAt: string,
  synced: boolean,
  feishuRecordId: string|null
}
```

### Chrome Extension Permissions
- `activeTab`: Access current tab for bookmarking
- `storage`: Local data persistence
- `scripting`: Content script injection
- Host permissions for `https://open.feishu.cn/*` and `https://*.feishu.cn/*`

## Development Guidelines

### Code Style
- ES6+ syntax with async/await for async operations
- Error handling with try/catch blocks
- Meaningful variable names (Chinese comments are acceptable)
- Modular architecture with single-responsibility functions

### Testing Approach
- Manual testing via `test.html` page
- Use Chrome Extension DevTools for debugging
- Test both online and offline scenarios
- Verify sync behavior with different network conditions

### Build Process
The `build.js` script handles:
1. File validation (checks all required files exist)
2. Manifest.json validation
3. Icon generation (placeholder PNGs)
4. Package info generation

No external bundlers or transpilers are used - this is a vanilla JavaScript project.