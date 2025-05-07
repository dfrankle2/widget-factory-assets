# Widget Component Data Attributes

This document outlines all data attributes used by each of the widget components for configuration.

## WidgetShell Component

The main wrapper component that coordinates all widget functionality.

| Attribute | Purpose | Example Value |
|-----------|---------|---------------|
| `data-component` | Identifies the component type | `"WidgetShell"` |
| `data-widget-id` | Unique identifier for this widget instance | `"pdf-to-text"` |
| `data-presign-endpoint` | Webhook URL for getting presigned upload URLs | `"https://hook.us1.make.com/..."` |
| `data-process-endpoint` | Webhook URL for processing uploaded files | `"https://hook.us1.make.com/..."` |
| `data-theme-hue` | Optional color hue for theming (CSS variable) | `"240"` |

## FileInput Component

Handles file selection and drag-and-drop functionality.

| Attribute | Purpose | Example Value |
|-----------|---------|---------------|
| `data-component` | Identifies the component type | `"FileInput"` |
| `data-max-size` | Maximum file size in MB | `"10"` |
| `data-accept` | File types to accept (maps to input accept attribute) | `".pdf,.docx"` |
| `data-multiple` | Whether multiple files can be selected | `"true"` or `"false"` |

## ProgressBar Component

Displays upload and processing progress.

| Attribute | Purpose | Example Value |
|-----------|---------|---------------|
| `data-component` | Identifies the component type | `"ProgressBar"` |
| `data-accent-color` | Custom color for the progress bar | `"#4285f4"` |

## ResultCard Component

Displays the results of file processing.

| Attribute | Purpose | Example Value |
|-----------|---------|---------------|
| `data-component` | Identifies the component type | `"ResultCard"` |
| `data-default-kind` | Default result type | `"text"`, `"singleUrl"`, or `"urlArray"` |

### Result Card Child Elements

These elements inside the ResultCard will be dynamically updated:

| Element Attribute | Purpose | Example |
|-------------------|---------|---------|
| `data-result="headline"` | Element for result headline/title | `<h3 data-result="headline">Success!</h3>` |
| `data-result="text"` | Element for displaying text results | `<div data-result="text"></div>` |
| `data-result="single-link"` | Element for single download link | `<a data-result="single-link">Download</a>` |
| `data-result="link-list"` | Element for list of download links | `<ul data-result="link-list"></ul>` |
| `data-result="extra-html"` | Slot for custom HTML content | `<div data-result="extra-html"></div>` |

## Custom Events

The components communicate through these custom events:

| Event Name | Triggered By | Details Payload | Purpose |
|------------|--------------|----------------|---------|
| `input:ready` | File selection | None | Indicates files have been selected |
| `upload:progress` | During upload | `{ percent: number }` | Reports upload progress percentage |
| `upload:done` | Upload complete | `{ keys: string[] }` | Indicates all files uploaded successfully |
| `process:success` | Processing complete | Varies by widget | Contains processing results |
| `process:error` | Error handling | `{ error: string }` | Contains error information |

## Example Structure

```html
<section data-component="WidgetShell" data-widget-id="pdf-to-text" 
         data-presign-endpoint="https://hook.us1.make.com/..." 
         data-process-endpoint="https://hook.us1.make.com/...">
  
  <!-- File Input -->
  <div data-component="FileInput" data-max-size="10" data-accept=".pdf">
    <div class="dropzone">
      <input type="file" accept=".pdf">
      <p>Drag & drop your PDF files here, or click to browse</p>
    </div>
  </div>
  
  <!-- Progress Bar -->
  <div data-component="ProgressBar">
    <div class="progress-wrapper">
      <div class="progress-bar"></div>
    </div>
  </div>
  
  <!-- Result Card -->
  <div data-component="ResultCard" data-default-kind="text">
    <h3 data-result="headline">Processing Complete</h3>
    <div data-result="text"></div>
    <a data-result="single-link" style="display: none;">Download</a>
    <ul data-result="link-list" style="display: none;"></ul>
    <div data-result="extra-html"></div>
  </div>
</section>
```