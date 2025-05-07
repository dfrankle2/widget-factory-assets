/**
 * Webflow Widget Factory - Core Module
 * 
 * This module coordinates components through a clean event-based architecture
 * and integrates with Make.com for file processing.
 */

class WidgetController {
  constructor(shellSelector = '[data-component="WidgetShell"]') {
    // Find the main components
    this.shell = document.querySelector(shellSelector);
    
    if (!this.shell) {
      console.error('Widget shell not found. Ensure you have a component with data-component="WidgetShell"');
      return;
    }
    
    // Get component references
    this.input = this.shell.querySelector('[data-component="FileInput"] input[type=file]');
    // Look for both standard and Webflow u- prefixed classes
    this.progressBar = this.shell.querySelector('[data-component="ProgressBar"] .progress-bar') || 
                       this.shell.querySelector('[data-component="ProgressBar"] .u-progress-bar');
    this.resultCard = this.shell.querySelector('[data-component="ResultCard"]');
    
    // Get configuration - use existing Make.com webhooks as defaults
    this.widgetId = this.shell.dataset.widgetId || '';
    this.presignEndpoint = this.shell.dataset.presignEndpoint || 'https://hook.us1.make.com/gdcgg8ryb664x79ueclrbnjpj8f7k1wn';
    this.processEndpoint = this.shell.dataset.processEndpoint || 'https://hook.us1.make.com/mq6panopy0wdk7cuq94xkt9tf2lhriup';
    this.maxFileSize = parseInt(this.input?.dataset.maxSize || '5') * 1024 * 1024; // Default 5MB
    this.outputType = this.shell.dataset.outputType || 'file'; // text, json, or file (as in existing code)
    
    // Generate/retrieve anonymous ID for user tracking, matching existing implementation
    this.anonId = localStorage.anonId || (localStorage.anonId = crypto.randomUUID());
    
    // Initialize if all components are present
    if (this.input && this.progressBar && this.resultCard) {
      this.bindEvents();
      console.log('Widget initialized with ID:', this.widgetId);
    } else {
      console.error('Widget initialization failed: Missing required components');
    }
  }
  
  bindEvents() {
    // File input change event
    this.input.addEventListener('change', this.handleFileSelection.bind(this));
    
    // Drag and drop support for the dropzone
    // Look for both standard and Webflow u- prefixed classes
    const dropzone = this.shell.querySelector('.dropzone') || 
                     this.shell.querySelector('.u-dropzone');
    if (dropzone) {
      dropzone.addEventListener('dragover', e => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      
      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
          this.input.files = e.dataTransfer.files;
          this.handleFileSelection({ target: { files: e.dataTransfer.files } });
        }
      });
    }
  }
  
  async handleFileSelection(e) {
    const file = e.target.files?.[0]; // Use single file like existing implementation
    
    if (!file) {
      alert('Choose a file');
      return;
    }
    
    // Validate file size
    if (file.size > this.maxFileSize) {
      alert(`File ${file.name} exceeds the maximum allowed size of ${this.maxFileSize/1024/1024}MB.`);
      return;
    }
    
    // Reset UI state - dispatch input:ready event
    this.dispatchWidgetEvent('input:ready');
    
    // Build fileKey in the same format as existing code
    const ext = file.name.split('.').pop() || '';
    const fileKey = `uploads/${this.widgetId}/${crypto.randomUUID()}.${ext}`;
    
    // Disable input during processing
    const submitBtn = this.shell.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Working…';
    }
    
    try {
      // Update progress bar - starting progress
      this.dispatchWidgetEvent('upload:progress', { percent: 5 });
      
      // Get presigned URL from Make.com webhook - same format as existing code
      const { uploadUrl } = await this.getPresignedURL(fileKey, file);
      
      // Upload the file with progress tracking
      await this.uploadFile(uploadUrl, file);
      
      // Upload complete - set progress to 45% like existing code
      this.dispatchWidgetEvent('upload:progress', { percent: 45 });
      
      // Process the uploaded file
      await this.processFiles([fileKey]);
      
      // Complete - set progress to 100%
      this.dispatchWidgetEvent('upload:progress', { percent: 100 });
    } catch (error) {
      console.error('Upload failed:', error);
      this.dispatchWidgetEvent('process:error', { 
        error: 'Upload failed: ' + error.message 
      });
    } finally {
      // Re-enable input
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    }
  }
  
  // Helper method to dispatch custom events
  dispatchWidgetEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    this.shell.dispatchEvent(event);
    
    // Handle specific events internally
    switch (eventName) {
      case 'input:ready':
        this.progressBar.style.width = '0%';
        this.progressBar.classList.remove('error');
        this.resultCard.style.display = 'none';
        break;
        
      case 'upload:progress':
        this.progressBar.style.width = `${detail.percent}%`;
        break;
        
      case 'upload:done':
        this.progressBar.style.width = '100%';
        this.progressBar.classList.add('waiting');
        break;
        
      case 'process:success':
        // We don't need to handle this here as it's managed in handleResponse already
        break;
        
      case 'process:error':
        this.handleProcessError(detail);
        break;
    }
  }
  
  // Get presigned URL from Make.com webhook - match existing format
  async getPresignedURL(fileKey, file) {
    const response = await fetch(this.presignEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileKey,
        mime: file.type,
        size: file.size,
        anon_id: this.anonId,
        widget_id: this.widgetId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.status}`);
    }
    
    // Return JSON exactly as existing code expects it
    return response.json();
  }
  
  // Upload file with progress tracking
  async uploadFile(uploadUrl, file) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          this.dispatchWidgetEvent('upload:progress', { percent });
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
      
      xhr.open('PUT', uploadUrl);
      
      if (file.type) {
        xhr.setRequestHeader('Content-Type', file.type);
      }
      
      xhr.send(file);
    });
  }
  
  // Process uploaded files via Make.com webhook
  async processFiles(fileKeys) {
    try {
      const response = await fetch(this.processEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileKey: fileKeys[0], // Match existing implementation which uses single fileKey
          anonId: this.anonId,
          widget_id: this.widgetId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Processing failed: ${response.status}`);
      }
      
      await this.handleResponse(response); // Use similar handling to existing code
    } catch (error) {
      console.error('Processing failed:', error);
      this.dispatchWidgetEvent('process:error', { error: error.message });
      
      // Update UI for errors, similar to existing error handling
      const textContent = this.resultCard.querySelector('[data-result="text"]');
      if (textContent) {
        textContent.textContent = '❌ ' + error.message;
        textContent.style.display = 'block';
        textContent.classList.add('widget-error');
      }
      this.resultCard.style.display = 'block';
    }
  }
  
  // Handle response based on output type - matches existing implementation
  async handleResponse(response) {
    // Remove waiting animation
    this.progressBar.classList.remove('waiting');
    
    // Get references to result card elements
    const headline = this.resultCard.querySelector('[data-result="headline"]');
    const textContent = this.resultCard.querySelector('[data-result="text"]');
    const copyBtn = this.resultCard.querySelector('.widget-copy') || 
                    this.resultCard.querySelector('.u-widget-copy') ||
                    this.resultCard.querySelector('[data-action="copy"]');
    
    // Remove any error classes
    if (textContent) textContent.classList.remove('widget-error');
    
    switch (this.outputType) {
      // Plain text output
      case 'text': {
        if (textContent) {
          textContent.textContent = await response.text();
          textContent.style.display = 'block';
        }
        if (copyBtn) copyBtn.style.display = 'inline-block';
        break;
      }
      
      // JSON output
      case 'json': {
        const data = await response.json();
        if (textContent) {
          const txt = (data && typeof data === 'object' && 'text' in data)
            ? data.text
            : JSON.stringify(data, null, 2);
          textContent.textContent = txt;
          textContent.style.display = 'block';
        }
        if (copyBtn) copyBtn.style.display = 'inline-block';
        break;
      }
      
      // File/download output (default)
      case 'file':
      default: {
        const isJson = (response.headers.get('content-type') || '').startsWith('application/json');
        let url;
        
        if (isJson) {
          const data = await response.json();
          url = data.downloadUrl;
        } else {
          const blob = await response.blob();
          url = URL.createObjectURL(blob);
        }
        
        this.injectDownloadButton(url);
        break;
      }
    }
    
    // Show the result card
    this.resultCard.style.display = 'block';
    
    // Dispatch success event for any listeners
    this.dispatchWidgetEvent('process:success', { 
      outputType: this.outputType,
      response: response 
    });
  }
  
  // Inject download button - similar to existing implementation
  injectDownloadButton(url) {
    if (!url) return;
    
    const singleLink = this.resultCard.querySelector('[data-result="single-link"]');
    if (singleLink) {
      singleLink.href = url;
      singleLink.style.display = 'inline-block';
      
      if (url.startsWith('blob:')) {
        singleLink.addEventListener('click', () => {
          setTimeout(() => URL.revokeObjectURL(url), 3000);
        }, { once: true });
      }
      return;
    }
    
    // If no existing link element, create one (backwards compatibility)
    const label = this.shell.dataset.ctaLabel || 'Download';
    const a = document.createElement('a');
    a.href = url;
    a.textContent = label;
    a.className = 'widget-download u-widget-download'; // Add both classes for compatibility
    a.target = '_blank';
    
    // If we have a template for filenames
    if (this.shell.dataset.fnameTpl) {
      a.download = this.shell.dataset.fnameTpl.replace('{{slug}}', this.shell.dataset.slug || 'file');
    }
    
    // Append to result card
    this.resultCard.insertAdjacentElement('beforeend', a);
    
    if (url.startsWith('blob:')) {
      a.addEventListener('click', () => {
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }, { once: true });
    }
  }
  
  // Handle process:error event details
  handleProcessError(detail) {
    // Show error state
    this.progressBar.classList.add('error');
    this.progressBar.classList.remove('waiting');
    
    // Update result card with error
    const headline = this.resultCard.querySelector('[data-result="headline"]');
    const textContent = this.resultCard.querySelector('[data-result="text"]');
    
    if (headline) headline.textContent = 'Error';
    if (textContent) {
      textContent.textContent = detail.error || 'An error occurred';
      textContent.style.display = 'block';
    }
    
    // Hide other result types
    const singleLink = this.resultCard.querySelector('[data-result="single-link"]');
    const linkList = this.resultCard.querySelector('[data-result="link-list"]');
    
    if (singleLink) singleLink.style.display = 'none';
    if (linkList) linkList.style.display = 'none';
    
    // Show result card
    this.resultCard.style.display = 'block';
  }
}

// Initialize widgets when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Support multiple widgets on the same page by using unique widget IDs
  document.querySelectorAll('[data-component="WidgetShell"]').forEach(shell => {
    const widgetId = shell.dataset.widgetId;
    if (widgetId) {
      new WidgetController(`[data-component="WidgetShell"][data-widget-id="${widgetId}"]`);
    } else {
      new WidgetController();
    }
  });
});

export default WidgetController;