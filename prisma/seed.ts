import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function daysAgo(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59))
  return d
}

const COUNTRIES_SAFE = [
  { name: 'Latvia', code: 'LV' },
  { name: 'Estonia', code: 'EE' },
  { name: 'Lithuania', code: 'LT' },
  { name: 'Germany', code: 'DE' },
  { name: 'Sweden', code: 'SE' },
  { name: 'Finland', code: 'FI' },
  { name: 'Poland', code: 'PL' },
  { name: 'United Kingdom', code: 'GB' },
]

const COUNTRIES_RISKY = [
  { name: 'Nigeria', code: 'NG' },
  { name: 'Russia', code: 'RU' },
  { name: 'China', code: 'CN' },
  { name: 'Turkey', code: 'TR' },
  { name: 'Cayman Islands', code: 'KY' },
  { name: 'Ukraine', code: 'UA' },
]

const MERCHANTS_SAFE = [
  { name: 'Maxima XX', category: 'Grocery' },
  { name: 'Rimi Hypermarket', category: 'Grocery' },
  { name: 'Circle K', category: 'Gas Station' },
  { name: 'Bolt Food', category: 'Food Delivery' },
  { name: 'Wolt', category: 'Food Delivery' },
  { name: 'Amazon.de', category: 'E-commerce' },
  { name: 'Spotify', category: 'Entertainment' },
  { name: 'Netflix', category: 'Entertainment' },
  { name: 'Booking.com', category: 'Travel' },
  { name: 'Airbnb', category: 'Travel' },
  { name: 'SEB Banka', category: 'Banking' },
  { name: 'Latvijas Pasts', category: 'Postal' },
  { name: 'Elkor', category: 'Electronics' },
  { name: 'IKEA', category: 'Furniture' },
]

const MERCHANTS_SUSPICIOUS = [
  { name: 'CryptoExchange Ltd', category: 'Cryptocurrency' },
  { name: 'Unknown Beneficiary', category: 'Transfer' },
  { name: 'Shell Company LLC', category: 'Business Services' },
  { name: 'Luxury Watches Inc', category: 'Jewelry' },
  { name: 'Fast Cash International', category: 'Money Transfer' },
  { name: 'GlobalBet Casino', category: 'Gambling' },
  { name: 'Offshore Holdings SA', category: 'Financial Services' },
]

const TX_TYPES = ['CARD', 'WIRE', 'ONLINE', 'ATM'] as const
const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

const AI_FLAGS = [
  'unusual_country', 'high_amount', 'velocity_spike', 'new_merchant',
  'first_time_country', 'amount_5x_average', 'night_transaction',
  'structuring_pattern', 'shell_company', 'tax_haven',
  'rapid_succession', 'round_amount', 'foreign_high_risk',
  'luxury_goods', 'cryptocurrency', 'gambling_site',
]

async function main() {
  console.log('Seeding database with rich data...')

  // Clear existing data
  await prisma.action.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users
  const passwordHash = await hash('demo123', 12)

  const analyst = await prisma.user.create({
    data: { email: 'analyst@swedbank.lv', password: passwordHash, name: 'Anna Bērziņa', role: 'BANK_ANALYST' },
  })
  const operator = await prisma.user.create({
    data: { email: 'operator@lmt.lv', password: passwordHash, name: 'Jānis Kalniņš', role: 'TELECOM_OPERATOR' },
  })
  const officer = await prisma.user.create({
    data: { email: 'officer@fid.gov.lv', password: passwordHash, name: 'Mārtiņš Liepiņš', role: 'AUTHORITY_OFFICER' },
  })

  console.log('Created 3 demo users')

  // Create 50 customers
  const customers: string[] = []
  for (let i = 0; i < 50; i++) {
    const riskRand = Math.random()
    const riskProfile = riskRand < 0.6 ? 'LOW' : riskRand < 0.85 ? 'MEDIUM' : riskRand < 0.95 ? 'HIGH' : 'CRITICAL'
    const safeCountries = Array.from({ length: randomInt(1, 4) }, () => pick(COUNTRIES_SAFE).code)
    const safeMerchants = Array.from({ length: randomInt(2, 6) }, () => pick(MERCHANTS_SAFE).name)

    const c = await prisma.customer.create({
      data: {
        anonymizedName: `Customer #${String.fromCharCode(65 + (i % 26))}-${String(1000 + i).slice(1)}`,
        avgTransaction: parseFloat(randomBetween(30, 2000).toFixed(2)),
        usualCountries: JSON.stringify(Array.from(new Set<string>(safeCountries))),
        usualMerchants: JSON.stringify(Array.from(new Set<string>(safeMerchants))),
        accountAge: randomInt(30, 3650),
        riskProfile,
      },
    })
    customers.push(c.id)
  }
  console.log('Created 50 customers')

  // Create 200 transactions (spread over 30 days)
  const txIds: string[] = []
  for (let i = 0; i < 200; i++) {
    const isFraud = Math.random() < 0.15 // 15% fraud rate for interesting demo
    const country = isFraud && Math.random() < 0.7 ? pick(COUNTRIES_RISKY) : pick(COUNTRIES_SAFE)
    const merchant = isFraud && Math.random() < 0.6 ? pick(MERCHANTS_SUSPICIOUS) : pick(MERCHANTS_SAFE)
    const txType = pick([...TX_TYPES])
    const baseAmount = isFraud ? randomBetween(500, 8000) : randomBetween(5, 500)
    const amount = parseFloat(baseAmount.toFixed(2))

    let riskScore: number
    let riskLevel: string
    let status: string
    const flags: string[] = []

    if (isFraud) {
      riskScore = parseFloat(randomBetween(0.6, 0.99).toFixed(3))
      if (riskScore >= 0.85) { riskLevel = 'CRITICAL'; status = pick(['FLAGGED', 'BLOCKED', 'ESCALATED']) }
      else if (riskScore >= 0.6) { riskLevel = 'HIGH'; status = pick(['FLAGGED', 'UNDER_REVIEW', 'ESCALATED']) }
      else { riskLevel = 'MEDIUM'; status = pick(['FLAGGED', 'UNDER_REVIEW', 'PENDING']) }

      // Add relevant flags
      if (COUNTRIES_RISKY.some(c => c.code === country.code)) flags.push('unusual_country', 'foreign_high_risk')
      if (amount > 2000) flags.push('high_amount')
      if (amount > 1000 && Math.random() > 0.5) flags.push('amount_5x_average')
      if (MERCHANTS_SUSPICIOUS.some(m => m.name === merchant.name)) flags.push('new_merchant')
      if (Math.random() > 0.6) flags.push(pick(['velocity_spike', 'night_transaction', 'round_amount', 'rapid_succession']))
      if (merchant.category === 'Cryptocurrency') flags.push('cryptocurrency')
      if (merchant.category === 'Gambling') flags.push('gambling_site')
      if (country.code === 'KY') flags.push('tax_haven')
    } else {
      riskScore = parseFloat(randomBetween(0.01, 0.35).toFixed(3))
      riskLevel = riskScore > 0.25 ? 'MEDIUM' : 'LOW'
      status = riskScore > 0.3 ? 'PENDING' : 'APPROVED'
    }

    const featureImportance: Record<string, number> = {
      amount: parseFloat(randomBetween(0.05, 0.35).toFixed(3)),
      country_risk: parseFloat(randomBetween(0.05, 0.3).toFixed(3)),
      merchant_category: parseFloat(randomBetween(0.03, 0.2).toFixed(3)),
      transaction_velocity: parseFloat(randomBetween(0.02, 0.15).toFixed(3)),
      time_of_day: parseFloat(randomBetween(0.01, 0.1).toFixed(3)),
      device_match: parseFloat(randomBetween(0.01, 0.1).toFixed(3)),
      is_new_merchant: parseFloat(randomBetween(0.01, 0.15).toFixed(3)),
      customer_avg_diff: parseFloat(randomBetween(0.02, 0.2).toFixed(3)),
    }

    const explanation = isFraud
      ? `${txType} transaction of EUR ${amount.toLocaleString()} to ${merchant.name} in ${country.name}. Risk factors: ${flags.slice(0, 3).join(', ')}.`
      : `Normal ${txType.toLowerCase()} transaction within expected patterns for this customer.`

    const tx = await prisma.transaction.create({
      data: {
        externalId: `TXN-${String(10000 + i).slice(1)}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
        timestamp: daysAgo(randomInt(0, 30)),
        customerId: pick(customers),
        amount,
        currency: 'EUR',
        type: txType,
        merchantName: merchant.name,
        merchantCategory: merchant.category,
        country: country.name,
        countryCode: country.code,
        riskScore,
        riskLevel,
        status,
        aiFlags: JSON.stringify(Array.from(new Set<string>(flags))),
        aiExplanation: explanation,
        featureImportance: JSON.stringify(featureImportance),
      },
    })
    txIds.push(tx.id)
  }
  console.log('Created 200 transactions')

  // Create 60 communications
  const commIds: string[] = []
  const smishingTemplates = [
    'Swedbank: Your account has been locked due to suspicious activity. Verify now: bit.ly/sw3db4nk-verify',
    'URGENT: Your Swedbank card ending 4521 was used for EUR 2,499. If not you, click: swedbank-security.xyz/verify',
    'Swedbank Security Alert: We detected unauthorized access. Confirm your identity: https://swedbank-login.tk',
    'Your Swedbank account will be suspended in 24h. Update your details: swed-bank-verify.com',
    'Congratulations! You won EUR 50,000 in Swedbank loyalty program. Pay EUR 500 processing fee to claim.',
    'IMPORTANT: Your Swedbank internet banking certificate expires today. Renew at: ibank-swedbank.ru/renew',
  ]
  const legitimateTemplates = [
    'Swedbank: Your transfer of EUR 150.00 to Maxima XX has been completed.',
    'Swedbank: Monthly account statement for March 2026 is available in your internet bank.',
    'Swedbank: Your new debit card ending 7823 has been activated successfully.',
    'Swedbank: Login from new device detected. If this was you, no action needed.',
    'Swedbank: Direct debit of EUR 45.99 for Netflix processed successfully.',
  ]
  const vishingNotes = [
    'Caller claimed to be Swedbank security department. Requested full card number, CVV, and PIN for "verification". Used pressure tactics.',
    'Automated call claiming account compromise. Instructed to press 1 and enter banking credentials. Spoofed Swedbank caller ID.',
    'Caller posed as fraud investigation team. Asked customer to transfer funds to "safe account". Provided fake case number.',
    'Call from alleged Swedbank IT support. Requested remote access to computer to "fix security issue". Asked to install TeamViewer.',
    'Caller claimed customer won a prize. Required "small processing fee" paid via gift cards. Heavy accent, poor Latvian.',
  ]

  for (let i = 0; i < 60; i++) {
    const typeRand = Math.random()
    let type: string, content: string, fraudScore: number, classification: string, patterns: string[]
    let senderNumber: string | null = null
    let senderEmail: string | null = null

    if (typeRand < 0.4) {
      // SMS
      type = 'SMS'
      const isFraud = Math.random() < 0.4
      if (isFraud) {
        content = pick(smishingTemplates)
        fraudScore = parseFloat(randomBetween(0.75, 0.99).toFixed(3))
        classification = fraudScore > 0.9 ? 'scam' : 'suspicious'
        patterns = ['urgency', 'fake_link', 'brand_impersonation'].filter(() => Math.random() > 0.3)
        senderNumber = `+${pick(['44', '371', '370', '372', '7'])}${randomInt(1000000, 9999999)}`
      } else {
        content = pick(legitimateTemplates)
        fraudScore = parseFloat(randomBetween(0.01, 0.1).toFixed(3))
        classification = 'legitimate'
        patterns = []
        senderNumber = '+371 67 17 1880'
      }
    } else if (typeRand < 0.7) {
      // EMAIL
      type = 'EMAIL'
      const isFraud = Math.random() < 0.35
      if (isFraud) {
        content = `Dear valued customer, we have detected unusual activity on your account. Please verify your identity immediately by clicking the link below. Failure to do so within 24 hours will result in account suspension.`
        fraudScore = parseFloat(randomBetween(0.7, 0.97).toFixed(3))
        classification = 'suspicious'
        patterns = ['spoofed_domain', 'urgency', 'credential_harvesting'].filter(() => Math.random() > 0.2)
        senderEmail = pick(['security@sw3dbank-verify.com', 'noreply@swedbank-alert.tk', 'support@swed-bank.xyz', 'admin@ibank-swedbnk.ru'])
      } else {
        content = 'Your monthly account statement is ready. Log in to your internet bank to view details.'
        fraudScore = parseFloat(randomBetween(0.01, 0.08).toFixed(3))
        classification = 'legitimate'
        patterns = []
        senderEmail = 'noreply@swedbank.lv'
      }
    } else {
      // PHONE_CALL
      type = 'PHONE_CALL'
      const isFraud = Math.random() < 0.45
      if (isFraud) {
        content = pick(vishingNotes)
        fraudScore = parseFloat(randomBetween(0.7, 0.95).toFixed(3))
        classification = 'vishing'
        patterns = ['authority_impersonation', 'information_extraction', 'pressure_tactics', 'spoofed_caller_id'].filter(() => Math.random() > 0.3)
        senderNumber = `+${pick(['371', '44', '1', '7'])}${randomInt(10000000, 99999999)}`
      } else {
        content = 'Regular customer service call regarding account inquiry.'
        fraudScore = parseFloat(randomBetween(0.01, 0.1).toFixed(3))
        classification = 'legitimate'
        patterns = []
        senderNumber = '+371 67 444 444'
      }
    }

    const comm = await prisma.communication.create({
      data: {
        type,
        senderNumber,
        senderEmail,
        content,
        timestamp: daysAgo(randomInt(0, 30)),
        fraudScore,
        classification,
        patterns: JSON.stringify(patterns),
      },
    })
    commIds.push(comm.id)
  }
  console.log('Created 60 communications')

  // Create 15 alerts with chain of responsibility data
  const flaggedTxs = txIds.slice(0, 30) // first 30 txs as potential alert targets

  const alertData = [
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'AUTHORITY_OFFICER', severity: 'CRITICAL', status: 'IN_PROGRESS',
      description: 'Suspected money laundering: Large wire transfers to shell companies in Cayman Islands with structuring pattern detected',
      chain: [
        { role: 'BANK_ANALYST', action: 'DETECTED', timestamp: daysAgo(5).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'ESCALATED', timestamp: daysAgo(4).toISOString(), status: 'completed' },
        { role: 'AUTHORITY_OFFICER', action: 'INVESTIGATING', timestamp: daysAgo(3).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'TELECOM_OPERATOR', severity: 'HIGH', status: 'IN_PROGRESS',
      description: 'Customer reported receiving vishing call before unauthorized transaction. Phone number needs investigation.',
      chain: [
        { role: 'BANK_ANALYST', action: 'DETECTED', timestamp: daysAgo(3).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'ESCALATED_TO_TELECOM', timestamp: daysAgo(2).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'INVESTIGATING_NUMBER', timestamp: daysAgo(1).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'TELECOM_OPERATOR', targetRole: 'BANK_ANALYST', severity: 'HIGH', status: 'ACKNOWLEDGED',
      description: 'Massive smishing campaign targeting Swedbank customers detected. 47 fraudulent SMS from this number range in last 24h.',
      chain: [
        { role: 'TELECOM_OPERATOR', action: 'DETECTED_CAMPAIGN', timestamp: daysAgo(2).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'BLOCKED_NUMBERS', timestamp: daysAgo(2).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'ACKNOWLEDGED', timestamp: daysAgo(1).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'AUTHORITY_OFFICER', severity: 'CRITICAL', status: 'RESOLVED',
      description: 'Cross-border fraud ring identified: coordinated card fraud across Latvia, Estonia, and Lithuania',
      chain: [
        { role: 'BANK_ANALYST', action: 'DETECTED', timestamp: daysAgo(15).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'BLOCKED_ACCOUNTS', timestamp: daysAgo(14).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'BLOCKED_NUMBERS', timestamp: daysAgo(13).toISOString(), status: 'completed' },
        { role: 'AUTHORITY_OFFICER', action: 'INVESTIGATION_COMPLETE', timestamp: daysAgo(5).toISOString(), status: 'completed' },
      ],
    },
    {
      sourceRole: 'TELECOM_OPERATOR', targetRole: 'AUTHORITY_OFFICER', severity: 'HIGH', status: 'IN_PROGRESS',
      description: 'Organized vishing operation using VoIP with spoofed Swedbank caller IDs. Multiple victims reported.',
      chain: [
        { role: 'TELECOM_OPERATOR', action: 'DETECTED', timestamp: daysAgo(4).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'FLAGGED_TRANSACTIONS', timestamp: daysAgo(3).toISOString(), status: 'completed' },
        { role: 'AUTHORITY_OFFICER', action: 'INVESTIGATING', timestamp: daysAgo(2).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'TELECOM_OPERATOR', severity: 'MEDIUM', status: 'OPEN',
      description: 'Suspicious pattern: multiple customers received calls from +371 2X XXX XX7 before making unusual transactions',
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'AUTHORITY_OFFICER', severity: 'CRITICAL', status: 'OPEN',
      description: 'Potential terrorist financing pattern: regular small transfers to high-risk jurisdiction with structured amounts',
      chain: [
        { role: 'BANK_ANALYST', action: 'DETECTED', timestamp: daysAgo(1).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'ESCALATED', timestamp: daysAgo(0).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'TELECOM_OPERATOR', targetRole: 'BANK_ANALYST', severity: 'MEDIUM', status: 'OPEN',
      description: 'New phishing domain registered: swedbank-verify-lv.com — appears to be credential harvesting site',
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'TELECOM_OPERATOR', severity: 'HIGH', status: 'ACKNOWLEDGED',
      description: 'Customer account takeover via SIM swap detected. Customer reported phone service interruption before fraudulent wire transfer.',
      chain: [
        { role: 'BANK_ANALYST', action: 'DETECTED', timestamp: daysAgo(2).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'ACKNOWLEDGED', timestamp: daysAgo(1).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'AUTHORITY_OFFICER', severity: 'HIGH', status: 'RESOLVED',
      description: 'Investment scam: customer tricked into sending EUR 15,000 to fake crypto platform after social engineering campaign',
      chain: [
        { role: 'BANK_ANALYST', action: 'DETECTED', timestamp: daysAgo(20).toISOString(), status: 'completed' },
        { role: 'BANK_ANALYST', action: 'BLOCKED', timestamp: daysAgo(20).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'TRACED_NUMBERS', timestamp: daysAgo(18).toISOString(), status: 'completed' },
        { role: 'AUTHORITY_OFFICER', action: 'CASE_CLOSED', timestamp: daysAgo(8).toISOString(), status: 'completed' },
      ],
    },
    {
      sourceRole: 'TELECOM_OPERATOR', targetRole: 'AUTHORITY_OFFICER', severity: 'CRITICAL', status: 'IN_PROGRESS',
      description: 'Large-scale automated robocall campaign impersonating Swedbank detected — 500+ calls in 2 hours',
      chain: [
        { role: 'TELECOM_OPERATOR', action: 'DETECTED', timestamp: daysAgo(1).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'BLOCKED_RANGE', timestamp: daysAgo(1).toISOString(), status: 'completed' },
        { role: 'AUTHORITY_OFFICER', action: 'INVESTIGATING', timestamp: daysAgo(0).toISOString(), status: 'active' },
      ],
    },
    {
      sourceRole: 'BANK_ANALYST', targetRole: 'TELECOM_OPERATOR', severity: 'LOW', status: 'DISMISSED',
      description: 'False positive: legitimate business call flagged as suspicious. Customer confirmed the transaction.',
      chain: [
        { role: 'BANK_ANALYST', action: 'FLAGGED', timestamp: daysAgo(7).toISOString(), status: 'completed' },
        { role: 'TELECOM_OPERATOR', action: 'DISMISSED', timestamp: daysAgo(6).toISOString(), status: 'completed' },
      ],
    },
  ]

  for (let i = 0; i < alertData.length; i++) {
    const a = alertData[i]
    await prisma.alert.create({
      data: {
        sourceRole: a.sourceRole,
        targetRole: a.targetRole,
        transactionId: flaggedTxs[i % flaggedTxs.length],
        communicationId: commIds[i % commIds.length],
        severity: a.severity,
        status: a.status,
        description: a.description,
        evidence: JSON.stringify([
          { type: 'ai_detection', riskScore: randomBetween(0.7, 0.99).toFixed(2) },
          { type: 'pattern_match', pattern: pick(AI_FLAGS), confidence: randomBetween(0.6, 0.95).toFixed(2) },
        ]),
        chainOfResponsibility: JSON.stringify(a.chain || []),
      },
    })
  }
  console.log(`Created ${alertData.length} alerts with chain data`)

  // Create audit log entries
  const auditActions = [
    { action: 'AI_SCORE', entityType: 'Transaction', explanation: 'AI model scored transaction' },
    { action: 'REVIEW_TRANSACTION', entityType: 'Transaction', explanation: 'Analyst reviewed flagged transaction' },
    { action: 'ESCALATE', entityType: 'Transaction', explanation: 'Transaction escalated to authority' },
    { action: 'BLOCK_TRANSACTION', entityType: 'Transaction', explanation: 'Transaction blocked due to high risk' },
    { action: 'APPROVE_TRANSACTION', entityType: 'Transaction', explanation: 'Transaction approved after review' },
    { action: 'LOGIN', entityType: 'User', explanation: 'User logged in' },
    { action: 'ANALYZE_COMMUNICATION', entityType: 'Communication', explanation: 'AI analyzed communication for fraud patterns' },
    { action: 'BLOCK_NUMBER', entityType: 'Communication', explanation: 'Telecom operator blocked suspicious number' },
    { action: 'CREATE_ALERT', entityType: 'Alert', explanation: 'New cross-sector alert created' },
    { action: 'UPDATE_ALERT', entityType: 'Alert', explanation: 'Alert status updated' },
    { action: 'DATA_SHARE', entityType: 'Alert', explanation: 'Data shared between sectors per GDPR consent' },
    { action: 'GDPR_ACCESS_REQUEST', entityType: 'Customer', explanation: 'GDPR data access request processed' },
  ]

  for (let i = 0; i < 80; i++) {
    const template = pick(auditActions)
    const userId = pick([analyst.id, operator.id, officer.id, null])
    await prisma.auditLog.create({
      data: {
        action: template.action,
        entityType: template.entityType,
        entityId: pick([...txIds.slice(0, 10), ...commIds.slice(0, 5)]),
        userId,
        inputData: JSON.stringify({ model: 'fraud-detection-v2', version: '2.1.0' }),
        outputData: JSON.stringify({ riskScore: randomBetween(0, 1).toFixed(3), processed: true }),
        explanation: template.explanation,
        timestamp: daysAgo(randomInt(0, 30)),
      },
    })
  }
  console.log('Created 80 audit log entries')

  console.log('\nSeed completed! Summary:')
  console.log('- 3 demo users')
  console.log('- 50 customers')
  console.log('- 200 transactions (15% fraud rate)')
  console.log('- 60 communications (SMS, email, phone calls)')
  console.log('- 12 cross-sector alerts with chain of responsibility')
  console.log('- 80 audit log entries')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
