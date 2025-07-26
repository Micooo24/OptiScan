from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from collections import defaultdict
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

class UserTestResult(BaseModel):
    email: str
    test_type: str
    result: str
    date: datetime

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

# User Charts
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



# Dashboard Data
@router.get("/stats/dashboard")
async def get_dashboard_stats():
    try:
        # 1. Get total number of users (excluding admin/other roles)
        total_users = db["users"].count_documents({"role": "user"})

        # 2. Get total number of tests across all collections
        colorblindness_tests_count = db["colorblindness_tests"].count_documents({})
        eye_test_sessions_count = db["eye_test_sessions"].count_documents({})
        eye_scans_count = db["eye_scans"].count_documents({})
        total_tests = colorblindness_tests_count + eye_test_sessions_count + eye_scans_count

        # 3. Count users with possible diseases (non-normal results)
        users_with_disease = set()
        
        # From colorblindness tests - users with non-normal suspected_type
        colorblind_users = db["colorblindness_tests"].find(
            {"suspected_type": {"$ne": "normal"}}, 
            {"user_id": 1}
        )
        for test in colorblind_users:
            users_with_disease.add(str(test["user_id"]))

        # From eye test sessions - users with non-normal final_status
        eye_test_users = db["eye_test_sessions"].find(
            {"final_status": {"$ne": "NORMAL"}}, 
            {"user_id": 1}
        )
        for session in eye_test_users:
            if "user_id" in session:
                users_with_disease.add(str(session["user_id"]))

        # From eye scans - users with non-normal conditions in either eye
        eye_scan_users = db["eye_scans"].find({
            "$or": [
                {"left_eye_analysis.condition": {"$ne": "NORMAL"}},
                {"right_eye_analysis.condition": {"$ne": "NORMAL"}}
            ]
        }, {"user_id": 1})
        for scan in eye_scan_users:
            users_with_disease.add(str(scan["user_id"]))

        users_with_disease_count = len(users_with_disease)

        # 4. Calculate average confidence across all tests
        confidence_scores = []
        
        # Colorblindness test confidences
        colorblind_confidences = db["colorblindness_tests"].find({}, {"confidence": 1})
        for test in colorblind_confidences:
            if "confidence" in test and test["confidence"] is not None:
                confidence_scores.append(test["confidence"])

        # Eye test session confidences
        eye_session_confidences = db["eye_test_sessions"].find({}, {"confidence": 1})
        for session in eye_session_confidences:
            if "confidence" in session and session["confidence"] is not None:
                confidence_scores.append(session["confidence"])

        # Eye scan confidences (average of left and right eye)
        eye_scan_confidences = db["eye_scans"].find({}, {
            "left_eye_analysis.confidence": 1, 
            "right_eye_analysis.confidence": 1
        })
        for scan in eye_scan_confidences:
            left_conf = scan.get("left_eye_analysis", {}).get("confidence")
            right_conf = scan.get("right_eye_analysis", {}).get("confidence")
            
            scan_confidences = []
            if left_conf is not None:
                scan_confidences.append(left_conf)
            if right_conf is not None:
                scan_confidences.append(right_conf)
            
            if scan_confidences:
                # Average confidence for this scan
                avg_scan_confidence = sum(scan_confidences) / len(scan_confidences)
                confidence_scores.append(avg_scan_confidence)

        # Calculate overall average confidence
        average_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0

        # Additional breakdown for more detailed insights
        test_breakdown = {
            "colorblindness_tests": colorblindness_tests_count,
            "eye_test_sessions": eye_test_sessions_count,
            "eye_scans": eye_scans_count
        }

        # Disease distribution by test type
        disease_breakdown = {
            "colorblindness_abnormal": db["colorblindness_tests"].count_documents({"suspected_type": {"$ne": "normal"}}),
            "eye_tracking_abnormal": db["eye_test_sessions"].count_documents({"final_status": {"$ne": "NORMAL"}}),
            "eye_scan_abnormal": db["eye_scans"].count_documents({
                "$or": [
                    {"left_eye_analysis.condition": {"$ne": "NORMAL"}},
                    {"right_eye_analysis.condition": {"$ne": "NORMAL"}}
                ]
            }),
            "total_abnormal_tests": (
                db["colorblindness_tests"].count_documents({"suspected_type": {"$ne": "normal"}}) +
                db["eye_test_sessions"].count_documents({"final_status": {"$ne": "NORMAL"}}) +
                db["eye_scans"].count_documents({
                    "$or": [
                        {"left_eye_analysis.condition": {"$ne": "NORMAL"}},
                        {"right_eye_analysis.condition": {"$ne": "NORMAL"}}
                    ]
                })
            )
        }

        return JSONResponse(content={
            "total_users": total_users,
            "total_tests": total_tests,
            "users_with_possible_disease": disease_breakdown["total_abnormal_tests"],
            "average_confidence": round(average_confidence, 2),
            "test_breakdown": test_breakdown,
            "disease_breakdown": disease_breakdown,
            "health_percentage": round(((total_users - users_with_disease_count) / total_users * 100), 2) if total_users > 0 else 0,
            "disease_percentage": round((users_with_disease_count / total_users * 100), 2) if total_users > 0 else 0
        })

    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching dashboard statistics")

async def get_user_email(user_id: ObjectId) -> str:
    user = db["users"].find_one({"_id": user_id})
    if user:
        return user.get("email", "N/A")
    return "N/A"

@router.get("/recent-tests", response_model=List[UserTestResult])
async def get_admin_recent_tests():
    """
    Fetches the 10 most recent test results for all users.
    Returns a list of the most recent test results based on test type.
    """
    user_tests = []

    # Fetch most recent 10 tests from all collections
    colorblindness_tests = db["colorblindness_tests"].find().sort([("test_date", -1)]).limit(10)
    eye_scans = db["eye_scans"].find().sort([("timestamp", -1)]).limit(10)
    eye_test_sessions = db["eye_test_sessions"].find().sort([("start_time", -1)]).limit(10)

    # Add ColorBlindnessTests to the user_tests list
    for test in colorblindness_tests:
        user_id = test.get("user_id")
        email = await get_user_email(user_id)
        user_tests.append(UserTestResult(
            email=email,
            test_type="ColorBlindness",
            result=test.get("suspected_type", "Unknown"),
            date=test.get("test_date", datetime.now())
        ))

    # Add EyeScans to the user_tests list
    for scan in eye_scans:
        user_id = scan.get("user_id")
        email = await get_user_email(user_id)
        user_tests.append(UserTestResult(
            email=email,
            test_type="EyeScan",
            result=scan.get("overall_risk_level", "Unknown"),
            date=scan.get("timestamp", datetime.now())
        ))

    # Add EyeTestSessions to the user_tests list
    for session in eye_test_sessions:
        user_id = session.get("user_id")
        email = await get_user_email(user_id)
        user_tests.append(UserTestResult(
            email=email,
            test_type="EyeTestSession",
            result=session.get("final_status", "Unknown"),
            date=session.get("start_time", datetime.now())
        ))

    # Sort all tests based on the most recent date
    user_tests.sort(key=lambda x: x.date, reverse=True)

    # Return only the most recent 10 tests
    return user_tests[:10]

@router.get("/monthly_diseases")
async def get_monthly_diseases():
    try:

        monthly_data = {
            "colorblindness_abnormal": defaultdict(int),
            "colorblindness_normal": defaultdict(int),
            "eye_tracking_abnormal": defaultdict(int),
            "eye_tracking_normal": defaultdict(int),
            "eye_scan_abnormal": defaultdict(int),
            "eye_scan_normal": defaultdict(int),
        }

        # Query colorblindness tests and group by month
        colorblind_tests = db["colorblindness_tests"].find({})
        for test in colorblind_tests:
            user_id = str(test["user_id"])
            suspected_type = test.get("suspected_type", "normal")
            test_date = test.get("test_date")  # Assuming a field test_date exists

            if test_date:
                # Extract month and year from test_date
                test_month = test_date.strftime("%Y-%m")
                if suspected_type != "normal":
                    monthly_data["colorblindness_abnormal"][test_month] += 1
                else:
                    monthly_data["colorblindness_normal"][test_month] += 1

        # Query eye tracking tests and group by month
        eye_test_sessions = db["eye_test_sessions"].find({})
        for session in eye_test_sessions:
            user_id = str(session["user_id"])
            final_status = session.get("final_status", "NORMAL")
            test_date = session.get("start_time")  # Assuming 'start_time' is when the test occurred

            if test_date:
                # Extract month and year from test_date
                test_month = test_date.strftime("%Y-%m")
                if final_status != "NORMAL":
                    monthly_data["eye_tracking_abnormal"][test_month] += 1
                else:
                    monthly_data["eye_tracking_normal"][test_month] += 1

        # Query eye scans and group by month
        eye_scans = db["eye_scans"].find({})
        for scan in eye_scans:
            user_id = str(scan["user_id"])
            final_prediction_condition = scan.get("final_prediction", {}).get("condition", "normal")
            test_date = scan.get("timestamp")  # Assuming 'timestamp' field represents the test date

            if test_date:
                # Extract month and year from test_date
                test_month = test_date.strftime("%Y-%m")
                if final_prediction_condition != "normal":
                    monthly_data["eye_scan_abnormal"][test_month] += 1
                else:
                    monthly_data["eye_scan_normal"][test_month] += 1

        # Calculate total normal users across all test types for each month
        total_normal_per_month = defaultdict(int)

        for month in set(list(monthly_data["colorblindness_normal"].keys()) + 
                         list(monthly_data["eye_tracking_normal"].keys()) + 
                         list(monthly_data["eye_scan_normal"].keys())):
            # Sum the normal counts for each test type per month
            total_normal_per_month[month] = (
                monthly_data["colorblindness_normal"].get(month, 0) +
                monthly_data["eye_tracking_normal"].get(month, 0) +
                monthly_data["eye_scan_normal"].get(month, 0)
            )

        # Prepare the final response
        response = {
            "colorblindness_abnormal": dict(monthly_data["colorblindness_abnormal"]),
            "colorblindness_normal": dict(monthly_data["colorblindness_normal"]),
            "eye_tracking_abnormal": dict(monthly_data["eye_tracking_abnormal"]),
            "eye_tracking_normal": dict(monthly_data["eye_tracking_normal"]),
            "eye_scan_abnormal": dict(monthly_data["eye_scan_abnormal"]),
            "eye_scan_normal": dict(monthly_data["eye_scan_normal"]),
            "total_normal": dict(total_normal_per_month)  # Add the total normal count for each month
        }

        return response

    except Exception as e:
        logger.error(f"Error getting monthly disease stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching monthly disease statistics")
