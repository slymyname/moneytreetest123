interface BillTemplate {
  name: string;
  currency: string;
  patterns: RegExp[];
  validate: (amount: string, text: string) => boolean;
}

function commonValidation(amount: string, text: string): boolean {
  // Basic format validation
  if (!/^\d+[.,]\d{2}$/.test(amount)) return false;

  // Convert to number for range validation
  const value = parseFloat(amount.replace(',', '.'));
  if (value <= 0 || value > 1000000) return false;

  return true;
}

function findAmountContext(text: string, amount: string): string[] {
  const lines = text.split('\n');
  const context: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(amount)) {
      if (i > 0) context.push(lines[i - 1]);
      context.push(lines[i]);
      if (i < lines.length - 1) context.push(lines[i + 1]);
    }
  }
  
  return context;
}

// German template for invoices and receipts
const germanTemplate: BillTemplate = {
  name: 'German',
  currency: 'EUR',
  patterns: [
    // Match exact total amount patterns with currency
    /(?:TOTAL|GESAMT|SUMME|BETRAG|AMOUNT|ZAHLEN)\s*(?:EUR|€)?\s*(\d+[.,]\d{2})\b/i,
    /(?:TOTAL|GESAMT|SUMME|BETRAG|AMOUNT|ZAHLEN)[^0-9€]*(\d+[.,]\d{2})\s*(?:EUR|€)?\b/i,
    
    // Match specific invoice fields with exact amounts
    /(?:TOTAL|GESAMT)(?:\s+WITH\s+VAT)?\s*:?\s*(\d+[.,]\d{2})\b/i,
    /RECHNUNGSBETRAG\s*:?\s*(\d+[.,]\d{2})\b/i,
    /ENDSUMME\s*:?\s*(\d+[.,]\d{2})\b/i,
    /GESAMTBETRAG\s*:?\s*(\d+[.,]\d{2})\b/i,
    
    // Match amount with currency (exact matches)
    /(?:EUR|€)\s*(\d+[.,]\d{2})\b/,
    /(\d+[.,]\d{2})\s*(?:EUR|€)\b/,
    
    // Match amount in total sections
    /Total\s*(\d+[.,]\d{2})\b/i,
    
    // Match amount at the end of lines (with validation)
    /.*?(\d+[.,]\d{2})\s*$/m,
    
    // Match amounts in specific formats
    /(\d+[.,]\d{2})[^0-9]*(?:EUR|€)/i,
    /(?:EUR|€)[^0-9]*(\d+[.,]\d{2})/i,
    
    // Match amounts in a table format
    /\|\s*(\d+[.,]\d{2})\s*\|/,
    /\s+(\d+[.,]\d{2})\s*$/m,
    
    // Match amounts after VAT
    /(?:UST|MWST|VAT)\s*(?:\d+%\s*)?(\d+[.,]\d{2})\b/i,
    
    // Match amounts in specific German formats
    /(\d+[.,]\d{2})\s*(?:EUR|€)?\s*(?:INKL\.?\s*(?:UST|MWST|VAT))?/i,
  ],
  validate: (amount: string, text: string): boolean => {
    if (!commonValidation(amount, text)) return false;
    
    const value = parseFloat(amount.replace(',', '.'));
    
    // Additional validation for German invoices
    if (value === 0) return false;
    
    // Check for common German price patterns
    const cents = Math.round((value % 1) * 100);
    if (cents === 0 && value > 100) {
      // Large round numbers are likely quantities unless they appear in a total context
      const context = findAmountContext(text, amount);
      if (!context.some(line => 
        /(?:total|gesamt|summe|betrag|amount|zahlen|brutto|rechnung)/i.test(line)
      )) {
        return false;
      }
    }
    
    // Validate format
    if (!/^\d+[.,]\d{2}$/.test(amount)) return false;
    
    return true;
  },
};

// Export templates array
export const billTemplates: BillTemplate[] = [germanTemplate];