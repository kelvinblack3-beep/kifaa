# Regulatory boundaries

This repository is **engineering infrastructure** for a Kenya-first financial **interface and orchestration** layer.

## What KIFAA is

- Software that routes payment *instructions* to licensed providers
- A double-entry ledger for internal accounting of those instructions
- Identity, risk, notification, and merchant tooling

## What KIFAA is not

- A licensed Payment Service Provider (PSP)
- An e-money issuer
- A deposit-taking institution
- A substitute for M-PESA, Airtel Money, banks, or card schemes

## Live operations

Any live money movement, settlement, or customer funds handling **requires**:

- Appropriate licenses / partnerships under Kenyan law (CBK and relevant regulators)
- Contracts with licensed providers (Safaricom Daraja, Airtel, banks, PSPs)
- Compliance programs (KYC/AML, consumer protection, data protection)

Until those exist, adapters remain sandbox skeletons and the system must not claim to move real money.

## PIN policy

KIFAA never asks for provider wallet PINs. Provider PIN entry stays on the official provider UI/USSD.
