from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if demo user exists
    demo_email = "test@demo.com"
    user = db.query(User).filter(User.email == demo_email).first()
    
    if not user:
        print("Creating demo user...")
        demo_user = User(
            username="demo",
            email=demo_email,
            hashed_password=get_password_hash("password123")
        )
        db.add(demo_user)
        db.commit()
        print("Demo user created: test@demo.com / password123")
    else:
        print("Demo user already exists.")
        # Update password just in case we changed the hashing algorithm
        user.hashed_password = get_password_hash("password123")
        db.commit()
        print("Updated demo user password with new hashing scheme.")
        
    db.close()

if __name__ == "__main__":
    seed()
