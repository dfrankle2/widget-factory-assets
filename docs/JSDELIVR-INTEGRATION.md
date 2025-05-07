# Integrating Widget Factory with Webflow via jsDelivr CDN

This guide shows how to add Widget Factory to your Webflow project using jsDelivr's CDN.

## Quick Setup

Add these two tags to your Webflow project:

```html
<!-- In Webflow > Project Settings > Custom Code > Head -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.1.0/widgets/core/widget.css">

<!-- In Webflow > Project Settings > Custom Code > Footer -->
<script type="module" defer src="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.1.0/widgets/core/widget.min.js"></script>
```

## Detailed Steps

### 1. CDN URLs

The Widget Factory files are served from jsDelivr using these URLs:

- **CSS**: `https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/core/widget.css`
- **JS**: `https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/core/widget.min.js`

### 2. Adding to Webflow

#### Global Integration (Recommended)

This adds the widget system to your entire Webflow site:

1. Go to **Project Settings** > **Custom Code**
2. In the **Head Code** section, add:
   ```html
   <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/core/widget.css">
   ```
3. In the **Footer Code** section, add:
   ```html
   <script type="module">
     // Import the widget controller from jsDelivr CDN
     import WidgetController from 'https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/core/widget.min.js';
     
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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/combine/gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/core/widget.css,gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/theme/dark.css">

<script type="module" defer src="https://cdn.jsdelivr.net/combine/gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/core/widget.min.js,gh/dfrankle2/widget-factory-assets@v1.0.2/widgets/utils/uploader.min.js"></script>
```

### 4. Version Control

For production use, we're using the version tag `@v1.1.1` for stability:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.1.1/widgets/core/widget.css">
<script type="module" defer src="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.1.1/widgets/core/widget.min.js"></script>
```

For cache busting without changing the version, add a query parameter:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.1.1/widgets/core/widget.css?v=2025-05-07">
```

## Critical Structure Requirements

To avoid "Missing required components" errors, your widget must follow this exact structure:

> **New in v1.1.0**: The widget controller now supports Webflow's naming conventions with `u-` prefixed classes. You can use either `.progress-bar` or `.u-progress-bar`, `.dropzone` or `.u-dropzone`, and so on.

```html
<section data-component="WidgetShell"
       data-widget-id="unique-id"
       data-presign-endpoint="your-webhook-url"
       data-process-endpoint="your-webhook-url"
       data-output-type="text">

  <!-- FileInput MUST contain <input type="file"> -->
  <div data-component="FileInput">
    <div class="dropzone">
      Drop your file here
      <input type="file" accept=".pdf" />  <!-- This element is REQUIRED -->
    </div>
  </div>

  <!-- ProgressBar MUST contain element with class="progress-bar" -->
  <div data-component="ProgressBar">
    <div class="progress-bar"></div>
  </div>

  <!-- ResultCard -->
  <div data-component="ResultCard">
    <h3 data-result="headline"></h3>
    <div data-result="text"></div>
    <ul data-result="link-list"></ul>
    <a data-result="single-link"></a>
  </div>
</section>
```

The most common initialization failures are:

1. **Missing input element**: `this.input = this.shell.querySelector('[data-component="FileInput"] input[type=file]')` fails when the input element is missing.

2. **Case-sensitive attributes**: Use `data-output-type="text"` **not** `dataset-outputtype="text"` (HTML attributes are case-sensitive).

3. **Dropzone class**: The element must have `class="dropzone"` - the controller specifically looks for this class name.

4. **Progress bar class**: The controller looks for an element with `class="progress-bar"` inside the ProgressBar component.

## Testing Your Integration

After adding the code and publishing your Webflow site:

1. Open your site in a browser
2. Open DevTools > Console (F12 or Right-click > Inspect > Console)
3. Verify you see "[Widget] ready - your-widget-id" message
4. Verify that there are no "Missing required components" errors
5. Test a file upload to ensure the widget works correctly

## Troubleshooting

If you see "Missing required components" error:

1. Check for `<input type="file">` inside your FileInput component
2. Make sure you have an element with `class="dropzone"`
3. Verify you're using `data-output-type` not `dataset-outputtype`
4. Check for an element with `class="progress-bar"` inside ProgressBar
5. Verify all HTML attributes use kebab-case (dashes, not camelCase)

Other potential issues:
- **404 Errors**: Check that the file paths in your CDN URLs are correct
- **CORS Issues**: jsDelivr should handle this, but check browser network requests
- **Console Errors**: Look for JavaScript errors in the browser console

## Keeping Up to Date

For development and testing:
- You can use the `@main` branch reference in your URLs
- Add a query string parameter for cache busting: `?v=20250507`

For production:
- Use the stable v1.1.1 version tag: `@v1.1.1`
- Future versions will be tagged as needed