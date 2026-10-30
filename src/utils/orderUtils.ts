import { Order, OrderItem, StoreSettings } from '../types';

export function toBengaliDigits(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

export function formatPriceBDT(amount: number, useBengali = false): string {
  if (useBengali) {
    return `৳${toBengaliDigits(amount)}`;
  }
  return `৳${amount.toLocaleString('en-US')}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MNB-${year}${month}${day}-${random}`;
}

export function isValidBDPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // Matches 01XXXXXXXXX (11 digits) or 8801XXXXXXXXX (13 digits)
  return /^01[3-9]\d{8}$/.test(cleaned) || /^8801[3-9]\d{8}$/.test(cleaned);
}

export function calculateDeliveryCharge(district: string, settings: StoreSettings): number {
  const normalized = district.trim().toLowerCase();
  if (
    normalized === 'jessore' ||
    normalized === 'jashore' ||
    normalized === 'যশোর' ||
    normalized.includes('jessore') ||
    normalized.includes('jashore') ||
    normalized.includes('যশোর')
  ) {
    return settings.delivery_charge_jessore;
  }
  return settings.delivery_charge_outside;
}

export function calculateDiscountPercent(regularPrice: number, offerPrice: number): number {
  if (regularPrice <= 0 || offerPrice >= regularPrice) return 0;
  return Math.round(((regularPrice - offerPrice) / regularPrice) * 100);
}

export interface WhatsAppMessageResult {
  messageText: string;
  whatsappUrl: string;
}

export function buildWhatsAppOrderPayload(
  order: Order,
  items: OrderItem[],
  settings: StoreSettings
): WhatsAppMessageResult {
  const booksDescription = items
    .map(
      (item) =>
        `${item.product_title}\nপরিমাণ: ${item.quantity}\nমূল্য: ৳${item.total_price}`
    )
    .join('\n\n');

  const messageText = `আসসালামু আলাইকুম।
MEDI Nursing Book Store-এ নতুন অর্ডার।

অর্ডার নম্বর: ${order.order_number}

নাম: ${order.customer_name}
মোবাইল: ${order.phone}
জেলা: ${order.district}
উপজেলা: ${order.upazila}
ঠিকানা: ${order.address}

বইয়ের বিবরণ:
${booksDescription}

মোট বইয়ের মূল্য: ৳${order.subtotal}
ডেলিভারি চার্জ: ৳${order.delivery_charge}
সর্বমোট বিল: ৳${order.total}

ধন্যবাদ।
${settings.website_name}`;

  const cleanNumber = settings.whatsapp_international.replace(/[^0-9]/g, '');
  const encodedMessage = encodeURIComponent(messageText);
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

  return { messageText, whatsappUrl };
}
