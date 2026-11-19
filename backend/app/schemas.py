from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class RegisterIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class SampleCreate(BaseModel):
    sample_code: str = Field(min_length=2, max_length=40)
    commodity: str = Field(min_length=2, max_length=120)
    variety: str | None = None
    origin: str | None = None
    notes: str | None = None

class SampleOut(BaseModel):
    id: int
    sample_code: str
    commodity: str
    variety: str | None
    origin: str | None
    notes: str | None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class MRLCreate(BaseModel):
    pesticide_name: str = Field(min_length=2, max_length=120)
    commodity: str = Field(min_length=2, max_length=120)
    mrl_value: float = Field(ge=0)
    unit: str = "mg/kg"
    source_name: str = Field(min_length=2, max_length=180)
    source_reference: str | None = None
    effective_date: str | None = None
    source_checked_on: str | None = None
    notes: str | None = None

class MRLOut(MRLCreate):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AssessmentCreate(BaseModel):
    sample_id: int
    pesticide_name: str = Field(min_length=2, max_length=120)
    measured_value: float = Field(ge=0)
    unit: str = "mg/kg"

class AssessmentOut(BaseModel):
    id: int
    sample_id: int
    pesticide_name: str
    measured_value: float
    unit: str
    mrl_value: float | None
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
