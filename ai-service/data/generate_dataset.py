"""
Synthetic data generator for Swedbank FraudShield AI.

Produces realistic banking data:
- 500 customer profiles
- 50,000 transactions (~3% fraud rate)
- 5,000 SMS/email communications (mix of legit and smishing/phishing)
- 2,000 phone call records (normal + vishing patterns)

All output written as JSON to data/output/.
"""

import json
import os
import random
import string
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np

SEED = 42
np.random.seed(SEED)
random.seed(SEED)

OUTPUT_DIR = Path(__file__).resolve().parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

BALTIC_NORDIC_COUNTRIES = ["LV", "LT", "EE", "FI", "SE", "NO", "DK"]
FOREIGN_COUNTRIES = ["NG", "UA", "RU", "CN", "BR", "PH", "ID", "VN", "GH", "KE"]

COMMON_MERCHANTS = [
    "Rimi", "Maxima", "Lidl", "Circle K", "Neste", "Bolt", "Wolt",
    "Telia", "Elisa", "Swedbank Insurance", "SEB Life", "IKEA",
    "H&M", "Zara", "Coop", "Prisma", "Stockmann", "Tallinn Airport Duty Free",
    "Riga Central Market", "Vilnius Grand Resort", "Nordic Hotels",
    "Apollo Kino", "Spotify", "Netflix", "Google Services", "Apple",
    "Pharmacy 1", "Euroaptieka", "Monton", "Sportland",
]

SUSPICIOUS_MERCHANTS = [
    "CryptoExchangeXYZ", "QuickCashLoan.biz", "OnlineBet777",
    "ForeignWireService", "UnknownATM_NG", "UnknownATM_RU",
    "GiftCardBulk.com", "DigitalWalletTransfer", "P2P_Anonymous",
    "HighRiskTrading.io", "FastMoney.net", "CasinoPlanet",
    "UnverifiedMerchant_001", "WireTransfer_Offshore",
]

LEGITIMATE_SMS_TEMPLATES = [
    "Your Swedbank account balance is {amount} EUR. Log in at swedbank.lv for details.",
    "Payment of {amount} EUR to {merchant} confirmed. Ref: {ref}.",
    "Your card ending in {card} was used for {amount} EUR at {merchant}.",
    "Monthly statement for {month} is ready. View it in your Swedbank app.",
    "Reminder: your loan payment of {amount} EUR is due on {date}.",
    "Swedbank: your deposit of {amount} EUR has been received.",
    "Your scheduled transfer of {amount} EUR to {recipient} was completed.",
    "Interest rate update: your savings account now earns {rate}% APR.",
    "Swedbank app update available. Please update for the latest security features.",
    "Your new Swedbank debit card has been shipped. Expected delivery: {date}.",
]

PHISHING_SMS_TEMPLATES = [
    "URGENT: Your Swedbank account has been locked! Verify now: http://swedbank-secure-login.{tld}/verify",
    "Swedbank Security: Unusual activity detected. Confirm identity: http://sw3dbank.{tld}/confirm",
    "You have a pending refund of {amount} EUR. Claim here: http://swedbank-refund.{tld}/claim",
    "ALERT: Someone tried to access your account from {country}. Secure it: http://swedbank-alert.{tld}/secure",
    "Your Swedbank card will be suspended in 24h. Update info: http://swedbank-update.{tld}/card",
    "Congratulations! You won {amount} EUR from Swedbank lottery. Claim: http://swedbank-prize.{tld}/win",
    "IMPORTANT: Verify your Swedbank mobile ID now or lose access: http://verify-swedbank.{tld}",
    "Swedbank Support: We detected a virus on your device. Install protection: http://swedbank-protect.{tld}",
    "Your tax refund of {amount} EUR is ready. Swedbank: http://tax-refund-swedbank.{tld}",
    "Action required: Your Swedbank account will be closed. Prevent: http://keep-swedbank.{tld}/save",
]

LEGITIMATE_EMAIL_SUBJECTS = [
    "Your monthly account statement is ready",
    "Payment confirmation - {merchant}",
    "Swedbank: Important information about your account",
    "Your loan application has been received",
    "Welcome to Swedbank Mobile App",
    "Scheduled maintenance notification",
    "Your investment portfolio summary",
    "Annual fee notification",
]

PHISHING_EMAIL_SUBJECTS = [
    "URGENT: Account Security Alert - Immediate Action Required",
    "Your account has been compromised - Verify NOW",
    "Pending refund: {amount} EUR - Claim immediately",
    "Swedbank: Suspicious login from {country}",
    "WARNING: Your card will be blocked",
    "You have won a prize from Swedbank!",
    "Tax refund notification - Swedbank",
    "Critical security update required",
]

LEGITIMATE_CALL_REASONS = [
    "loan_inquiry", "card_replacement", "account_balance",
    "mortgage_consultation", "investment_advice", "insurance_claim",
    "address_change", "pin_reset", "statement_request", "general_inquiry",
]

VISHING_CALL_REASONS = [
    "account_verification_urgent", "security_breach_notification",
    "tax_refund_processing", "prize_claim", "debt_collection_threat",
    "police_impersonation", "bank_fraud_department", "tech_support_scam",
]


# ---------------------------------------------------------------------------
# Customer generation
# ---------------------------------------------------------------------------

def generate_customers(n: int = 500) -> list[dict]:
    customers = []
    for i in range(n):
        cid = f"C-{np.random.randint(1000, 9999)}-{i:04d}"
        label = f"Customer #A-{np.random.randint(1000, 9999)}"
        avg_txn = round(float(np.random.uniform(50, 2000)), 2)
        num_usual_countries = np.random.randint(1, 4)
        usual_countries = list(
            np.random.choice(BALTIC_NORDIC_COUNTRIES, size=num_usual_countries, replace=False)
        )
        num_usual_merchants = np.random.randint(3, 10)
        usual_merchants = list(
            np.random.choice(COMMON_MERCHANTS, size=num_usual_merchants, replace=False)
        )
        account_age_days = int(np.random.randint(30, 3651))
        customers.append(
            {
                "customer_id": cid,
                "name": label,
                "avg_transaction_amount_eur": avg_txn,
                "usual_countries": usual_countries,
                "usual_merchants": usual_merchants,
                "account_age_days": account_age_days,
                "created_at": (
                    datetime(2026, 3, 25) - timedelta(days=account_age_days)
                ).isoformat(),
            }
        )
    return customers


# ---------------------------------------------------------------------------
# Transaction generation
# ---------------------------------------------------------------------------

def generate_transactions(customers: list[dict], n: int = 50000) -> list[dict]:
    fraud_count = int(n * 0.03)
    normal_count = n - fraud_count

    transactions: list[dict] = []
    base_date = datetime(2026, 3, 25)

    # Normal transactions
    for _ in range(normal_count):
        customer = random.choice(customers)
        amount = round(float(np.random.lognormal(mean=np.log(150), sigma=0.8)), 2)
        amount = min(amount, 10000.0)
        country = random.choice(customer["usual_countries"])
        merchant = random.choice(
            customer["usual_merchants"] if random.random() < 0.85 else COMMON_MERCHANTS
        )
        hour = int(np.random.choice(
            range(24),
            p=_business_hour_distribution(),
        ))
        days_ago = np.random.randint(0, 365)
        ts = base_date - timedelta(days=int(days_ago), hours=int(24 - hour))

        transactions.append(
            {
                "transaction_id": _txn_id(),
                "customer_id": customer["customer_id"],
                "amount_eur": amount,
                "country": country,
                "merchant": merchant,
                "hour_of_day": hour,
                "is_international": country not in BALTIC_NORDIC_COUNTRIES,
                "is_new_merchant": random.random() < 0.05,
                "velocity_last_1h": int(np.random.poisson(1)),
                "velocity_last_24h": int(np.random.poisson(3)),
                "days_since_last_txn": round(float(np.random.exponential(2)), 1),
                "amount_vs_avg_ratio": round(amount / max(customer["avg_transaction_amount_eur"], 1), 2),
                "timestamp": ts.isoformat(),
                "is_fraud": False,
            }
        )

    # Fraudulent transactions
    for _ in range(fraud_count):
        customer = random.choice(customers)
        avg = customer["avg_transaction_amount_eur"]

        # Fraud patterns
        pattern = random.choice(["high_amount", "foreign", "velocity", "mixed"])

        if pattern == "high_amount":
            amount = round(float(np.random.uniform(avg * 3, avg * 20)), 2)
            country = random.choice(customer["usual_countries"] + FOREIGN_COUNTRIES[:3])
            merchant = random.choice(SUSPICIOUS_MERCHANTS + COMMON_MERCHANTS[:5])
            velocity_1h = int(np.random.poisson(2))
            velocity_24h = int(np.random.poisson(5))
        elif pattern == "foreign":
            amount = round(float(np.random.uniform(avg * 0.5, avg * 5)), 2)
            country = random.choice(FOREIGN_COUNTRIES)
            merchant = random.choice(SUSPICIOUS_MERCHANTS)
            velocity_1h = int(np.random.poisson(1))
            velocity_24h = int(np.random.poisson(4))
        elif pattern == "velocity":
            amount = round(float(np.random.uniform(avg * 0.8, avg * 3)), 2)
            country = random.choice(BALTIC_NORDIC_COUNTRIES + FOREIGN_COUNTRIES[:2])
            merchant = random.choice(COMMON_MERCHANTS + SUSPICIOUS_MERCHANTS[:3])
            velocity_1h = int(np.random.randint(4, 15))
            velocity_24h = int(np.random.randint(10, 40))
        else:  # mixed
            amount = round(float(np.random.uniform(avg * 2, avg * 10)), 2)
            country = random.choice(FOREIGN_COUNTRIES)
            merchant = random.choice(SUSPICIOUS_MERCHANTS)
            velocity_1h = int(np.random.randint(3, 10))
            velocity_24h = int(np.random.randint(8, 25))

        # Fraud tends to happen at night
        hour = int(np.random.choice([0, 1, 2, 3, 4, 5, 22, 23], p=[0.15, 0.15, 0.15, 0.15, 0.1, 0.1, 0.1, 0.1]))
        days_ago = np.random.randint(0, 365)
        ts = base_date - timedelta(days=int(days_ago), hours=int(24 - hour))

        transactions.append(
            {
                "transaction_id": _txn_id(),
                "customer_id": customer["customer_id"],
                "amount_eur": amount,
                "country": country,
                "merchant": merchant,
                "hour_of_day": hour,
                "is_international": country not in BALTIC_NORDIC_COUNTRIES,
                "is_new_merchant": random.random() < 0.65,
                "velocity_last_1h": velocity_1h,
                "velocity_last_24h": velocity_24h,
                "days_since_last_txn": round(float(np.random.exponential(0.3)), 1),
                "amount_vs_avg_ratio": round(amount / max(avg, 1), 2),
                "timestamp": ts.isoformat(),
                "is_fraud": True,
            }
        )

    random.shuffle(transactions)
    return transactions


def _business_hour_distribution() -> list[float]:
    """Probability distribution favouring business hours for normal transactions."""
    probs = []
    for h in range(24):
        if 8 <= h <= 20:
            probs.append(6.0)
        elif 6 <= h <= 7 or 21 <= h <= 22:
            probs.append(2.0)
        else:
            probs.append(0.5)
    total = sum(probs)
    return [p / total for p in probs]


def _txn_id() -> str:
    return "TXN-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=12))


# ---------------------------------------------------------------------------
# Communication generation
# ---------------------------------------------------------------------------

def generate_communications(customers: list[dict], n: int = 5000) -> list[dict]:
    fraud_ratio = 0.20
    fraud_count = int(n * fraud_ratio)
    legit_count = n - fraud_count

    comms: list[dict] = []
    base_date = datetime(2026, 3, 25)
    fake_tlds = ["xyz", "tk", "ml", "ga", "cf", "top", "buzz", "click"]

    # Legitimate communications
    for _ in range(legit_count):
        customer = random.choice(customers)
        channel = random.choice(["sms", "email"])
        days_ago = np.random.randint(0, 365)
        ts = base_date - timedelta(days=int(days_ago))

        if channel == "sms":
            template = random.choice(LEGITIMATE_SMS_TEMPLATES)
            body = template.format(
                amount=round(random.uniform(10, 5000), 2),
                merchant=random.choice(COMMON_MERCHANTS),
                ref="".join(random.choices(string.digits, k=8)),
                card="".join(random.choices(string.digits, k=4)),
                month=random.choice(["January", "February", "March", "April", "May", "June"]),
                date=(base_date + timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                recipient=f"Customer #{random.randint(1000, 9999)}",
                rate=round(random.uniform(0.5, 4.5), 1),
            )
            sender = "+371 6700 1234"
            subject = None
        else:
            subject = random.choice(LEGITIMATE_EMAIL_SUBJECTS).format(
                merchant=random.choice(COMMON_MERCHANTS),
                amount=round(random.uniform(10, 5000), 2),
                country=random.choice(BALTIC_NORDIC_COUNTRIES),
            )
            body = (
                f"Dear Customer,\n\n{subject}.\n\n"
                "Please log in to your Swedbank internet bank or app to view details.\n\n"
                "Best regards,\nSwedbank Customer Service\n"
                "This is an automated message. Do not reply."
            )
            sender = "info@swedbank.lv"

        comms.append(
            {
                "communication_id": f"COM-{''.join(random.choices(string.digits, k=8))}",
                "customer_id": customer["customer_id"],
                "channel": channel,
                "sender": sender,
                "subject": subject,
                "body": body,
                "timestamp": ts.isoformat(),
                "is_fraud": False,
            }
        )

    # Fraudulent communications (smishing / phishing)
    for _ in range(fraud_count):
        customer = random.choice(customers)
        channel = random.choice(["sms", "email"])
        days_ago = np.random.randint(0, 365)
        ts = base_date - timedelta(days=int(days_ago))
        tld = random.choice(fake_tlds)

        if channel == "sms":
            template = random.choice(PHISHING_SMS_TEMPLATES)
            body = template.format(
                amount=round(random.uniform(100, 9999), 2),
                tld=tld,
                country=random.choice(FOREIGN_COUNTRIES),
            )
            sender = random.choice([
                "+371 2000 0000", "+44 900 000 000", "+1 800 000 0000",
                "Swedbank", "SWEDBANK-SEC", "BankAlert",
            ])
            subject = None
        else:
            subject = random.choice(PHISHING_EMAIL_SUBJECTS).format(
                amount=round(random.uniform(100, 9999), 2),
                country=random.choice(FOREIGN_COUNTRIES),
            )
            fake_domain = random.choice([
                f"swedbank-security.{tld}",
                f"no-reply-swedbank.{tld}",
                f"alert.swedbank.{tld}",
                f"support-swedbank.{tld}",
                f"swedbank-verify.{tld}",
            ])
            body = (
                f"Dear Valued Customer,\n\n"
                f"{subject}.\n\n"
                f"Click the link below IMMEDIATELY to secure your account:\n"
                f"http://{fake_domain}/secure?id={''.join(random.choices(string.hexdigits, k=16))}\n\n"
                "If you do not act within 24 hours, your account will be permanently locked.\n\n"
                "Swedbank Security Team"
            )
            sender = f"security@{fake_domain}"

        comms.append(
            {
                "communication_id": f"COM-{''.join(random.choices(string.digits, k=8))}",
                "customer_id": customer["customer_id"],
                "channel": channel,
                "sender": sender,
                "subject": subject,
                "body": body,
                "timestamp": ts.isoformat(),
                "is_fraud": True,
            }
        )

    random.shuffle(comms)
    return comms


# ---------------------------------------------------------------------------
# Phone call generation
# ---------------------------------------------------------------------------

def generate_calls(customers: list[dict], n: int = 2000) -> list[dict]:
    fraud_ratio = 0.15
    fraud_count = int(n * fraud_ratio)
    legit_count = n - fraud_count

    calls: list[dict] = []
    base_date = datetime(2026, 3, 25)

    # Normal calls
    for _ in range(legit_count):
        customer = random.choice(customers)
        duration_seconds = int(np.random.lognormal(mean=np.log(180), sigma=0.6))
        duration_seconds = min(duration_seconds, 3600)
        days_ago = np.random.randint(0, 365)
        hour = int(np.random.choice(range(8, 19)))
        ts = base_date - timedelta(days=int(days_ago), hours=int(24 - hour))

        calls.append(
            {
                "call_id": f"CALL-{''.join(random.choices(string.digits, k=8))}",
                "customer_id": customer["customer_id"],
                "caller_number": "+371 6700 " + "".join(random.choices(string.digits, k=4)),
                "direction": random.choice(["inbound", "outbound"]),
                "reason": random.choice(LEGITIMATE_CALL_REASONS),
                "duration_seconds": duration_seconds,
                "hour_of_day": hour,
                "caller_asked_for_credentials": False,
                "caller_created_urgency": False,
                "caller_threatened_account_closure": False,
                "caller_requested_remote_access": False,
                "caller_asked_for_otp": False,
                "multiple_calls_same_day": random.random() < 0.05,
                "caller_id_spoofed": False,
                "timestamp": ts.isoformat(),
                "is_vishing": False,
            }
        )

    # Vishing calls
    for _ in range(fraud_count):
        customer = random.choice(customers)
        duration_seconds = int(np.random.lognormal(mean=np.log(420), sigma=0.5))
        duration_seconds = min(duration_seconds, 5400)
        days_ago = np.random.randint(0, 365)
        hour = int(np.random.choice(
            range(24),
            p=_vishing_hour_distribution(),
        ))
        ts = base_date - timedelta(days=int(days_ago), hours=int(24 - hour))

        calls.append(
            {
                "call_id": f"CALL-{''.join(random.choices(string.digits, k=8))}",
                "customer_id": customer["customer_id"],
                "caller_number": random.choice([
                    "+44 " + "".join(random.choices(string.digits, k=10)),
                    "+1 " + "".join(random.choices(string.digits, k=10)),
                    "Unknown",
                    "+371 " + "".join(random.choices(string.digits, k=8)),
                ]),
                "direction": "inbound",
                "reason": random.choice(VISHING_CALL_REASONS),
                "duration_seconds": duration_seconds,
                "hour_of_day": hour,
                "caller_asked_for_credentials": random.random() < 0.80,
                "caller_created_urgency": random.random() < 0.85,
                "caller_threatened_account_closure": random.random() < 0.55,
                "caller_requested_remote_access": random.random() < 0.35,
                "caller_asked_for_otp": random.random() < 0.70,
                "multiple_calls_same_day": random.random() < 0.40,
                "caller_id_spoofed": random.random() < 0.60,
                "timestamp": ts.isoformat(),
                "is_vishing": True,
            }
        )

    random.shuffle(calls)
    return calls


def _vishing_hour_distribution() -> list[float]:
    probs = []
    for h in range(24):
        if 9 <= h <= 12:
            probs.append(5.0)
        elif 13 <= h <= 17:
            probs.append(4.0)
        elif 18 <= h <= 21:
            probs.append(3.0)
        else:
            probs.append(0.5)
    total = sum(probs)
    return [p / total for p in probs]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("Generating synthetic dataset for Swedbank FraudShield AI...")

    print("  [1/4] Generating 500 customer profiles...")
    customers = generate_customers(500)

    print("  [2/4] Generating 50,000 transactions (~3% fraud)...")
    transactions = generate_transactions(customers, 50_000)

    print("  [3/4] Generating 5,000 communications...")
    communications = generate_communications(customers, 5_000)

    print("  [4/4] Generating 2,000 phone call records...")
    calls = generate_calls(customers, 2_000)

    # Write outputs
    for name, data in [
        ("customers.json", customers),
        ("transactions.json", transactions),
        ("communications.json", communications),
        ("calls.json", calls),
    ]:
        path = OUTPUT_DIR / name
        with open(path, "w") as f:
            json.dump(data, f, indent=2, default=str)
        print(f"  Wrote {path} ({len(data):,} records)")

    # Summary stats
    fraud_txn = sum(1 for t in transactions if t["is_fraud"])
    fraud_com = sum(1 for c in communications if c["is_fraud"])
    vishing = sum(1 for c in calls if c["is_vishing"])
    print(f"\nDataset summary:")
    print(f"  Customers:      {len(customers):,}")
    print(f"  Transactions:   {len(transactions):,} (fraud: {fraud_txn:,} = {100*fraud_txn/len(transactions):.1f}%)")
    print(f"  Communications: {len(communications):,} (fraud: {fraud_com:,} = {100*fraud_com/len(communications):.1f}%)")
    print(f"  Calls:          {len(calls):,} (vishing: {vishing:,} = {100*vishing/len(calls):.1f}%)")
    print("\nDone.")


if __name__ == "__main__":
    main()
