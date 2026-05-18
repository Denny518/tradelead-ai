import os
import httpx

HUNTER_API_KEY = os.getenv("HUNTER_API_KEY", "")
HUNTER_URL = "https://api.hunter.io/v2/domain-search"


async def find_emails(domain: str) -> list[dict]:
    """Find email addresses associated with a company domain using Hunter.io."""
    if not HUNTER_API_KEY:
        return _mock_find_emails(domain)

    params = {
        "domain": domain,
        "api_key": HUNTER_API_KEY,
        "limit": 10,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(HUNTER_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    results = []
    for entry in data.get("data", {}).get("emails", []):
        results.append({
            "name": f"{entry.get('first_name', '')} {entry.get('last_name', '')}".strip(),
            "email": entry.get("value") or "",
            "position": entry.get("position") or "",
        })

    return results


def _mock_find_emails(domain: str) -> list[dict]:
    """Return mock email results for testing without Hunter.io key."""
    company_name = domain.replace("www.", "").split(".")[0].title()
    return [
        {
            "name": f"John Smith",
            "email": f"john.smith@{domain.replace('https://', '').replace('http://', '').replace('www.', '')}",
            "position": "Procurement Manager",
        },
        {
            "name": f"Sarah Johnson",
            "email": f"s.johnson@{domain.replace('https://', '').replace('http://', '').replace('www.', '')}",
            "position": "CEO",
        },
    ]
