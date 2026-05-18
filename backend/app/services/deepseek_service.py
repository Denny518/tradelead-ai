import json
import os
import re

from openai import OpenAI

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = "https://api.deepseek.com"


def _get_client() -> OpenAI:
    return OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)


SYSTEM_PROMPT = """You are a professional B2B cold email copywriter specializing in high-response-rate personalized outreach emails for international trade.

## Task
Generate 3 versions of a personalized cold email based on the product info and customer info provided.

## Requirements
1. Each version MUST be personalized — mention the recipient's company by name and reference their specific business
2. Subject lines must be compelling to increase open rates (avoid spam trigger words)
3. Content must be concise, under 150 words
4. Each version must have a clear CTA (call to action), e.g.:
   - "Reply to this email and I'll send you our product catalog"
   - "Do you have 15 minutes for a quick call this week?"
   - "Can I send you a case study?"
5. Tone: professional but not stiff, friendly but not overly familiar

## Output Format
Return ONLY valid JSON, no other text:
{
  "version1": {
    "subject": "subject line (formal version)",
    "content": "email body (formal version)"
  },
  "version2": {
    "subject": "subject line (concise version)",
    "content": "email body (concise version, suitable for busy executives)"
  },
  "version3": {
    "subject": "subject line (story-based version)",
    "content": "email body (story-based version, use case study or data to engage)"
  }
}"""


def generate_emails(
    product_info: dict,
    customer_info: dict,
    email_type: str = "initial",
) -> dict:
    """Generate 3 versions of personalized cold emails using DeepSeek API."""
    if not DEEPSEEK_API_KEY:
        return _mock_generate(product_info, customer_info, email_type)

    user_prompt = _build_prompt(product_info, customer_info, email_type)

    client = _get_client()
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.8,
        max_tokens=2000,
    )

    content = response.choices[0].message.content.strip()

    # Try to extract JSON from response
    json_match = re.search(r"\{[\s\S]*\}", content)
    if json_match:
        return json.loads(json_match.group(0))

    # Fallback
    return _mock_generate(product_info, customer_info, email_type)


def _build_prompt(product_info: dict, customer_info: dict, email_type: str) -> str:
    adv_list = "\n".join(f"  - {a}" for a in product_info.get("advantages", []))
    product_str = f"""- Product Name: {product_info.get('name', '')}
- Description: {product_info.get('description', '')}
- Advantages:
{adv_list}"""

    customer_str = f"""- Company: {customer_info.get('company_name', '')}
- Website: {customer_info.get('website', '')}
- Business: {customer_info.get('description', '')}
- Contact: {customer_info.get('contact_name', '')}"""

    type_desc = {
        "initial": "first cold outreach email",
        "followup1": "first follow-up email (3 days after initial)",
        "followup2": "second follow-up email (7 days after initial)",
        "followup3": "third follow-up email (14 days after initial)",
    }

    return f"""## Product Info
{product_str}

## Customer Info
{customer_str}

## Email Type
{type_desc.get(email_type, email_type)}

Generate 3 versions of a personalized {type_desc.get(email_type, email_type)}. Return JSON only."""


def _mock_generate(product_info: dict, customer_info: dict, email_type: str) -> dict:
    """Generate mock emails for testing without DeepSeek key."""
    company = customer_info.get("company_name", "your company")
    contact = customer_info.get("contact_name", "there")
    product = product_info.get("name", "our product")
    desc = product_info.get("description", "high-quality products")

    return {
        "version1": {
            "subject": f"Partnership opportunity: {product} for {company}",
            "content": f"Dear {contact},\n\nI hope this email finds you well. I came across {company} while researching top companies in the industry, and I was impressed by your market presence.\n\nWe specialize in {desc}. Our {product} offers significant advantages including competitive pricing, 2-year warranty, and fast shipping.\n\nI'd love to explore how {product} could add value to {company}'s product lineup. Would you be open to a brief 15-minute call next week?\n\nBest regards,\n[Your name]\n[Your company]",
        },
        "version2": {
            "subject": f"Quick question about {company}'s product sourcing",
            "content": f"Hi {contact},\n\nI'm with a company that provides {desc}.\n\nI noticed {company} is a key player in the market, and I thought you might be interested in our {product} — it delivers better margins while reducing energy costs by 30%.\n\nCan I send over a 1-page comparison sheet?\n\nThanks,\n[Your name]",
        },
        "version3": {
            "subject": f"How we helped a distributor increase margins by 25%",
            "content": f"Hi {contact},\n\nLast quarter, we helped a distributor similar to {company} switch to our {product}. The result? Their margins improved by 25% and their customers reported higher satisfaction with the energy savings.\n\nI'm wondering if {company} might be looking for similar improvements in your product lineup.\n\nOur {product} could help you achieve comparable results. Would you be open to seeing a brief case study?\n\nBest,\n[Your name]\n[Your company]",
        },
    }
