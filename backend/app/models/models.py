import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    company_name = Column(String)
    product_info = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customers = relationship("Customer", back_populates="user")
    emails = relationship("Email", back_populates="user")
    searches = relationship("SearchHistory", back_populates="user")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=False)
    website = Column(String)
    description = Column(Text)
    contact_name = Column(String)
    email = Column(String)
    position = Column(String)
    match_score = Column(Integer)
    status = Column(String, default="new")  # new/sent/replied/quoted/won/lost
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="customers")
    emails = relationship("Email", back_populates="customer")


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, autoincrement=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    version = Column(Integer)  # 1/2/3
    email_type = Column(String)  # initial/followup1/followup2/followup3
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="emails")
    user = relationship("User", back_populates="emails")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    query = Column(String, nullable=False)
    product = Column(String)
    market = Column(String)
    industry = Column(String)
    results_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="searches")
