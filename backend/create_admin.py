from getpass import getpass
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models import User
from app.security import hash_password

def main():
    Base.metadata.create_all(bind=engine)
    email = input("Admin email: ").strip().lower()
    full_name = input("Admin full name: ").strip()
    password = getpass("Admin password (minimum 8 characters): ")
    if len(password) < 8:
        raise SystemExit("Password must contain at least 8 characters.")
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            raise SystemExit("That email is already registered. No changes made.")
        admin = User(email=email, full_name=full_name,
                     hashed_password=hash_password(password), role="admin")
        db.add(admin)
        db.commit()
        print("Admin account created successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
