from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# MongoDB and Secret Key
from config.db import db

# Logging
import logging

from bson import ObjectId
from datetime import timedelta, datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class UserUpdate(BaseModel):
    username: str = None
    email: str = None
    age: int = None
    img_path: str = None
    gender: str = None

class UserDelete(BaseModel):
    id: str


# All Users
@router.get("/all")
async def get_all_users():
    try:
        # Fetch all users
        users_cursor = db["users"].find({"role": "user"})
        users = []
        for user in users_cursor:
            users.append({
                "id": str(user["_id"]),
                "username": user["username"],
                "age": user.get("age"),
                "email": user["email"],
                "img_path": user.get("img_path"),
                "gender": user.get("gender"),
                "role": user["role"],
                "created_at": str(user.get("created_at", ""))
            })

        return JSONResponse(status_code=200, content={"users": users})
    
    except Exception as e:
        logger.error(f"Error fetching all users: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching users")

# Update User
@router.put("/user/update/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate):
    try:
        # Check if user exists
        existing_user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Prepare the updated fields
        update_fields = {key: value for key, value in user_data.dict().items() if value is not None}
        
        if update_fields:
            # Update the user in the database
            db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": update_fields})
            return JSONResponse(status_code=200, content={"message": "User updated successfully"})
        else:
            return JSONResponse(status_code=400, content={"message": "No valid fields to update"})

    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating user")

# Delete User
@router.delete("/user/delete/{user_id}")
async def delete_user(user_id: str):
    try:
        # Check if user exists
        existing_user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete the user from the database
        db["users"].delete_one({"_id": ObjectId(user_id)})
        return JSONResponse(status_code=200, content={"message": "User deleted successfully"})
    
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting user")

# User Statistics
@router.get("/stats/charts")
async def get_user_stats():
    try:
        # Area Chart
        tests_data = {
            "colorblindness_tests": db["colorblindness_tests"].count_documents({}),
            "eye_test_sessions": db["eye_test_sessions"].count_documents({}),
            "eye_scans": db["eye_scans"].count_documents({})
        }

        # Pie Chart (Gender Distribution)
        gender_distribution = {
            "male": db["users"].count_documents({"gender": "male"}),
            "female": db["users"].count_documents({"gender": "female"})
        }

        # Line Chart (Users per month)
        pipeline = [
            {"$match": {"created_at": {"$exists": True, "$ne": None}}},
            {
                "$addFields": {
                    "created_at_date": {"$dateFromString": {"dateString": "$created_at"}}
                }
            },
            {
                "$project": {
                    "month": {"$dateToString": {"format": "%Y-%m", "date": "$created_at_date"}}
                }
            },
            {"$group": {"_id": "$month", "user_count": {"$sum": 1}}},
            {"$sort": {"_id": 1}}
        ]
        
        monthly_user_count = list(db["users"].aggregate(pipeline))
        monthly_data = [{"month": record["_id"], "user_count": record["user_count"]} for record in monthly_user_count]

        return JSONResponse(content={
            "area_chart": tests_data,
            "pie_chart": gender_distribution,
            "line_chart": monthly_data
        })
    
    except Exception as e:
        logger.error(f"Error getting stats for charts: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching stats for charts")


    try:
        # Check if user exists
        existing_user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete the user from the database
        db["users"].delete_one({"_id": ObjectId(user_id)})
        return JSONResponse(status_code=200, content={"message": "User deleted successfully"})
    
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting user")