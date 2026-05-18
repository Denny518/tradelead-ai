import os
import httpx

SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
SERPAPI_URL = "https://serpapi.com/search.json"


async def search_customers(product: str, market: str, industry: str = "", limit: int = 10) -> list[dict]:
    """Search for potential customers using SerpAPI (Google search)."""
    if not SERPAPI_KEY:
        return _mock_search(product, market, industry, limit)

    query = f'"{product}" distributor OR importer OR wholesaler in {market} {industry}'
    params = {
        "engine": "google",
        "q": query.strip(),
        "api_key": SERPAPI_KEY,
        "num": min(limit, 50),
        "gl": "us",
        "hl": "en",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(SERPAPI_URL, params=params)
        resp.raise_for_status()
        data = resp.json()

    results = []
    for item in data.get("organic_results", [])[:limit]:
        results.append({
            "company_name": _extract_company_name(item.get("title", "")),
            "website": item.get("link", ""),
            "description": item.get("snippet", ""),
            "match_score": _score_match(item.get("snippet", ""), product),
        })

    return results


def _extract_company_name(title: str) -> str:
    """Extract company name from search result title."""
    for sep in [" - ", " | ", " – ", " · "]:
        if sep in title:
            return title.split(sep)[0].strip()
    return title.strip()


def _score_match(snippet: str, product: str) -> int:
    """Score how well a search result matches the product."""
    score = 50
    keywords = product.lower().split()
    snippet_lower = snippet.lower()
    for kw in keywords:
        if kw in snippet_lower:
            score += 10
    if "distributor" in snippet_lower or "wholesaler" in snippet_lower or "importer" in snippet_lower:
        score += 15
    return min(score, 99)


def _mock_search(product: str, market: str, industry: str = "", limit: int = 10) -> list[dict]:
    """Return mock results for testing without SerpAPI key."""
    companies = {
        "LED显示屏": [
            ("ABC Displays Inc.", "https://www.abcleddisplays.com", "Leading LED display distributor in the US, specializing in outdoor advertising screens and stadium displays."),
            ("Digital Signage Pro", "https://www.digitalsignagepro.com", "Full-service digital signage company offering LED video walls for retail and corporate clients."),
            ("BrightView LED Solutions", "https://www.brightviewled.com", "Importer and distributor of commercial-grade LED display panels for events and exhibitions."),
            ("Pixel Perfect Displays", "https://www.pixelperfectdisplays.com", "Wholesale LED screen supplier serving the North American market since 2010."),
            ("Sunset Visual Technologies", "https://www.sunsetvisual.com", "Custom LED display solutions for entertainment venues, churches, and sports facilities."),
            ("Metro Digital Boards", "https://www.metrodigitalboards.com", "NYC-based distributor of indoor and outdoor LED advertising screens."),
            ("Coastal Signage Systems", "https://www.coastalsignage.com", "West coast importer of energy-efficient LED displays with installation services."),
            ("Premier AV Solutions", "https://www.premieravsolutions.com", "Audiovisual integrator specializing in large-format LED display installations."),
            ("TechVision Displays", "https://www.techvisiondisplays.com", "Distributor of cutting-edge fine-pitch LED displays for corporate environments."),
            ("Global Sign Importers", "https://www.globalsignimporters.com", "Direct importer of LED modules and complete display systems from Asia."),
        ],
        "default": [
            ("Acme Trading Co.", "https://www.acmetrading.com", f"Established distributor of {product} in {market}, serving wholesale and retail channels."),
            ("Global Import Solutions", "https://www.globalimportsolutions.com", f"Specialized importer of {product} with strong presence across {market}."),
            ("Premier Distribution Inc.", "https://www.premierdistribution.com", f"Top-tier distributor of {product} and related products in {market}."),
            ("Market Leader Wholesale", "https://www.marketleaderwholesale.com", f"Leading wholesale supplier of {product} with extensive inventory in {market}."),
            ("First Choice Imports", "https://www.firstchoiceimports.com", f"Reliable source for {product} serving {market} businesses since 1998."),
            ("Direct Source Trading", "https://www.directsourcetrading.com", f"Direct importer and B2B supplier of {product} across {market}."),
            ("ProSupply Group", "https://www.prosupplygroup.com", f"Professional distributor offering {product} with competitive pricing and fast shipping."),
            ("Alliance Trade Partners", "https://www.alliancetradepartners.com", f"Strategic trade partner for {product} distribution in the {market} region."),
        ],
    }

    if product in companies:
        source = companies[product]
    else:
        source = companies["default"]

    results = []
    for i, item in enumerate(source[:limit]):
        results.append({
            "company_name": item[0],
            "website": item[1],
            "description": item[2],
            "match_score": 88 - i * 3,
        })
    return results
