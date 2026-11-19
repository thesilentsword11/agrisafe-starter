from datetime import datetime, timezone
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class Sample(Base):
    __tablename__ = "samples"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sample_code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    commodity: Mapped[str] = mapped_column(String(120), index=True)
    variety: Mapped[str | None] = mapped_column(String(120), nullable=True)
    origin: Mapped[str | None] = mapped_column(String(180), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    created_by = relationship("User")

class PesticideMRL(Base):
    __tablename__ = "pesticide_mrls"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    pesticide_name: Mapped[str] = mapped_column(String(120), index=True)
    commodity: Mapped[str] = mapped_column(String(120), index=True)
    mrl_value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30), default="mg/kg")
    source_name: Mapped[str] = mapped_column(String(180))
    source_reference: Mapped[str | None] = mapped_column(String(500), nullable=True)
    effective_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    source_checked_on: Mapped[str | None] = mapped_column(String(30), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sample_id: Mapped[int] = mapped_column(ForeignKey("samples.id"), index=True)
    pesticide_name: Mapped[str] = mapped_column(String(120))
    measured_value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30), default="mg/kg")
    mrl_id: Mapped[int | None] = mapped_column(ForeignKey("pesticide_mrls.id"), nullable=True)
    mrl_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(30))
    created_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    sample = relationship("Sample")
    mrl = relationship("PesticideMRL")
    created_by = relationship("User")
