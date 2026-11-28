"""Praman Financial Copilot - Cashflow Mathematics Engine.
Deterministic calculator for post-payout solvency, critical debt service coverage, and EMI runway buffers.
"""
from typing import Dict, Any


def format_inr(amount: float) -> str:
    """Formats float amount to Indian Rupee currency string (e.g., ₹1,84,000.00)."""
    sign = "-" if amount < 0 else ""
    abs_amt = abs(amount)
    s = f"{abs_amt:.2f}"
    parts = s.split(".")
    integer_part = parts[0]
    decimal_part = parts[1]

    if len(integer_part) > 3:
        last3 = integer_part[-3:]
        remaining = integer_part[:-3]
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        groups.append(last3)
        formatted_int = ",".join(groups)
    else:
        formatted_int = integer_part

    return f"{sign}₹{formatted_int}.{decimal_part}"


def compute_runway_impact(
    current_bank_balance: float,
    upcoming_30d_critical_emi: float,
    disputed_or_payout_amount: float,
    recommended_hold_or_recovery: float
) -> Dict[str, Any]:
    """Computes exact mathematical cashflow impact and debt service runway protection.
    
    Guarantees 100% mathematical consistency without LLM hallucinations.
    """
    current_bank_balance = float(current_bank_balance)
    upcoming_30d_critical_emi = float(upcoming_30d_critical_emi)
    disputed_or_payout_amount = float(disputed_or_payout_amount)
    recommended_hold_or_recovery = float(recommended_hold_or_recovery)

    # 1. Unmitigated full payout scenario
    cash_after_full_payout = round(current_bank_balance - disputed_or_payout_amount, 2)
    post_emi_free_cash_without_praman = round(cash_after_full_payout - upcoming_30d_critical_emi, 2)
    
    if upcoming_30d_critical_emi > 0:
        emi_coverage_ratio_without_praman = round(cash_after_full_payout / upcoming_30d_critical_emi, 2)
    else:
        emi_coverage_ratio_without_praman = 999.0

    # 2. Mitigated Praman action scenario
    net_disbursed = round(disputed_or_payout_amount - recommended_hold_or_recovery, 2)
    cash_after_praman_action = round(current_bank_balance - net_disbursed, 2)
    post_emi_free_cash_with_praman = round(cash_after_praman_action - upcoming_30d_critical_emi, 2)

    if upcoming_30d_critical_emi > 0:
        emi_coverage_ratio_with_praman = round(cash_after_praman_action / upcoming_30d_critical_emi, 2)
    else:
        emi_coverage_ratio_with_praman = 999.0

    # Buffer delta gained by Praman intervention
    buffer_preservation = round(post_emi_free_cash_with_praman - post_emi_free_cash_without_praman, 2)

    # Solvency & liquidity risk categorization
    if post_emi_free_cash_without_praman < 25000.0:
        unmitigated_risk = "CRITICAL_DEFAULT_RISK"
    elif post_emi_free_cash_without_praman < 50000.0:
        unmitigated_risk = "MARGINAL_RISK"
    else:
        unmitigated_risk = "SOLVENT_WITH_BUFFER"

    if post_emi_free_cash_with_praman >= 50000.0:
        mitigated_status = "SAFE_SOLVENT"
    elif post_emi_free_cash_with_praman > 0:
        mitigated_status = "PROTECTED_BUFFER"
    else:
        mitigated_status = "DEFICIT"

    return {
        "current_bank_balance": current_bank_balance,
        "upcoming_30d_critical_emi": upcoming_30d_critical_emi,
        "disputed_or_payout_amount": disputed_or_payout_amount,
        "recommended_hold_or_recovery": recommended_hold_or_recovery,
        "net_disbursed": net_disbursed,
        "cash_after_full_payout": cash_after_full_payout,
        "cash_after_praman_action": cash_after_praman_action,
        "post_emi_free_cash_without_praman": post_emi_free_cash_without_praman,
        "post_emi_free_cash_with_praman": post_emi_free_cash_with_praman,
        "emi_coverage_ratio_without_praman": emi_coverage_ratio_without_praman,
        "emi_coverage_ratio_with_praman": emi_coverage_ratio_with_praman,
        "buffer_preservation": buffer_preservation,
        "unmitigated_risk": unmitigated_risk,
        "mitigated_status": mitigated_status,
        "formatted": {
            "current_bank_balance": format_inr(current_bank_balance),
            "upcoming_30d_critical_emi": format_inr(upcoming_30d_critical_emi),
            "disputed_or_payout_amount": format_inr(disputed_or_payout_amount),
            "recommended_hold_or_recovery": format_inr(recommended_hold_or_recovery),
            "cash_after_full_payout": format_inr(cash_after_full_payout),
            "cash_after_praman_action": format_inr(cash_after_praman_action),
            "post_emi_free_cash_without_praman": format_inr(post_emi_free_cash_without_praman),
            "post_emi_free_cash_with_praman": format_inr(post_emi_free_cash_with_praman),
            "buffer_preservation": format_inr(buffer_preservation),
            "coverage_without_praman": f"{emi_coverage_ratio_without_praman:.2f}x",
            "coverage_with_praman": f"{emi_coverage_ratio_with_praman:.2f}x",
        }
    }
