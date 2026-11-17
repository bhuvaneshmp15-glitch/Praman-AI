"""Cashflow mathematics and EMI buffer protection calculations."""
from typing import Dict, Any


def calculate_liquidity_safety_buffer(
    current_bank_balance: float,
    upcoming_critical_commitments: float,
    proposed_payout_amount: float
) -> Dict[str, Any]:
    projected_balance = current_bank_balance - proposed_payout_amount
    shortfall = upcoming_critical_commitments - projected_balance
    is_safe = projected_balance >= upcoming_critical_commitments
    
    return {
        "current_bank_balance": current_bank_balance,
        "upcoming_critical_commitments": upcoming_critical_commitments,
        "proposed_payout_amount": proposed_payout_amount,
        "projected_balance": projected_balance,
        "shortfall": max(0.0, shortfall),
        "is_safe_to_disburse": is_safe
    }
