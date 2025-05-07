# Integrating Widget Factory with Webflow via jsDelivr CDN

This guide shows how to add Widget Factory to your Webflow project using jsDelivr's CDN.

## Quick Setup

Add these two tags to your Webflow project:

```html
<!-- In Webflow > Project Settings > Custom Code > Head -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.css">

<!-- In Webflow > Project Settings > Custom Code > Footer -->
<script type="module" defer src="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.min.js"></script>
```

## Detailed Steps

### 1. CDN URLs

The Widget Factory files are served from jsDelivr using these URLs:

- **CSS**: `https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.css`
- **JS**: `https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.min.js`

### 2. Adding to Webflow

#### Global Integration (Recommended)

This adds the widget system to your entire Webflow site:

1. Go to **Project Settings** > **Custom Code**
2. In the **Head Code** section, add:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.css">
   ```
3. In the **Footer Code** section, add:
   ```html
   <script type="module">
     // Import the widget controller from jsDelivr CDN
     import WidgetController from 'https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.min.js';
     
     // Initialize all widgets on the page
     document.addEventListener('DOMContentLoaded', () => {
       // Look for all WidgetShell components
       document.querySelectorAll('[data-component="WidgetShell"]').forEach(shell => {
         new WidgetController(`[data-component="WidgetShell"][data-widget-id="${shell.dataset.widgetId}"]`);
         console.log(`Initialized widget: ${shell.dataset.widgetId}`);
       });
       
       // Add copy button functionality
       document.querySelectorAll('.widget-copy').forEach(btn => {
         btn.addEventListener('click', () => {
           const text = btn.closest('[data-component="ResultCard"]').querySelector('[data-result="text"]').textContent;
           navigator.clipboard.writeText(text)
             .then(() => {
               btn.textContent = 'Copied!';
               setTimeout(() => btn.textContent = 'Copy', 1500);
             });
         });
       });
     });
   </script>
   ```

#### Per-Page Integration

If you only need widgets on specific pages:

1. Go to the page's **Settings** > **Custom Code**
2. Add the same two code snippets to the **Before </head> tag** and **Before </body> tag** sections

### 3. Combining Multiple Files (Optional)

If you have multiple CSS or JS files to load, you can use jsDelivr's combine feature:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/combine/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.css,gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/theme/dark.css">

<script type="module" defer src="https://cdn.jsdelivr.net/combine/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.min.js,gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/utils/uploader.min.js"></script>
```

### 4. Version Control

For production use, we're using the version tag `@v1.0.0` for stability:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.css">
<script type="module" defer src="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.min.js"></script>
```

For cache busting without changing the version, add a query parameter:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.0/widgets/core/widget.css?v=2025-05-07">
```

## Critical Structure Requirements

To avoid "Missing required components" errors, ensure your widget markup follows this exact structure:

```html
<section data-component="WidgetShell"
         data-widget-id="unique-id"
         data-presign-endpoint="your-webhook-url"
         data-process-endpoint="your-webhook-url"
         data-output-type="text">
  
  <!-- FileInput MUST contain input[type=file] -->
  <div data-component="FileInput" data-max-size="10" data-accept=".pdf">
    <div class="dropzone">
      <input type="file" accept=".pdf">
      <!-- Dropzone content -->
    </div>
  </div>
  
  <!-- ProgressBar needs progress-bar class -->
  <div data-component="ProgressBar">
    <div class="progress-wrapper">
      <div class="progress-bar"></div>
    </div>
  </div>
  
  <!-- ResultCard with proper data attributes -->
  <div data-component="ResultCard" data-default-kind="text">
    <h3 data-result="headline"></h3>
    <div data-result="text"></div>
    <!-- Other result elements -->
  </div>
</section>
```

Common issues to check:
- FileInput MUST contain `<input type="file">` element
- The dropzone element MUST have class="dropzone"
- ProgressBar MUST contain an element with class="progress-bar"
- Use data-output-type (not dataset-outputtype)
- All data attributes must use kebab-case in HTML

## Testing Your Integration

After adding the code and publishing your Webflow site:

1. Open your site in a browser
2. Open DevTools > Console (F12 or Right-click > Inspect > Console)
3. Verify you see "[Widget] ready - your-widget-id" message
4. Verify that there are no "Missing required components" errors
5. Test a file upload to ensure the widget works correctly

## Troubleshooting

If your widget doesn't work:

- **Missing Required Components Error**: Follow the Critical Structure Requirements above
- **404 Errors**: Check that the file paths in your CDN URLs are correct
- **CORS Issues**: jsDelivr should handle this, but check if your browser is blocking any requests
- **Console Errors**: Look for JavaScript errors in the browser console
- **Missing Components**: Ensure you've added all the required Webflow components as described in the implementation guide

## Keeping Up to Date

For development and testing:
- You can use the `@main` branch reference in your URLs
- Add a query string parameter for cache busting: `?v=20250507`

For production:
- Use the stable v1.0.0 version tag: `@v1.0.0`
- Future versions will be tagged as needed