from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models import PesticideMRL, User
from app.schemas import MRLCreate, MRLOut

router = APIRouter(prefix="/api/mrls", tags=["Pesticide MRL records"])

@router.get("", response_model=list[MRLOut])
def list_mrls(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(PesticideMRL).order_by(PesticideMRL.commodity, PesticideMRL.pesticide_name).all()

@router.post("", response_model=MRLOut, status_code=201)
def create_mrl(payload: MRLCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    record = PesticideMRL(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
