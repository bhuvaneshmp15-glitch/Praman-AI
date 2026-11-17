"""Razorpay IFSC API integration and validation adapter."""
import httpx


class RazorpayIFSCAdapter:
    BASE_URL = "https://ifsc.razorpay.com"

    async def lookup(self, ifsc: str) -> dict:
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{self.BASE_URL}/{ifsc.upper().strip()}")
                if resp.status_code == 200:
                    return resp.json()
            except Exception:
                pass
        return {"BANK": "UNKNOWN", "IFSC": ifsc, "VALID": False}
