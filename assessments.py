from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Assessment, PesticideMRL, Sample, User
from app.schemas import AssessmentCreate, AssessmentOut

router = APIRouter(prefix="/api/assessments", tags=["Residue assessments"])

@router.get("", response_model=list[AssessmentOut])
def list_assessments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    query = db.query(Assessment)
    if user.role != "admin":
        query = query.filter(Assessment.created_by_id == user.id)
    return query.order_by(Assessment.created_at.desc()).all()

@router.post("", response_model=AssessmentOut, status_code=201)
def create_assessment(payload: AssessmentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sample = db.query(Sample).filter(Sample.id == payload.sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    if user.role != "admin" and sample.created_by_id != user.id:
        raise HTTPException(status_code=403, detail="You cannot assess another user's sample")

    mrl = db.query(PesticideMRL).filter(
        PesticideMRL.commodity.ilike(sample.commodity),
        PesticideMRL.pesticide_name.ilike(payload.pesticide_name),
        PesticideMRL.unit.ilike(payload.unit)
    ).first()

    if mrl is None:
        status_value, mrl_value, mrl_id = "NO_MRL_FOUND", None, None
    else:
        status_value = "WITHIN_MRL" if payload.measured_value <= mrl.mrl_value else "ABOVE_MRL"
        mrl_value, mrl_id = mrl.mrl_value, mrl.id

    result = Assessment(
        sample_id=sample.id,
        pesticide_name=payload.pesticide_name.strip(),
        measured_value=payload.measured_value,
        unit=payload.unit,
        mrl_id=mrl_id,
        mrl_value=mrl_value,
        status=status_value,
        created_by_id=user.id
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
