import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5183'
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('.summary-card')
await page.waitForTimeout(400)

await page.screenshot({ path: 'docs/screenshots/dashboard.png', fullPage: false })

await page.goto(`${BASE}/transactions`, { waitUntil: 'networkidle' })
await page.waitForSelector('.tx-item')
await page.screenshot({ path: 'docs/screenshots/transactions.png' })

await page.goto(`${BASE}/add-transaction?type=expense`, { waitUntil: 'networkidle' })
await page.waitForSelector('.tx-form')
await page.screenshot({ path: 'docs/screenshots/add-transaction.png' })

await page.goto(`${BASE}/budgets`, { waitUntil: 'networkidle' })
await page.waitForSelector('.budget-card')
await page.screenshot({ path: 'docs/screenshots/budgets.png' })

await page.goto(`${BASE}/reports`, { waitUntil: 'networkidle' })
await page.waitForSelector('.summary-card')
await page.waitForTimeout(300)
await page.screenshot({ path: 'docs/screenshots/reports.png', fullPage: false })

await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
await page.waitForSelector('.settings-panel')
await page.screenshot({ path: 'docs/screenshots/settings.png' })

// Dark theme dashboard
await page.click('input[value="dark"]')
await page.waitForTimeout(250)
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('.summary-card')
await page.screenshot({ path: 'docs/screenshots/dashboard-dark.png' })
await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
await page.click('input[value="light"]')
await page.waitForTimeout(200)

// Mobile
await page.setViewportSize({ width: 390, height: 844 })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForSelector('.summary-card')
await page.waitForTimeout(300)
await page.screenshot({ path: 'docs/screenshots/mobile-dashboard.png' })

await page.goto(`${BASE}/definitely-missing`, { waitUntil: 'networkidle' })
await page.setViewportSize({ width: 1400, height: 900 })
await page.waitForSelector('.notfound-card')
await page.screenshot({ path: 'docs/screenshots/not-found.png' })

await browser.close()
console.log('Screenshots saved to docs/screenshots/')
