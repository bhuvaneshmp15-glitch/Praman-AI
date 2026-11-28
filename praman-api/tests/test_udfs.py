"""Unit tests for Praman semantic UDFs."""
import pytest
from praman_api.engine.udfs import (
    extract_utr,
    norm_indic_vendor,
    jw_sim,
    validate_gstin_checksum,
)


def test_extract_utr():
    # UPI with slash
    assert extract_utr("NEFT-CR-HDFC0000240-SRI BALJI ENT-UPI/632819045112-SETTLEMENT") == "632819045112"
    # RRN directly
    assert extract_utr("UPI-CR-HDFC0000240-RAZORPAY NODAL SETTLEMENT-RRN432910485799") == "432910485799"
    # UTR with colon or dash
    assert extract_utr("RTGS-DR-SBIN0000300-TATA CHEMICALS LTD-INV98210/UTR:991028374612") == "991028374612"
    assert extract_utr("RTGS-DR-SBIN0000300-TATA CHEMICALS LTD-INV98210/UTR-991028374612") == "991028374612"
    # IMPS
    assert extract_utr("IMPS/102938475612/SALARY TRANSFER") == "102938475612"
    # Empty or no match
    assert extract_utr("NO UTR NUMBER PRESENT IN THIS STRING") == ""
    assert extract_utr("") == ""
    assert extract_utr(None) == ""


def test_norm_indic_vendor():
    # Honorifics stripping & abbreviation expansions
    assert norm_indic_vendor("M/s. Sri Balaji Ent Pvt. Ltd.") == "BALAJI ENTERPRISES PRIVATE LIMITED"
    assert norm_indic_vendor("Shri Balaji Trd") == "BALAJI TRADERS"
    assert norm_indic_vendor("Shree Balaji Ind") == "BALAJI INDUSTRIES"
    assert norm_indic_vendor("Sri Balaji Enterprises") == "BALAJI ENTERPRISES"
    assert norm_indic_vendor("Balaji Ent") == "BALAJI ENTERPRISES"
    # Punctuation cleaning
    assert norm_indic_vendor("Tata-Steel, Ltd. (India)") == "TATA STEEL LIMITED INDIA"
    assert norm_indic_vendor("") == ""
    assert norm_indic_vendor(None) == ""


def test_jw_sim():
    # Exact match after normalization
    assert jw_sim("M/s Sri Balaji Ent", "Sri Balaji Enterprises") == 1.0
    # Noisy typo "BALJI" vs "BALAJI"
    sim_noisy = jw_sim("SRI BALJI ENT", "Sri Balaji Enterprises")
    assert sim_noisy > 0.95, f"Expected > 0.95, got {sim_noisy}"
    # Decoy company vs Target
    sim_decoy = jw_sim("Balaji Traders", "Sri Balaji Enterprises")
    assert sim_decoy < 0.90, f"Expected < 0.90, got {sim_decoy}"
    # Empty handling
    assert jw_sim("", "Sri Balaji Enterprises") == 0.0
    assert jw_sim(None, None) == 0.0


def test_validate_gstin_checksum():
    # Valid 15-character GSTINs
    assert validate_gstin_checksum("33AABCS1429B1Z2") is True
    assert validate_gstin_checksum("27AAACC4918D1Z9") is True
    assert validate_gstin_checksum("29AABCA5512E1Z3") is True
    # Invalid GSTINs
    assert validate_gstin_checksum("INVALID_GSTIN") is False
    assert validate_gstin_checksum("33AABCS1429B1Z") is False  # 14 chars
    assert validate_gstin_checksum("33AABCS1429B1Z299") is False # 17 chars
    assert validate_gstin_checksum("") is False
    assert validate_gstin_checksum(None) is False
