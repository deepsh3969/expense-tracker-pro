import { currentMonthKey, toISODate, todayISO } from './dateHelpers.js'

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function dayOffsetISO(daysBack) {
  const d = new Date()
  d.setDate(d.getDate() - daysBack)
  return toISODate(d)
}

function firstOfMonthOffsetISO(monthsBack, day) {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, day)
  return toISODate(d)
}

export function createSampleTransactions() {
  const today = todayISO()
  const rows = [
    { title: 'Monthly pocket money', amount: 3000, type: 'income', category: 'Pocket Money', date: firstOfMonthOffsetISO(0, 1), notes: 'From home' },
    { title: 'Scholarship installment', amount: 8000, type: 'income', category: 'Scholarship', date: firstOfMonthOffsetISO(0, 5), notes: 'Merit scholarship' },
    { title: 'Cafeteria lunch', amount: 120, type: 'expense', category: 'Food', date: dayOffsetISO(0), notes: '' },
    { title: 'Bus pass recharge', amount: 350, type: 'expense', category: 'Transportation', date: dayOffsetISO(1), notes: 'Monthly pass' },
    { title: 'Lab manual printout', amount: 180, type: 'expense', category: 'Education', date: dayOffsetISO(2), notes: '' },
    { title: 'Coffee with classmates', amount: 90, type: 'expense', category: 'Food', date: dayOffsetISO(2), notes: '' },
    { title: 'Grocery run', amount: 640, type: 'expense', category: 'Food', date: dayOffsetISO(4), notes: 'Hostel pantry' },
    { title: 'Movie night', amount: 250, type: 'expense', category: 'Entertainment', date: dayOffsetISO(5), notes: '' },
    { title: 'Mobile recharge', amount: 299, type: 'expense', category: 'Mobile and Internet', date: dayOffsetISO(6), notes: '3-month plan' },
    { title: 'Notebook and stationery', amount: 210, type: 'expense', category: 'Education', date: dayOffsetISO(8), notes: '' },
    { title: 'Freelance logo design', amount: 2500, type: 'income', category: 'Freelancing', date: dayOffsetISO(9), notes: 'Local café client' },
    { title: 'Room rent share', amount: 2500, type: 'expense', category: 'Accommodation', date: firstOfMonthOffsetISO(0, 3), notes: 'Shared room' },
    { title: 'Pharmacy — vitamins', amount: 320, type: 'expense', category: 'Healthcare', date: dayOffsetISO(10), notes: '' },
    { title: 'Weekend trek transport', amount: 480, type: 'expense', category: 'Transportation', date: dayOffsetISO(12), notes: '' },
    { title: 'T-shirt sale pick-up', amount: 799, type: 'expense', category: 'Shopping', date: dayOffsetISO(13), notes: '' },
    { title: 'Wi-Fi contribution', amount: 400, type: 'expense', category: 'Mobile and Internet', date: firstOfMonthOffsetISO(0, 7), notes: 'Hostel Wi-Fi split' },
    { title: 'Canteen snacks', amount: 145, type: 'expense', category: 'Food', date: dayOffsetISO(14), notes: '' },
    { title: 'Typing assignment help', amount: 600, type: 'income', category: 'Part-time Work', date: dayOffsetISO(15), notes: 'Junior student' },
    { title: 'Textbook second-hand', amount: 450, type: 'expense', category: 'Education', date: dayOffsetISO(18), notes: '' },
    { title: 'Hostel dues', amount: 2200, type: 'expense', category: 'Accommodation', date: firstOfMonthOffsetISO(1, 4), notes: '' },
    { title: 'Monthly pocket money', amount: 3000, type: 'income', category: 'Pocket Money', date: firstOfMonthOffsetISO(1, 1), notes: 'From home' },
    { title: 'Fest food court', amount: 560, type: 'expense', category: 'Food', date: firstOfMonthOffsetISO(1, 18), notes: '' },
    { title: ' Concert ticket', amount: 900, type: 'expense', category: 'Entertainment', date: firstOfMonthOffsetISO(1, 22), notes: '' },
    { title: 'Auto rides', amount: 260, type: 'expense', category: 'Transportation', date: firstOfMonthOffsetISO(1, 25), notes: '' },
    { title: 'Scholarship installment', amount: 8000, type: 'income', category: 'Scholarship', date: firstOfMonthOffsetISO(2, 5), notes: 'Merit scholarship' },
    { title: 'Project printing', amount: 340, type: 'expense', category: 'Education', date: firstOfMonthOffsetISO(2, 12), notes: '' },
    { title: 'Winter jacket', amount: 1600, type: 'expense', category: 'Shopping', date: firstOfMonthOffsetISO(2, 20), notes: '' },
    { title: 'Monthly pocket money', amount: 3000, type: 'income', category: 'Pocket Money', date: firstOfMonthOffsetISO(2, 1), notes: 'From home' },
  ]
  return rows.map((row, index) => ({
    id: generateId(),
    title: row.title.trim(),
    amount: row.amount,
    type: row.type,
    category: row.category,
    date: row.date > today ? today : row.date,
    notes: row.notes,
    createdAt: Date.now() - index * 1000,
  }))
}

export function createSampleBudgets() {
  const month = currentMonthKey()
  return [
    { id: generateId(), month, category: 'Overall', limit: 12000 },
    { id: generateId(), month, category: 'Food', limit: 2500 },
    { id: generateId(), month, category: 'Transportation', limit: 1200 },
    { id: generateId(), month, category: 'Education', limit: 1500 },
    { id: generateId(), month, category: 'Entertainment', limit: 800 },
    { id: generateId(), month, category: 'Accommodation', limit: 3000 },
  ]
}

export const DEFAULT_PROFILE = {
  name: 'Student',
}

export const DEFAULT_SETTINGS = {
  currency: 'INR',
  theme: 'light',
}
