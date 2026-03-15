import { ScrapedData } from '../scraper/scrapeWebsite';

export interface DetectionResult {
  loginType: string;
  detectedElements: {
    manual: string[];
    google: string[];
    social: string[];
  };
}

export function detectLoginFeature(data: ScrapedData): DetectionResult {
  const detectedElements = {
    manual: [] as string[],
    google: [] as string[],
    social: [] as string[],
  };

  const emailKeywords = ['email', 'mail', 'username', 'user', 'login', 'id'];
  const passwordKeywords = ['password', 'pass', 'pwd'];
  const googleKeywords = ['google'];
  const socialKeywords = ['facebook', 'apple', 'github', 'twitter', 'linkedin', 'microsoft'];

  let hasEmail = false;
  let hasPassword = false;

  // Check inputs
  data.inputs.forEach(input => {
    const lower = input.toLowerCase();
    if (emailKeywords.some(key => lower.includes(key))) {
      detectedElements.manual.push(input);
      hasEmail = true;
    }
    if (passwordKeywords.some(key => lower.includes(key))) {
      detectedElements.manual.push(input);
      hasPassword = true;
    }
  });

  // Check buttons
  data.buttons.forEach(button => {
    const lower = button.toLowerCase();
    if (googleKeywords.some(key => lower.includes(key))) {
      detectedElements.google.push(button);
    } else if (socialKeywords.some(key => lower.includes(key))) {
      detectedElements.social.push(button);
    } else if (emailKeywords.some(key => lower.includes(key)) || passwordKeywords.some(key => lower.includes(key))) {
      detectedElements.manual.push(button);
    }
  });

  // Check links
  data.links.forEach(link => {
    const lower = link.toLowerCase();
    if (googleKeywords.some(key => lower.includes(key))) {
      detectedElements.google.push(link);
    } else if (socialKeywords.some(key => lower.includes(key))) {
      detectedElements.social.push(link);
    }
  });

  const types: string[] = [];
  // Rule: email + password -> manual login
  if (hasEmail && hasPassword) {
    types.push('manual');
  } else if (detectedElements.manual.length > 0) {
    // Fallback if only one is found but it's clearly an auth form
    types.push('manual');
  }

  // Rule: "Continue with Google" -> google oauth
  if (detectedElements.google.length > 0) {
    types.push('google oauth');
  }

  if (detectedElements.social.length > 0) {
    types.push('social login');
  }

  return {
    loginType: types.join(' + ') || 'unknown',
    detectedElements: {
      manual: [...new Set(detectedElements.manual)],
      google: [...new Set(detectedElements.google)],
      social: [...new Set(detectedElements.social)],
    }
  };
}
