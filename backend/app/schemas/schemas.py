from __future__ import annotations

import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── Search ──────────────────────────────────────────────────────────
class SearchRequest(BaseModel):
    product: str = Field(..., description="产品名称")
    market: str = Field(default="United States", description="目标市场")
    industry: str = Field(default="", description="行业")
    limit: int = Field(default=10, ge=1, le=50, description="搜索数量")


class SearchResultItem(BaseModel):
    company_name: str
    website: str
    description: str
    match_score: int = 0


class SearchResponse(BaseModel):
    success: bool = True
    data: list[SearchResultItem] = []
    count: int = 0


# ── Find Email ──────────────────────────────────────────────────────
class FindEmailRequest(BaseModel):
    company_domain: str = Field(..., description="公司域名")


class FindEmailItem(BaseModel):
    name: str
    email: str
    position: str = ""


class FindEmailResponse(BaseModel):
    success: bool = True
    data: list[FindEmailItem] = []


# ── Generate Email ──────────────────────────────────────────────────
class ProductInfo(BaseModel):
    name: str = ""
    description: str = ""
    advantages: list[str] = []


class CustomerInfo(BaseModel):
    company_name: str = ""
    website: str = ""
    description: str = ""
    contact_name: str = ""


class GenerateEmailRequest(BaseModel):
    product_info: ProductInfo = Field(default_factory=ProductInfo)
    customer_info: CustomerInfo = Field(default_factory=CustomerInfo)
    email_type: str = Field(default="initial", description="initial/followup1/followup2/followup3")


class EmailVersion(BaseModel):
    subject: str
    content: str


class GenerateEmailResponse(BaseModel):
    success: bool = True
    data: dict[str, EmailVersion] = {}


# ── CRM ─────────────────────────────────────────────────────────────
class CustomerCreate(BaseModel):
    company_name: str
    website: str = ""
    description: str = ""
    contact_name: str = ""
    email: str = ""
    position: str = ""
    match_score: int = 0
    status: str = "new"
    note: str = ""


class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    position: Optional[str] = None
    match_score: Optional[int] = None
    status: Optional[str] = None
    note: Optional[str] = None


class CustomerOut(BaseModel):
    id: int
    user_id: str
    company_name: str
    website: Optional[str] = ""
    description: Optional[str] = ""
    contact_name: Optional[str] = ""
    email: Optional[str] = ""
    position: Optional[str] = ""
    match_score: Optional[int] = 0
    status: str = "new"
    note: Optional[str] = ""
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class CustomerListResponse(BaseModel):
    success: bool = True
    data: list[CustomerOut] = []
    count: int = 0


class EmailHistoryOut(BaseModel):
    id: int
    customer_id: int
    subject: str
    content: str
    version: Optional[int] = None
    email_type: Optional[str] = None
    sent_at: Optional[datetime.datetime] = None
    created_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class EmailHistoryResponse(BaseModel):
    success: bool = True
    data: list[EmailHistoryOut] = []
