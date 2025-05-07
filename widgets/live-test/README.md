# Live Make.com Integration Test

This folder contains a simple HTML file that connects to your actual Make.com webhooks for testing the widget system.

## Deployment Options

Since we're facing local server connectivity issues, here are several ways to quickly deploy this test file and access it through a public URL:

### Option 1: Netlify Drop (Easiest)

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag & drop the entire `live-test` folder
3. Wait a few seconds for deployment
4. Access your site at the provided URL

### Option 2: GitHub Pages

1. Commit and push this folder to your GitHub repository
2. Enable GitHub Pages in your repository settings
3. Set the source to the branch and folder containing the live-test
4. Access your site at `https://yourusername.github.io/webflow-widget-factory/widgets/live-test/`

### Option 3: Surge.sh

1. Install Surge with: `npm install -g surge`
2. Navigate to the live-test directory: `cd /Users/dfrankle/Documents/GitHub/webflow-widget-factory/widgets/live-test`
3. Run: `surge`
4. Follow the prompts and get a public URL

### Option 4: CodeSandbox

1. Go to [CodeSandbox](https://codesandbox.io/)
2. Create a new static sandbox
3. Upload the index.html file
4. Access your test at the provided URL

## Testing

Once deployed, you'll be able to:

1. Upload files to be processed by your Make.com webhooks
2. See real progress as files are uploaded and processed
3. View results from your actual Lambda functions
4. Monitor all events in the event log

## Troubleshooting

If you encounter CORS issues when connecting to Make.com webhooks, you may need to:

1. Add the deployment URL to the allowed origins in your Make.com webhook settings
2. Use a CORS proxy service (though this may introduce security considerations)
3. Deploy the test to the same domain as your Make.com webhooks if possible