/**
 * Widget Factory - TypeScript Definitions
 * 
 * This file provides TypeScript type definitions for the widget system,
 * enabling better autocomplete and type checking in VS Code.
 */

/**
 * Types of result displays supported by the ResultCard component
 */
export type ResultKind = 'text' | 'singleUrl' | 'urlArray';

/**
 * Download URL structure for multi-file downloads
 */
export interface DownloadUrlItem {
  url: string;
  label?: string;
}

/**
 * Processing success event detail structure
 */
export interface ProcessSuccessDetail {
  kind: ResultKind;
  headline?: string;
  text?: string;
  downloadUrl?: string;
  linkText?: string;
  downloadUrls?: Array<string | DownloadUrlItem>;
  [key: string]: any;
}

/**
 * Processing error event detail structure
 */
export interface ProcessErrorDetail {
  error: string;
  [key: string]: any;
}

/**
 * Upload progress event detail structure
 */
export interface UploadProgressDetail {
  percent: number;
}

/**
 * Upload done event detail structure
 */
export interface UploadDoneDetail {
  keys: string[];
}

/**
 * Main Widget Controller class
 */
export default class WidgetController {
  /**
   * Creates a new widget controller for the specified shell element
   * @param shellSelector CSS selector for the widget shell element
   */
  constructor(shellSelector?: string);
  
  /**
   * The main shell element for this widget
   */
  shell: HTMLElement;
  
  /**
   * The file input element
   */
  input: HTMLInputElement;
  
  /**
   * The progress bar element
   */
  progressBar: HTMLElement;
  
  /**
   * The result card element
   */
  resultCard: HTMLElement;
  
  /**
   * The widget's unique identifier
   */
  widgetId: string;
  
  /**
   * Endpoint URL for getting presigned upload URLs
   */
  presignEndpoint: string;
  
  /**
   * Endpoint URL for processing uploaded files
   */
  processEndpoint: string;
  
  /**
   * Maximum allowed file size in bytes
   */
  maxFileSize: number;
  
  /**
   * Anonymous ID for tracking user uploads
   */
  anonId: string;
  
  /**
   * Binds all event handlers to the widget elements
   */
  private bindEvents(): void;
  
  /**
   * Handles file selection from the input element
   * @param event The change event from the input
   */
  private handleFileSelection(event: Event): Promise<void>;
  
  /**
   * Dispatches a custom event to the widget shell
   * @param eventName Name of the event to dispatch
   * @param detail Optional detail object for the event
   */
  dispatchWidgetEvent(eventName: string, detail?: any): void;
  
  /**
   * Gets a presigned URL for uploading a file
   * @param fileKey The file key to use for the upload
   * @param file The file to upload
   * @returns Promise resolving to the presigned URL response
   */
  private getPresignedURL(fileKey: string, file: File): Promise<{uploadUrl: string, fileKey: string}>;
  
  /**
   * Uploads a file to S3 using a presigned URL
   * @param uploadUrl The presigned URL for the upload
   * @param file The file to upload
   * @returns Promise resolving when the upload is complete
   */
  private uploadFile(uploadUrl: string, file: File): Promise<void>;
  
  /**
   * Processes uploaded files via the processing endpoint
   * @param fileKeys Array of file keys that were uploaded
   */
  private processFiles(fileKeys: string[]): Promise<void>;
  
  /**
   * Handles successful processing results
   * @param detail The processing result details
   */
  private handleProcessSuccess(detail: ProcessSuccessDetail): void;
  
  /**
   * Handles processing errors
   * @param detail The error details
   */
  private handleProcessError(detail: ProcessErrorDetail): void;
}

/**
 * Custom event map for TypeScript with widget events
 */
declare global {
  interface HTMLElementEventMap {
    'input:ready': CustomEvent<{}>;
    'upload:progress': CustomEvent<UploadProgressDetail>;
    'upload:done': CustomEvent<UploadDoneDetail>;
    'process:success': CustomEvent<ProcessSuccessDetail>;
    'process:error': CustomEvent<ProcessErrorDetail>;
  }
}