# Webflow Widget Factory Implementation Guide

This guide will walk you through the process of creating reusable widget components in Webflow that integrate with the Widget Factory system.

## Overview

The Widget Factory architecture is built on four main Webflow Components that work together:

1. **WidgetShell** - The main container and coordinator for the widget
2. **FileInput** - Handles file selection with drag and drop support
3. **ProgressBar** - Shows upload and processing progress
4. **ResultCard** - Displays the processing results

By creating these as Webflow Components, you can easily reuse and customize them across different widget types without duplicating code.

## Prerequisites

- Webflow account with access to Components and custom code features
- A Make.com (formerly Integromat) account for processing
- Basic understanding of HTML and CSS

## Step-by-Step Component Creation

### 1. Create the ResultCard Component

The ResultCard displays the results after processing is complete.

1. In Webflow Designer, create a styled card-like div
2. Add the following elements inside:
   - Heading (h3) with attribute `data-result="headline"`
   - Text div with attribute `data-result="text"`
   - Link (a) with attribute `data-result="single-link"` (style display: none)
   - Unordered list (ul) with attribute `data-result="link-list"` (style display: none)
   - Optional div with attribute `data-result="extra-html"`
   - Add a button with class `widget-copy` for the copy functionality

3. Select the entire card and click "Create Component" in the top right
4. Name it "ResultCard"
5. Add Component Properties:
   - A text field for "headline" (Default: "Success!")
   - An option field for "kind" with values: text, singleUrl, urlArray (Default: text)
   - A rich text field for "extraHtml" (if needed for custom markup)

6. Make sure to set the `data-component="ResultCard"` attribute on the root element

### 2. Create the ProgressBar Component

The ProgressBar shows visual feedback during uploads and processing.

1. Create a div with class "progress-wrapper" with fixed height (e.g., 8px) and background color
2. Inside, add a div with class "progress-bar" with:
   - Initial width: 0%
   - Accent background color (e.g., #4285f4)
   - Full height

3. Select the wrapper div and click "Create Component"
4. Name it "ProgressBar"
5. Add Component Properties:
   - A color field for "accentColor"

6. Set the `data-component="ProgressBar"` attribute on the root element

### 3. Create the FileInput Component

The FileInput handles file selection with drag-and-drop functionality.

1. Create a div with class "dropzone" with:
   - Min-height: 160px
   - Border: 2px dashed (e.g., #b3c7c2)
   - Display: flex, align-items: center, justify-content: center
   - Appropriate padding and hover states

2. Inside, add:
   - A file input element (`<input type="file">`) - **CRITICAL: This must be present**
   - Instructions text ("Drag & drop files here or click to browse")

3. Select the wrapper div and click "Create Component"
4. Name it "FileInput"
5. Add Component Properties:
   - A text field for "accept" (e.g., ".pdf,.jpg")
   - A toggle for "multiple"
   - A number field for "maxSize" (in MB)
   - A text field for "instructionText"

6. Set the `data-component="FileInput"` attribute on the root element
7. Bind the component properties to the input's attributes:
   - Set input `accept="{{accept}}"` 
   - Set input `multiple` attribute based on the multiple toggle

### 4. Create the WidgetShell Component

The WidgetShell coordinates all the other components.

1. Create a section that will contain the entire widget
2. Inside, add:
   - Heading area with title and subtitle
   - A slot for the FileInput component
   - A slot for the ProgressBar component
   - A slot for the ResultCard component

3. Select the entire section and click "Create Component"
4. Name it "WidgetShell"
5. Add Component Properties:
   - A text field for "widgetId" (required)
   - A text field for "title"
   - A text field for "subtitle"
   - A text field for "presignEndpoint" (webhook URL)
   - A text field for "processEndpoint" (webhook URL)
   - A text field for "outputType" (text or file)
   - A color field for "themeColor"

6. Set the `data-component="WidgetShell"` attribute on the root element
7. Bind the properties to data attributes:
   - `data-widget-id="{{widgetId}}"`
   - `data-presign-endpoint="{{presignEndpoint}}"`
   - `data-process-endpoint="{{processEndpoint}}"`
   - `data-output-type="{{outputType}}"`

## Adding the JavaScript Code

1. In Webflow's project settings, go to "Custom Code"
2. In the "Footer Code" section, add:

```html
<script type="module">
  // Import the widget controller from jsDelivr CDN
  import WidgetController from 'https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.2.0/widgets/core/widget.min.js';
  
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

Also add the CSS in the head section:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dfrankle2/widget-factory-assets@v1.2.0/widgets/core/widget.css">
```

## Creating a New Widget Instance

Once your components are created, adding a new widget is simple:

1. Add a WidgetShell component to your page
2. Configure its properties:
   - Set a unique widgetId (e.g., "pdf-to-text")
   - Set the presignEndpoint and processEndpoint webhook URLs
   - Set the outputType to "text" or "file"
   - Customize title and subtitle

3. Inside the FileInput slot, add a FileInput component instance
4. Configure its properties:
   - Set accept to the appropriate file types (e.g., ".pdf")
   - Enable/disable multiple file selection
   - Set maximum file size

5. Inside the ProgressBar slot, add a ProgressBar component
6. Inside the ResultCard slot, add a ResultCard component
7. Configure the ResultCard properties based on expected output type

## Critical Structure Requirements

To avoid "Missing required components" errors, ensure your widget follows this exact structure:

> **Note**: As of v1.1.0, the widget controller supports Webflow's `u-` prefixed classes. You can use either `.progress-bar` or `.u-progress-bar`, `.dropzone` or `.u-dropzone`, etc.
>
> **New in v1.2.0**: The widget now dynamically generates context-appropriate CTA buttons based on output type (copy button for text, download link for files). No need to add these buttons to your Webflow markup!

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

## Integration with Make.com

Your Make.com scenarios need to handle two main webhooks:

1. **Presign Webhook**:
   - Receives: `{fileKey, mime, size, anon_id, widget_id}`
   - Returns: `{uploadUrl, fileKey}`

2. **Process Webhook**:
   - Receives: `{fileKey, fileKeys[], anon_id, widget_id}`
   - Returns results based on widget type:
     - For text: `{kind: "text", headline: "...", text: "..."}`
     - For download: `{kind: "singleUrl", headline: "...", downloadUrl: "...", linkText: "..."}`
     - For multiple downloads: `{kind: "urlArray", headline: "...", downloadUrls: [{url: "...", label: "..."}]}`

## CSS Styling Tips

- Use CSS variables in your component styles for consistent theming
- Example:
  ```css
  :root {
    --brand-hue: 210;
    --brand-primary: hsl(var(--brand-hue), 80%, 50%);
    --brand-accent: hsl(var(--brand-hue), 70%, 60%);
    --progress-height: 8px;
  }
  
  .progress-bar {
    background-color: var(--brand-accent);
    height: var(--progress-height);
  }
  ```

- Add animations for progress bar "waiting" state:
  ```css
  .progress-bar.waiting {
    animation: pulse 1.5s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  ```

## Examples

### PDF to Text Widget

```html
<section data-component="WidgetShell" 
     data-widget-id="pdf-to-text"
     data-presign-endpoint="https://hook.us1.make.com/your-presign-hook"
     data-process-endpoint="https://hook.us1.make.com/your-process-hook"
     data-output-type="text">
  
  <h2>PDF to Text Converter</h2>
  <p>Upload a PDF and get extracted text</p>
  
  <div data-component="FileInput" data-accept=".pdf" data-max-size="10">
    <div class="dropzone">
      <input type="file" accept=".pdf">
      <div class="dropzone-content">
        <p>Drop file here or click to browse</p>
      </div>
    </div>
  </div>
  
  <div data-component="ProgressBar">
    <div class="progress-wrapper">
      <div class="progress-bar"></div>
    </div>
  </div>
  
  <div data-component="ResultCard" data-default-kind="text">
    <h3 data-result="headline">Extracted Text</h3>
    <div data-result="text"></div>
    <button class="widget-copy">Copy</button>
    <a data-result="single-link" style="display: none;"></a>
    <ul data-result="link-list" style="display: none;"></ul>
  </div>
</section>
```

### Audio to Text Widget

```html
<section data-component="WidgetShell"
         data-widget-id="audio-transcript"
         data-presign-endpoint="https://hook.us1.make.com/your-presign-hook"
         data-process-endpoint="https://hook.us1.make.com/your-process-hook"
         data-output-type="text">

  <h2>MP3 to Text</h2>
  <p>Audio file to transcript.</p>

  <div data-component="FileInput" data-max-size="20" data-accept=".mp3,.wav,.m4a">
    <div class="dropzone">
      <input type="file" accept=".mp3,.wav,.m4a">
      <div class="dropzone-content">
        <p>Upload audio file</p>
      </div>
    </div>
  </div>
  
  <div data-component="ProgressBar">
    <div class="progress-wrapper">
      <div class="progress-bar"></div>
    </div>
  </div>
  
  <div data-component="ResultCard" data-default-kind="text">
    <h3 data-result="headline">Transcription</h3>
    <div data-result="text"></div>
    <button class="widget-copy">Copy</button>
    <a data-result="single-link" style="display: none;"></a>
    <ul data-result="link-list" style="display: none;"></ul>
  </div>
</section>
```

## Troubleshooting

- **"Missing required components" error**: Check that all components have the correct structure and data attributes. Make sure:
  - FileInput has an `<input type="file">` element
  - ProgressBar has an element with class="progress-bar"
  - All elements use the expected CSS classes (especially "dropzone")
  - Data attributes use kebab-case (e.g., data-output-type not dataset-outputtype)

- **File uploads fail**: Verify webhook URLs and Make.com scenario configurations.

- **Components not showing**: Make sure all components are properly nested in their slots.

- **Styling issues**: Check for CSS conflicts and ensure your components have appropriate styling.

## Advanced Usage

### Custom Event Listeners

You can add custom event listeners to widgets for advanced functionality:

```javascript
document.querySelector('[data-widget-id="pdf-to-text"]').addEventListener('process:success', (e) => {
  // Do something with the results
  console.log('Processing results:', e.detail);
  
  // Example: Count words in text
  if (e.detail.kind === 'text' && e.detail.text) {
    const wordCount = e.detail.text.split(/\s+/).length;
    console.log(`Document contains ${wordCount} words`);
  }
});
```

### Multiple Widgets on One Page

The architecture supports multiple widgets on the same page, each with its own configuration and behavior.

### Custom Result Handling

For advanced cases, you can create custom result handlers by extending the base ResultCard component in your Webflow design.