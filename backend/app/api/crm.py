import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.models import Customer, Email as EmailModel
from app.schemas.schemas import (
    CustomerCreate,
    CustomerUpdate,
    CustomerOut,
    CustomerListResponse,
)

router = APIRouter(prefix="/api", tags=["crm"])
PLACEHOLDER_USER_ID = "demo-user-001"


@router.get("/customers", response_model=CustomerListResponse)
async def list_customers(
    status: str = Query(default="", description="Filter by status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Customer).filter(Customer.user_id == PLACEHOLDER_USER_ID)
    if status:
        query = query.filter(Customer.status == status)
    query = query.order_by(Customer.updated_at.desc())

    total = query.count()
    customers = query.offset(offset).limit(limit).all()

    return CustomerListResponse(
        success=True,
        data=[CustomerOut.model_validate(c) for c in customers],
        count=total,
    )


@router.post("/customers", response_model=CustomerOut)
async def create_customer(req: CustomerCreate, db: Session = Depends(get_db)):
    customer = Customer(
        user_id=PLACEHOLDER_USER_ID,
        **req.model_dump(),
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerOut.model_validate(customer)


@router.put("/customers/{customer_id}", response_model=CustomerOut)
async def update_customer(customer_id: int, req: CustomerUpdate, db: Session = Depends(get_db)):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.user_id == PLACEHOLDER_USER_ID)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)
    customer.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(customer)
    return CustomerOut.model_validate(customer)


@router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.user_id == PLACEHOLDER_USER_ID)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()
    return {"success": True, "message": "Customer deleted"}


@router.get("/customers/export-csv")
async def export_customers_csv(
    status: str = Query(default=""),
    db: Session = Depends(get_db),
):
    query = db.query(Customer).filter(Customer.user_id == PLACEHOLDER_USER_ID)
    if status:
        query = query.filter(Customer.status == status)
    customers = query.order_by(Customer.updated_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Company Name", "Website", "Description", "Contact Name",
        "Email", "Position", "Match Score", "Status", "Note",
        "Created At", "Updated At",
    ])
    for c in customers:
        writer.writerow([
            c.id, c.company_name, c.website, c.description, c.contact_name,
            c.email, c.position, c.match_score, c.status, c.note,
            c.created_at.isoformat() if c.created_at else "",
            c.updated_at.isoformat() if c.updated_at else "",
        ])

    output.seek(0)
    filename = f"customers_export_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/customers/{customer_id}/save-email")
async def save_email_to_customer(
    customer_id: int,
    subject: str = "",
    content: str = "",
    version: int = 1,
    email_type: str = "initial",
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id, Customer.user_id == PLACEHOLDER_USER_ID)
        .first()
    )
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    email_record = EmailModel(
        customer_id=customer_id,
        user_id=PLACEHOLDER_USER_ID,
        subject=subject,
        content=content,
        version=version,
        email_type=email_type,
        sent_at=datetime.utcnow(),
    )
    db.add(email_record)

    # Update customer status to "sent" if currently "new"
    if customer.status == "new":
        customer.status = "sent"
        customer.updated_at = datetime.utcnow()

    db.commit()
    return {"success": True, "message": "Email saved and status updated"}
