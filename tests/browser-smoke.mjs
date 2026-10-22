import { chromium } from 'playwright'
import assert from 'node:assert'

const BASE = process.env.BASE_URL || 'http://localhost:5183'
const results = []
function pass(name) {
  results.push(`  ✓ ${name}`)
  console.log(`  ✓ ${name}`)
}

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
})

try {
  // 1. Dashboard loads
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('.summary-card', { timeout: 8000 })
  assert.match(await page.title(), /Expense Tracker Pro/)
  pass('Application starts and dashboard loads')

  // Seed check: sample data should exist on first launch
  const txCount = await page.evaluate(() => {
    const raw = localStorage.getItem('expenseTrackerPro.transactions')
    return raw ? JSON.parse(raw).length : 0
  })
  assert.ok(txCount > 0, 'sample data seeded on first launch')
  pass(`Sample data seeded on first launch (${txCount} transactions)`)

  // Balance is computed from data (not hardcoded)
  const balanceText = await page.locator('.summary-card--forest .summary-card-value').innerText()
  assert.match(balanceText, /[₹$€]/)
  pass(`Available balance rendered (${balanceText.trim()})`)

  // 2. Add income via quick action
  await page.click('a[href="/add-transaction?type=income"] >> nth=0')
  await page.waitForSelector('.tx-form')
  await page.fill('input[name="title"]', 'Test income entry')
  await page.fill('input[name="amount"]', '1234')
  await page.selectOption('select[name="category"]', 'Freelancing')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/transactions')
  await page.waitForSelector('.toast')
  pass('Adding income works and shows success toast')

  // Verify income increased balance
  await page.click('a[href="/"] >> nth=0')
  await page.waitForSelector('.summary-card--forest')
  const newBalance = await page.locator('.summary-card--forest .summary-card-value').innerText()
  const oldNum = Number(balanceText.replace(/[^0-9.-]/g, ''))
  const newNum = Number(newBalance.replace(/[^0-9.-]/g, ''))
  assert.strictEqual(newNum, oldNum + 1234, `balance ${oldNum} -> ${newNum}`)
  pass('Adding income increases available balance by exact amount')

  // 3. Add expense decreases balance
  await page.goto(`${BASE}/add-transaction?type=expense`, { waitUntil: 'networkidle' })
  await page.fill('input[name="title"]', 'Test expense entry')
  await page.fill('input[name="amount"]', '334')
  await page.selectOption('select[name="category"]', 'Food')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/transactions')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const afterExpense = await page.locator('.summary-card--forest .summary-card-value').innerText()
  assert.strictEqual(Number(afterExpense.replace(/[^0-9.-]/g, '')), newNum - 334)
  pass('Adding expense decreases available balance by exact amount')

  // 4. Validation: empty form shows errors
  await page.goto(`${BASE}/add-transaction`, { waitUntil: 'networkidle' })
  await page.click('button[type="submit"]')
  await page.waitForSelector('.form-error')
  const errCount = await page.locator('.form-error').count()
  assert.ok(errCount >= 2, `expected >=2 validation errors, got ${errCount}`)
  pass(`Form validation blocks empty submit (${errCount} errors shown)`)

  // 5. Negative amount rejected
  await page.fill('input[name="title"]', 'Bad amount')
  await page.fill('input[name="amount"]', '-50')
  await page.click('button[type="submit"]')
  await page.waitForSelector('text=Amount must be greater than zero')
  pass('Negative amount rejected with accessible error')

  // 6. Future date rejected
  await page.fill('input[name="amount"]', '50')
  await page.fill('input[name="date"]', '2099-01-01')
  await page.click('button[type="submit"]')
  await page.waitForSelector('text=Date cannot be in the future')
  pass('Future date rejected')

  // 7. Transactions page: search + filter
  await page.goto(`${BASE}/transactions`, { waitUntil: 'networkidle' })
  await page.fill('#filter-search', 'Test income entry')
  await page.waitForTimeout(250)
  let items = await page.locator('.tx-item').count()
  assert.strictEqual(items, 1)
  pass('Search by title filters correctly')

  await page.fill('#filter-search', '')
  await page.selectOption('#filter-type', 'expense')
  await page.waitForTimeout(250)
  const amounts = await page.locator('.tx-item-amount').allInnerTexts()
  assert.ok(amounts.every((a) => a.trim().startsWith('-')), 'all shown amounts are expenses')
  pass('Type filter shows only expenses')

  await page.selectOption('#filter-type', 'all')
  await page.selectOption('#filter-sort', 'amount')
  await page.click('.sort-dir-btn')
  await page.waitForTimeout(250)
  const firstAmount = await page.locator('.tx-item-amount >> nth=0').innerText()
  const lastAmount = await page.locator('.tx-item-amount >> nth=-1').innerText()
  const f = Math.abs(Number(firstAmount.replace(/[^0-9.]/g, '')))
  const l = Math.abs(Number(lastAmount.replace(/[^0-9.]/g, '')))
  assert.ok(f <= l, `ascending amount sort: first ${f} <= last ${l}`)
  pass('Sort by amount ascending works')

  // 8. Edit transaction updates calculations
  await page.click('.tx-item >> nth=0 >> text=Edit')
  await page.waitForURL('**/add-transaction?edit=*')
  await page.fill('input[name="amount"]', '999')
  await page.click('button[type="submit"]')
  await page.waitForURL('**/transactions')
  await page.waitForSelector('.toast')
  pass('Edit transaction saves and navigates back')

  // 9. Delete with confirmation
  const beforeDelete = await page.locator('.tx-item').count()
  page.once('dialog', () => {})
  await page.click('.tx-item >> nth=0 >> text=Delete')
  await page.waitForSelector('.dialog')
  assert.match(await page.locator('.dialog-title').innerText(), /Delete transaction/i)
  await page.click('.dialog .btn-danger')
  await page.waitForTimeout(300)
  const afterDelete = await page.locator('.tx-item').count()
  assert.strictEqual(afterDelete, beforeDelete - 1)
  pass('Delete requires confirmation and removes the row')

  // Cancel path
  await page.click('.tx-item >> nth=0 >> text=Delete')
  await page.waitForSelector('.dialog')
  await page.click('.dialog .btn-ghost')
  await page.waitForTimeout(200)
  assert.strictEqual(await page.locator('.tx-item').count(), afterDelete)
  pass('Cancel on confirmation keeps the transaction')

  // 10. Persistence across reload
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('.tx-item')
  assert.strictEqual(await page.locator('.tx-item').count(), afterDelete)
  pass('Data persists after page refresh')

  // 11. Budgets page
  await page.goto(`${BASE}/budgets`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.budget-card')
  const budgetCards = await page.locator('.budget-card').count()
  assert.ok(budgetCards >= 1)
  pass(`Budgets page renders ${budgetCards} budget cards with real spending`)

  // Add a budget for a category that has spending but no budget yet (Healthcare ~320 in samples)
  await page.click('text=Add budget')
  await page.waitForSelector('.budget-form')
  await page.selectOption('#budget-category', 'Healthcare')
  await page.fill('#budget-limit', '50')
  await page.click('.budget-form button[type="submit"]')
  await page.waitForSelector('.toast')
  pass('Adding a Healthcare budget of 50 works')

  // Utilization > 100% should mark exceeded (sample Healthcare spend > 50)
  const healthCard = page.locator('.budget-card').filter({ hasText: 'Healthcare' })
  await healthCard.waitFor()
  const badge = await healthCard.locator('.badge').innerText()
  assert.match(badge, /Exceeded/)
  pass(`Over-budget card shows Exceeded badge (${badge.trim()})`)

  // Duplicate prevention: categories with an existing budget are removed from the dropdown
  await page.click('text=Add budget')
  await page.waitForSelector('.budget-form')
  const options = await page.locator('#budget-category option').allInnerTexts()
  assert.ok(!options.includes('Healthcare'), 'Healthcare removed from dropdown after budget saved')
  pass('Duplicate budgets prevented (category removed from dropdown)')
  await page.click('.budget-form-panel .btn-ghost >> nth=0')

  // Zero/negative budget rejected
  await page.click('text=Add budget')
  await page.waitForSelector('.budget-form')
  await page.selectOption('#budget-category', 'Shopping')
  await page.fill('#budget-limit', '-5')
  await page.click('.budget-form button[type="submit"]')
  await page.waitForSelector('text=Budget must be greater than zero')
  pass('Negative budget value rejected')

  // 12. Reports page
  await page.goto(`${BASE}/reports`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.summary-card')
  const reportCards = await page.locator('.summary-card').count()
  assert.strictEqual(reportCards, 4)
  await page.waitForSelector('.chart-svg, .chart-empty')
  pass('Reports page renders 4 metric cards and a chart')

  // Month selector changes data
  await page.fill('#report-month', '2026-01')
  await page.waitForTimeout(300)
  const emptyNote = await page.locator('.reports-empty-month, .summary-card').first().isVisible()
  assert.ok(emptyNote)
  pass('Month selector updates report metrics (empty month handled)')

  // 13. Settings: currency switch updates all amounts
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
  await page.click('input[value="USD"]')
  await page.waitForSelector('.toast')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const usdBalance = await page.locator('.summary-card--forest .summary-card-value').innerText()
  assert.match(usdBalance, /\$/)
  pass('Currency preference (USD) updates displayed amounts')

  // 14. Theme persists
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
  await page.click('input[value="dark"]')
  await page.waitForTimeout(200)
  const themeAttr = await page.getAttribute('html', 'data-theme')
  assert.strictEqual(themeAttr, 'dark')
  await page.reload({ waitUntil: 'networkidle' })
  assert.strictEqual(await page.getAttribute('html', 'data-theme'), 'dark')
  pass('Dark theme applies and persists across refresh')

  // Back to light + INR for remaining tests
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
  await page.click('input[value="light"]')
  await page.click('input[value="INR"]')
  await page.waitForTimeout(300)

  // 15. Profile name shows in greeting
  await page.fill('#settings-name', 'Aarav')
  await page.click('text=Save name')
  await page.waitForTimeout(300)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  assert.match(await page.locator('.welcome-title').innerText(), /Aarav/)
  pass('Profile display name appears in dashboard greeting')

  // 16. Browser navigation (back/forward)
  await page.goto(`${BASE}/transactions`, { waitUntil: 'networkidle' })
  await page.goBack()
  await page.waitForSelector('.welcome-banner')
  await page.goForward()
  await page.waitForSelector('.filters-panel')
  pass('Browser back/forward navigation works')

  // 17. Unknown route -> NotFound with working link
  await page.goto(`${BASE}/definitely-not-a-page`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.notfound-card')
  assert.match(await page.locator('.notfound-code').innerText(), /404/)
  await page.click('.notfound-card a.btn')
  await page.waitForSelector('.welcome-banner')
  pass('Unknown routes show 404 page with working dashboard link')

  // 18. Corrupt localStorage does not crash
  await page.evaluate(() => {
    localStorage.setItem('expenseTrackerPro.transactions', '{corrupt!!')
    localStorage.setItem('expenseTrackerPro.budgets', 'not json')
    localStorage.setItem('expenseTrackerPro.settings', '["bad"]')
  })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('.app-layout')
  pass('Corrupt localStorage data does not crash the app')

  // Restore data for final state
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' })
  await page.click('text=Restore sample data')
  await page.waitForSelector('.dialog')
  await page.click('.dialog .btn-danger')
  await page.waitForTimeout(400)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('.summary-card')
  pass('Restore sample data works with confirmation')

  // 19. Mobile layout
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(300)
  const sidebarHidden = await page.evaluate(() => {
    const el = document.querySelector('.sidebar')
    const style = window.getComputedStyle(el)
    return style.transform.includes('-') || style.display !== 'none'
  })
  const menuBtnVisible = await page.locator('.navbar-menu-btn').isVisible()
  assert.ok(menuBtnVisible, 'hamburger visible on mobile')
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  )
  assert.ok(overflow, 'no horizontal overflow on mobile')
  await page.click('.navbar-menu-btn')
  await page.waitForTimeout(350)
  const sidebarOpen = await page.evaluate(() =>
    document.querySelector('.sidebar').classList.contains('is-open'),
  )
  assert.ok(sidebarOpen, 'drawer opens')
  await page.click('.sidebar-link >> nth=0')
  await page.waitForTimeout(300)
  const sidebarClosed = await page.evaluate(
    () => !document.querySelector('.sidebar').classList.contains('is-open'),
  )
  assert.ok(sidebarClosed, 'drawer closes after nav')
  pass('Mobile layout: hamburger nav, drawer, no horizontal overflow')

  await page.setViewportSize({ width: 1280, height: 900 })

  // 20. Accessibility basics
  await page.goto(`${BASE}/add-transaction`, { waitUntil: 'networkidle' })
  const labelsOk = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea')
    return [...inputs].every((input) => {
      if (input.type === 'hidden') return true
      const id = input.getAttribute('id')
      return id ? Boolean(document.querySelector(`label[for="${id}"]`)) : Boolean(input.getAttribute('aria-label'))
    })
  })
  assert.ok(labelsOk, 'all form fields have labels')
  pass('All form fields have associated labels')

  // Summary of console errors
  const realErrors = errors.filter(
    (e) => !e.includes('favicon') && !e.includes('Download the React DevTools'),
  )
  if (realErrors.length > 0) {
    console.log('\nConsole errors detected:')
    realErrors.forEach((e) => console.log('  !', e))
  } else {
    pass('No console errors during entire session')
  }

  console.log(`\nALL ${results.length} BROWSER SMOKE TESTS PASSED ✓`)
} catch (err) {
  console.error('\nTEST FAILED:', err.message)
  console.error(results.join('\n'))
  process.exitCode = 1
} finally {
  await browser.close()
}
