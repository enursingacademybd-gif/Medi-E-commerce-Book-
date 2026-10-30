import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toBengaliDigits,
  formatPriceBDT,
  generateOrderNumber,
  isValidBDPhone,
  calculateDeliveryCharge,
  calculateDiscountPercent,
  buildWhatsAppOrderPayload
} from './orderUtils';
import { Order, OrderItem, StoreSettings } from '../types';

test('toBengaliDigits correctly converts English numbers to Bengali', () => {
  assert.equal(toBengaliDigits(1234567890), '১২৩৪৫৬৭৮৯০');
  assert.equal(toBengaliDigits('450 BDT'), '৪৫০ BDT');
});

test('calculateDiscountPercent returns accurate rounded percentage', () => {
  assert.equal(calculateDiscountPercent(500, 400), 20);
  assert.equal(calculateDiscountPercent(650, 490), 25);
  assert.equal(calculateDiscountPercent(400, 400), 0);
  assert.equal(calculateDiscountPercent(300, 400), 0);
});

test('isValidBDPhone validates 11-digit and 13-digit Bangladeshi phone numbers', () => {
  assert.equal(isValidBDPhone('01959253030'), true);
  assert.equal(isValidBDPhone('01712345678'), true);
  assert.equal(isValidBDPhone('8801959253030'), true);
  assert.equal(isValidBDPhone('+8801959253030'), true);
  assert.equal(isValidBDPhone('01212345678'), false); // 012 is invalid operator prefix in BD
  assert.equal(isValidBDPhone('017123456'), false); // Too short
  assert.equal(isValidBDPhone('abcdefghijk'), false);
});

test('calculateDeliveryCharge applies 60 BDT for Jessore and 120 BDT outside', () => {
  const dummySettings: StoreSettings = {
    website_name: 'MEDI Nursing Book Store',
    logo: '',
    tagline: 'স্বপ্ন তোমার, দায়িত্ব আমাদের',
    whatsapp_number: '01959253030',
    whatsapp_international: '8801959253030',
    contact_phone: '01959253030',
    facebook_url: '',
    address_text: '',
    delivery_charge_jessore: 60,
    delivery_charge_outside: 120,
    banner_headline: '',
    banner_subtitle: '',
    notice_text: ''
  };

  assert.equal(calculateDeliveryCharge('Jessore', dummySettings), 60);
  assert.equal(calculateDeliveryCharge('Jashore', dummySettings), 60);
  assert.equal(calculateDeliveryCharge('যশোর', dummySettings), 60);
  assert.equal(calculateDeliveryCharge('Dhaka', dummySettings), 120);
  assert.equal(calculateDeliveryCharge('Chittagong', dummySettings), 120);
  assert.equal(calculateDeliveryCharge('Khulna', dummySettings), 120);
});

test('buildWhatsAppOrderPayload formats exact required Bengali order template', () => {
  const order: Order = {
    id: 'ord-123',
    order_number: 'MNB-2610-1001',
    customer_name: 'তানজিলা আক্তার',
    phone: '01959253030',
    district: 'যশোর',
    upazila: 'যশোর সদর',
    address: 'ঘোপ সেন্ট্রাল রোড, বাড়ি নং ১২',
    subtotal: 900,
    delivery_charge: 60,
    total: 960,
    status: 'pending',
    items: [],
    archived_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const items: OrderItem[] = [
    {
      id: 'item-1',
      order_id: 'ord-123',
      product_id: 'prod-1',
      product_title: 'MEDI নার্সিং গাইড',
      quantity: 2,
      unit_price: 450,
      total_price: 900
    }
  ];

  const settings: StoreSettings = {
    website_name: 'MEDI Nursing Book Store',
    logo: '',
    tagline: 'স্বপ্ন তোমার, দায়িত্ব আমাদের',
    whatsapp_number: '01959253030',
    whatsapp_international: '8801959253030',
    contact_phone: '01959253030',
    facebook_url: '',
    address_text: '',
    delivery_charge_jessore: 60,
    delivery_charge_outside: 120,
    banner_headline: '',
    banner_subtitle: '',
    notice_text: ''
  };

  const result = buildWhatsAppOrderPayload(order, items, settings);

  assert.ok(result.messageText.includes('MEDI Nursing Book Store-এ নতুন অর্ডার।'));
  assert.ok(result.messageText.includes('অর্ডার নম্বর: MNB-2610-1001'));
  assert.ok(result.messageText.includes('নাম: তানজিলা আক্তার'));
  assert.ok(result.messageText.includes('বইয়ের বিবরণ:'));
  assert.ok(result.messageText.includes('MEDI নার্সিং গাইড'));
  assert.ok(result.messageText.includes('পরিমাণ: 2'));
  assert.ok(result.messageText.includes('মূল্য: ৳900'));
  assert.ok(result.messageText.includes('সর্বমোট বিল: ৳960'));
  assert.ok(result.whatsappUrl.startsWith('https://wa.me/8801959253030?text='));
});

test('book serial ordering sorts products strictly by sort_order ascending', () => {
  const mockBooks = [
    { id: 'book-3', title: 'Book 3', sort_order: 3 },
    { id: 'book-1', title: 'Book 1', sort_order: 1 },
    { id: 'book-2', title: 'Book 2', sort_order: 2 }
  ];

  const sorted = [...mockBooks].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
  assert.equal(sorted[0].id, 'book-1');
  assert.equal(sorted[1].id, 'book-2');
  assert.equal(sorted[2].id, 'book-3');

  // Move book-3 to position 1
  const reorderedIds = ['book-3', 'book-1', 'book-2'];
  const idMap = new Map(reorderedIds.map((id, idx) => [id, idx + 1]));
  const updated = mockBooks.map(b => ({ ...b, sort_order: idMap.get(b.id)! }));
  const newlySorted = [...updated].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  assert.equal(newlySorted[0].id, 'book-3');
  assert.equal(newlySorted[0].sort_order, 1);
  assert.equal(newlySorted[1].id, 'book-1');
  assert.equal(newlySorted[1].sort_order, 2);
  assert.equal(newlySorted[2].id, 'book-2');
  assert.equal(newlySorted[2].sort_order, 3);
});
