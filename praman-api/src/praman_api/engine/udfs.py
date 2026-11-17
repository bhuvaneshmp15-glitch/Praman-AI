"""Praman Financial Copilot - Semantic UDF Engine.
Pure, deterministic Python functions for unstructured Indian banking narrations and fuzzy reconciliation.
"""
import re
from rapidfuzz.distance import JaroWinkler

# Regex for extracting 12-digit Indian UTR / RRN / IMPS references from bank narrations
UTR_REGEX = re.compile(
    r'(?:UPI/|UTR[-/:]?|IMPS[-/:]?|RRN[-/:]?)([0-9]{12})',
    re.IGNORECASE
)

# Indian GSTIN format: 2-digit state code, 10-char PAN, 1-char entity number, 'Z', 1 checksum char
GSTIN_REGEX = re.compile(
    r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
)

# Honorifics frequently prepended to Indian SME firm names
HONORIFICS_REGEX = re.compile(
    r'\bM\s*/\s*S\.?\b|\bMS\.?\b|\bSHRI\.?\b|\bSRI\.?\b|\bSHREE\.?\b',
    re.IGNORECASE
)

# Punctuation to clean out
PUNCTUATION_REGEX = re.compile(r'[\.,\-_/&()\[\]{}*#@!:\'\"]+')

# Standard abbreviations in Indian enterprise & SME ledgers
EXPANSION_DICT = {
    "ENT": "ENTERPRISES",
    "ENTERPRISE": "ENTERPRISES",
    "PVT": "PRIVATE",
    "LTD": "LIMITED",
    "TRD": "TRADERS",
    "TRAD": "TRADERS",
    "TRADING": "TRADERS",
    "IND": "INDUSTRIES",
    "INDUSTRY": "INDUSTRIES",
    "CORP": "CORPORATION",
    "CO": "COMPANY",
}


def extract_utr(text: str) -> str:
    """Extracts the exact 12-digit RRN/UTR from noisy Indian bank narrations.
    
    Returns "" if not found.
    """
    if not text:
        return ""
    m = UTR_REGEX.search(str(text))
    return m.group(1) if m else ""


def norm_indic_vendor(name: str) -> str:
    """Uppercases, strips honorifics (M/S, SHRI, SRI, SHREE), expands common Indian SME abbreviations
    (ENT -> ENTERPRISES, PVT LTD -> PRIVATE LIMITED, TRD -> TRADERS, IND -> INDUSTRIES),
    and removes punctuation.
    """
    if not name:
        return ""
    s = str(name).upper().strip()
    # Strip honorifics (e.g. M/s, Shri, Sri, Shree)
    s = HONORIFICS_REGEX.sub(" ", s)
    # Remove punctuation characters
    s = PUNCTUATION_REGEX.sub(" ", s)
    tokens = s.split()
    # Expand tokens
    expanded = [EXPANSION_DICT.get(t, t) for t in tokens]
    return " ".join(expanded).strip()


def jw_sim(s1: str, s2: str) -> float:
    """Computes Jaro-Winkler similarity (0.0 to 1.0) on norm_indic_vendor(s1) and norm_indic_vendor(s2)."""
    n1 = norm_indic_vendor(s1)
    n2 = norm_indic_vendor(s2)
    if not n1 or not n2:
        return 0.0
    return float(JaroWinkler.similarity(n1, n2))


def validate_gstin_checksum(gstin: str) -> bool:
    """Validates the 15-character Indian GSTIN format."""
    if not gstin:
        return False
    return bool(GSTIN_REGEX.match(str(gstin).strip()))
