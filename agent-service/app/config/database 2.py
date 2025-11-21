import mysql.connector
from mysql.connector import Error
from app.config.settings import settings
from typing import Optional, Dict, Any, List

def get_db_connection():
    """Create and return a MySQL database connection"""
    try:
        connection = mysql.connector.connect(
            host=settings.DB_HOST,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            port=settings.DB_PORT
        )
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise

def get_booking_details(booking_id: int) -> Optional[Dict[str, Any]]:
    """Fetch booking details from database"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            b.id,
            b.start_date,
            b.end_date,
            b.num_guests,
            b.status,
            p.name as property_name,
            p.city,
            p.state,
            p.country,
            p.property_type,
            p.amenities,
            u.name as traveler_name,
            u.email as traveler_email
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.traveler_id = u.id
        WHERE b.id = %s
        """
        cursor.execute(query, (booking_id,))
        result = cursor.fetchone()
        
        # Parse amenities if it's a string
        if result and 'amenities' in result and isinstance(result['amenities'], str):
            try:
                import json
                result['amenities'] = json.loads(result['amenities'])
            except:
                result['amenities'] = result['amenities'].split(',') if result['amenities'] else []
        
        return result
    except Error as e:
        print(f"Error fetching booking details: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def get_user_preferences(user_id: int) -> Optional[Dict[str, Any]]:
    """Fetch user preferences from database"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
        SELECT 
            name,
            email,
            phone_number,
            about_me,
            languages
        FROM users
        WHERE id = %s
        """
        cursor.execute(query, (user_id,))
        return cursor.fetchone()
    except Error as e:
        print(f"Error fetching user preferences: {e}")
        return None
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
