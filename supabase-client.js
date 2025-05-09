/**
 * Supabase Client for Widget Factory
 * 
 * This module provides a wrapper around the Supabase client for widget factory
 * with methods for file uploads, processing, and credits management.
 */

class WidgetFactorySupabase {
  /**
   * Initialize a new Supabase client for the Widget Factory
   * @param {Object} options - Configuration options
   * @param {string} options.supabaseUrl - Supabase project URL
   * @param {string} options.supabaseKey - Supabase anonymous key
   * @param {string} options.widgetId - ID of the widget being used
   */
  constructor(options = {}) {
    // Check requirements
    if (typeof supabase === 'undefined') {
      console.error(
        'Supabase client not found. Include the script tag: ' +
        '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
      );
      return;
    }
    
    // Store options
    this.options = {
      supabaseUrl: options.supabaseUrl || '',
      supabaseKey: options.supabaseKey || '',
      widgetId: options.widgetId || ''
    };
    
    // Initialize Supabase client
    this.client = supabase.createClient(
      this.options.supabaseUrl,
      this.options.supabaseKey
    );
    
    // User data
    this.userId = null;
    this.authToken = null;
    this.credits = null;
    
    // Initialize auth
    this._initAuth();
  }
  
  /**
   * Initialize authentication
   * @private
   */
  async _initAuth() {
    // Check for existing session
    const { data: { session } } = await this.client.auth.getSession();
    
    if (session) {
      this.userId = session.user.id;
      this.authToken = session.access_token;
    } else {
      // Create anonymous session
      try {
        const { data, error } = await this.client.auth.signUp({
          email: `${crypto.randomUUID()}@anonymous.com`,
          password: crypto.randomUUID(),
        });
        
        if (error) throw error;
        
        this.userId = data.user.id;
        this.authToken = data.session?.access_token;
      } catch (err) {
        console.error('Failed to create anonymous user:', err);
      }
    }
    
    // Check credits if authentication succeeded
    if (this.userId) {
      await this.checkCredits();
    }
  }
  
  /**
   * Check available credits for the current user
   * @returns {Promise<number>} Number of available credits
   */
  async checkCredits() {
    if (!this.userId) {
      await this._initAuth();
    }
    
    try {
      const { data, error } = await this.client
        .from('credits')
        .select('credits')
        .eq('user_id', this.userId)
        .single();
        
      if (error) throw error;
      
      this.credits = data?.credits || 0;
      return this.credits;
    } catch (err) {
      console.error('Failed to check credits:', err);
      return 0;
    }
  }
  
  /**
   * Get a presigned URL for uploading a file
   * This will also debit credits from the user account
   * 
   * @param {File} file - The file to be uploaded
   * @returns {Promise<Object>} Object with upload URL and tracking info
   */
  async getPresignedURL(file) {
    if (!this.userId) {
      await this._initAuth();
    }
    
    if (!this.options.widgetId) {
      throw new Error('Widget ID is required');
    }
    
    try {
      // Call the presign function
      const { data, error } = await this.client.functions.invoke('presign', {
        body: {
          widget_id: this.options.widgetId,
          mime: file.type,
          size: file.size
        }
      });
      
      if (error) throw error;
      
      // Update credits after successful presign
      if (data.usageId) {
        await this.checkCredits();
      }
      
      return {
        uploadUrl: data.uploadUrl,
        fileKey: data.fileKey,
        usageId: data.usageId
      };
    } catch (err) {
      console.error('Failed to get presigned URL:', err);
      throw err;
    }
  }
  
  /**
   * Upload a file to Supabase Storage
   * 
   * @param {File} file - The file to upload
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise<Object>} - Processing result
   */
  async uploadFile(file, progressCallback = null) {
    try {
      // 1. Get presigned URL
      const { uploadUrl, fileKey, usageId } = await this.getPresignedURL(file);
      
      // 2. Upload the file
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      if (progressCallback) {
        xhr.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            progressCallback({ percent, stage: 'upload' });
          }
        });
      }
      
      // Upload the file with the presigned URL
      await new Promise((resolve, reject) => {
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload aborted'));
        
        xhr.send(file);
      });
      
      if (progressCallback) {
        progressCallback({ percent: 100, stage: 'upload' });
        progressCallback({ percent: 0, stage: 'processing' });
      }
      
      // 3. Process the file
      const { data: processResult, error: processError } = await this.client.functions.invoke('process-file', {
        body: { usage_id: usageId }
      });
      
      if (processError) throw processError;
      
      if (progressCallback) {
        progressCallback({ percent: 100, stage: 'processing' });
      }
      
      return processResult;
    } catch (err) {
      console.error('File upload or processing failed:', err);
      throw err;
    }
  }
  
  /**
   * Subscribe to realtime updates for a specific usage ID
   * 
   * @param {string} usageId - The usage ID to subscribe to
   * @param {Function} callback - Callback function for updates
   * @returns {Object} - Subscription object with unsubscribe method
   */
  subscribeToProcessingUpdates(usageId, callback) {
    if (!usageId) {
      throw new Error('Usage ID is required for subscriptions');
    }
    
    const channel = this.client
      .channel('processing:' + usageId)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'widget_usage',
        filter: `id=eq.${usageId}`
      }, payload => {
        callback(payload.new);
      })
      .subscribe();
      
    return {
      unsubscribe: () => {
        channel.unsubscribe();
      }
    };
  }
  
  /**
   * Get upload history for the current user
   * 
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Array>} - Array of usage records
   */
  async getUploadHistory({ limit = 10, offset = 0 } = {}) {
    if (!this.userId) {
      await this._initAuth();
    }
    
    try {
      const { data, error } = await this.client
        .from('widget_usage')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
        
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Failed to get upload history:', err);
      return [];
    }
  }
}

// For script tag inclusion - export to window
if (typeof window !== 'undefined') {
  window.WidgetFactorySupabase = WidgetFactorySupabase;
}

// For module systems
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = WidgetFactorySupabase;
}

export default WidgetFactorySupabase;