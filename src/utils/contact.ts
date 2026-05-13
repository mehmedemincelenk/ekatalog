/**
 * CONTACT & EXTERNAL LINKS UTILITIES (DIAMOND ENGINE)
 * -----------------------------------------------------------
 * Centralized logic for external communications, social sharing,
 * and contact asset generation (vCard).
 */

import { CompanySettings } from '../types';

/**
 * generateWhatsAppLink: Creates a professional encoded WhatsApp API link.
 */
export const generateWhatsAppLink = (
  number: string,
  message?: string,
): string => {
  const cleanNumber = (number || '').replace(/\D/g, '');
  const encodedText = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedText ? `?text=${encodedText}` : ''}`;
};

/**
 * openWhatsApp: Safely opens a WhatsApp conversation.
 */
export const openWhatsApp = (number: string, message?: string) => {
  const link = generateWhatsAppLink(number, message);
  window.open(link, '_blank');
};

/**
 * callPhone: Initiates a native phone call.
 */
export const callPhone = (number: string) => {
  const cleanNumber = (number || '').replace(/\D/g, '');
  window.location.href = `tel:${cleanNumber}`;
};

/**
 * openExternalMap: Opens Google Maps for a specific address.
 */
export const openExternalMap = (address: string) => {
  if (!address) return;
  const link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(link, '_blank');
};

/**
 * generateVCard: Generates a Virtual Contact File (vcf) for store settings.
 */
export const generateVCard = (settings: CompanySettings) => {
  const vCardLines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${settings.name}`,
    `TEL;TYPE=CELL:${settings.whatsapp}`,
    `ADR;TYPE=WORK:;;${settings.address || ''};;;;`,
    `ORG:${settings.name}`,
    `TITLE:${settings.subtitle || ''}`,
    'END:VCARD'
  ];

  const vCardData = vCardLines.join('\n');
  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${settings.name.replace(/\s+/g, '_')}.vcf`);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
};

/**
 * openInstagram: Safely opens Instagram profile.
 */
export const openInstagram = (url: string) => {
  if (!url) return;
  window.open(url, '_blank');
};
