from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Email as EmailModel
from app.schemas.schemas import (
    FindEmailRequest,
    FindEmailResponse,
    GenerateEmailRequest,
    GenerateEmailResponse,
)
from app.services.hunter_service import find_emails
from app.services.deepseek_service import generate_emails

router = APIRouter(prefix="/api", tags=["email"])
PLACEHOLDER_USER_ID = "demo-user-001"


@router.post("/find-email", response_model=FindEmailResponse)
async def find_email_endpoint(req: FindEmailRequest):
    results = await find_emails(req.company_domain)
    return FindEmailResponse(success=True, data=results)


@router.post("/generate-email", response_model=GenerateEmailResponse)
async def generate_email_endpoint(req: GenerateEmailRequest, db: Session = Depends(get_db)):
    result = generate_emails(
        product_info=req.product_info.model_dump(),
        customer_info=req.customer_info.model_dump(),
        email_type=req.email_type,
    )

    # Save generated emails to DB if customer_id is known
    # For now, they're returned directly

    return GenerateEmailResponse(success=True, data=result)


@router.get("/api/emails/{customer_id}")
async def get_emails_for_customer(customer_id: int, db: Session = Depends(get_db)):
    emails = (
        db.query(EmailModel)
        .filter(EmailModel.customer_id == customer_id)
        .order_by(EmailModel.created_at.desc())
        .all()
    )
    return {
        "success": True,
        "data": [
            {
                "id": e.id,
                "customer_id": e.customer_id,
                "subject": e.subject,
                "content": e.content,
                "version": e.version,
                "email_type": e.email_type,
                "sent_at": e.sent_at.isoformat() if e.sent_at else None,
                "created_at": e.created_at.isoformat() if e.created_at else None,
            }
            for e in emails
        ],
    }
