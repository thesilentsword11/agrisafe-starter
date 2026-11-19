from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Sample, User
from app.schemas import SampleCreate, SampleOut

router = APIRouter(prefix="/api/samples", tags=["Samples"])

@router.get("", response_model=list[SampleOut])
def list_samples(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Sample)
    if user.role != "admin":
        query = query.filter(Sample.created_by_id == user.id)
    return query.order_by(Sample.created_at.desc()).all()

@router.post("", response_model=SampleOut, status_code=201)
def create_sample(payload: SampleCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if db.query(Sample).filter(Sample.sample_code == payload.sample_code).first():
        raise HTTPException(status_code=409, detail="Sample code already exists")
    sample = Sample(**payload.model_dump(), created_by_id=user.id)
    db.add(sample)
    db.commit()
    db.refresh(sample)
    return sample
