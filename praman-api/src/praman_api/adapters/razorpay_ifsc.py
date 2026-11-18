"""Praman Financial Copilot - Razorpay IFSC Adapter.
Provides real-time RBI master lookup and payment routing header generation with resilient offline fallback.
"""
from typing import Dict, Any
from praman_api.adapters.public_apis import verify_ifsc_live, IFSC_FALLBACK_CACHE

# Backwards compatible alias
IFSC_FALLBACK_REGISTRY = IFSC_FALLBACK_CACHE


class RazorpayIFSCAdapter:
    """Adapter for IFSC lookup and banking route resolution."""
    BASE_URL = "https://ifsc.razorpay.com"

    async def lookup(self, ifsc: str) -> Dict[str, Any]:
        """Asynchronous lookup against Razorpay IFSC API with fallback."""
        return verify_ifsc_live(ifsc)

    def lookup_sync(self, ifsc: str) -> Dict[str, Any]:
        """Synchronous lookup against Razorpay IFSC API with fallback."""
        return verify_ifsc_live(ifsc)

    def _fallback_or_default(self, code: str) -> Dict[str, Any]:
        if code in IFSC_FALLBACK_REGISTRY:
            reg = IFSC_FALLBACK_REGISTRY[code].copy()
            reg["valid"] = True
            return reg

        is_valid_format = len(code) == 11 and code[:4].isalpha() and code[4] == '0'
        return {
            "BANK": "INDIAN_COMMERCIAL_BANK",
            "IFSC": code,
            "BRANCH": "COMMERCIAL_BRANCH",
            "CENTRE": "INDIA",
            "STATE": "INDIA",
            "valid": is_valid_format,
            "RTGS": True,
            "NEFT": True,
            "IMPS": True,
            "UPI": True,
            "source": "format_validation"
        }

    def generate_routing_headers(self, ifsc: str) -> Dict[str, Any]:
        """Generates bank routing headers for payment orders and settlement dispatches."""
        info = self.lookup_sync(ifsc)
        return {
            "X-Praman-Bank-Name": info.get("BANK", "UNKNOWN_BANK"),
            "X-Praman-Branch": info.get("BRANCH", "MAIN_BRANCH"),
            "X-Praman-City": info.get("CENTRE", "INDIA"),
            "X-Praman-State": info.get("STATE", "INDIA"),
            "X-Praman-RTGS-Capable": str(info.get("RTGS", True)).upper(),
            "X-Praman-NEFT-Capable": str(info.get("NEFT", True)).upper(),
            "X-Praman-IFSC": ifsc.strip().upper()
        }


razorpay_ifsc_adapter = RazorpayIFSCAdapter()
