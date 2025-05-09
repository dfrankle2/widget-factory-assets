# Supabase Integration Guide for Widget Factory

This guide explains how to use the Supabase backend with the Widget Factory system.

## Overview

The Widget Factory now supports Supabase as an alternative backend to the original Make.com + AWS S3 implementation. Supabase provides:

- Authentication and user management
- File storage
- Serverless functions for file processing
- Credits tracking system
- Real-time progress updates

## Setup Requirements

1. A Supabase project (free tier works for testing)
2. Proper database schema setup (see below)
3. Edge Functions deployed to Supabase

## Database Schema Setup

The Supabase backend requires the following tables:

- `credits` - Tracks available credits for each user
- `widget_usage` - Logs widget usage
- `file_processing` - Tracks file processing status

You can find the full schema in the `widget-factory-supabase/supabase/migrations` directory.

## Edge Functions

Three Edge Functions are needed:

1. `presign` - Generates presigned URLs for file uploads
2. `process-file` - Processes uploaded files
3. `log` - Logs widget usage

## Webflow Implementation

To use the Supabase backend:

1. Include the main widget script:
   ```html
   <script src="path/to/widget.js"></script>
   ```

2. Include the Supabase library and client:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script src="path/to/supabase-client.js"></script>
   ```

3. Configure your WidgetShell component with these attributes:
   ```html
   <div data-component="WidgetShell" 
        data-widget-id="your-widget-id"
        data-use-supabase="true"
        data-supabase-url="YOUR_SUPABASE_URL"
        data-supabase-key="YOUR_SUPABASE_ANON_KEY">
     <!-- Components go here -->
   </div>
   ```

## Credits System

The Supabase integration includes a credit system for tracking usage:

- Each user starts with a default credit amount
- Credits are deducted when files are processed
- The credits display can be shown by adding a `.credits-info` element inside your WidgetShell

## Fallback to Make.com

The widget will automatically fall back to the Make.com backend if:

1. The Supabase configuration is missing
2. The `data-use-supabase` attribute is not set to "true"
3. The Supabase client initialization fails

## Troubleshooting

- Check browser console for errors
- Verify Supabase URL and key are correct
- Ensure the database schema matches the expected format
- Confirm Edge Functions are deployed and accessible