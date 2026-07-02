/**
 * Strips HTML tags, script elements, and suspicious character sequences
 * to protect against Cross-Site Scripting (XSS) and other code injections.
 */
export function sanitizeInput(val: string): string {
  if (typeof val !== "string") return "";
  
  let cleaned = val;
  
  // 1. Strip HTML tags completely using regex
  cleaned = cleaned.replace(/<[^>]*>/g, "");
  
  // 2. Strip standard suspicious dynamic attributes and scripts
  cleaned = cleaned.replace(/javascript:/gi, "");
  cleaned = cleaned.replace(/onerror/gi, "");
  cleaned = cleaned.replace(/onload/gi, "");
  cleaned = cleaned.replace(/onclick/gi, "");
  cleaned = cleaned.replace(/onfocus/gi, "");
  cleaned = cleaned.replace(/onblur/gi, "");
  cleaned = cleaned.replace(/onmouseover/gi, "");
  cleaned = cleaned.replace(/alert\(/gi, "");
  cleaned = cleaned.replace(/eval\(/gi, "");

  return cleaned.trim();
}
