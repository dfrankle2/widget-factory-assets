# Webflow Widget Templates

These templates are for creating the component-based widget system in Webflow.

## Files Included

1. **WidgetShell.html** - Main container component for the widget
2. **FileInput.html** - File upload component with drag-and-drop
3. **ProgressBar.html** - Progress indicator component 
4. **ResultCard.html** - Results display component
5. **css-for-project-settings.css** - CSS to add to Webflow project settings
6. **js-for-project-settings.html** - JavaScript to add to Webflow project settings

## Implementation Steps

### 1. Create Webflow Components

1. Create each component in Webflow Designer using the HTML templates
2. Add the component properties as specified in each template
3. Style the components using Webflow Designer and the provided CSS

### 2. Add Custom Code to Webflow Project Settings

1. Go to **Project Settings** > **Custom Code** > **Head Code**
2. Add the CSS from `css-for-project-settings.css` inside `<style>` tags

3. Go to **Project Settings** > **Custom Code** > **Footer Code**
4. Add the JavaScript from `js-for-project-settings.html`
5. Update the CDN URL to point to where you host the widget.js file

### 3. Use the Components

1. Add a **WidgetShell** component to your page
2. Set the `widgetId` and other properties
3. Inside the WidgetShell, add:
   - A **FileInput** component
   - A **ProgressBar** component
   - A **ResultCard** component
4. Publish the page

## Important Notes

- Make sure each component has the correct `data-component` attribute
- Each WidgetShell must have a unique `data-widget-id` value
- The widget.js file must be hosted on a CDN or public server
- Default webhook URLs are pre-configured, but can be overridden with component properties