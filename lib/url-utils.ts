// lib/url-utils.ts

export function normalizeUrl(url: string): string {
    // Remove leading/trailing whitespace
    let normalizedUrl = url.trim();
    
    // Check if it's a valid URL first
    try {
      new URL(normalizedUrl);
      return normalizedUrl;
    } catch (e) {
      // If it doesn't have a protocol, add https://
      if (!normalizedUrl.match(/^[a-zA-Z]+:\/\//)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }
    }
    
    // Validate the URL again
    try {
      new URL(normalizedUrl);
      return normalizedUrl;
    } catch (e) {
      // If still invalid, return empty string or throw error
      return '';
    }
  }
  
  export function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }