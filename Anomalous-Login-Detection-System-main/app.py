from flask import Flask, request, redirect, session, jsonify
from datetime import datetime
import numpy as np # Add this import
import requests, smtplib, joblib, os, json
from email.mime.text import MIMEText

app = Flask(__name__)
app.secret_key = "your-flask-secret"

# ─── Setup logging directory ────────────────────────────────────────────────────
LOG_DIR  = "outputs"
os.makedirs(LOG_DIR, exist_ok=True)
LOG_PATH = os.path.join(LOG_DIR, "logs.txt")

# ─── 1) Load all encoders and the model at startup ────────────────────────────
MODEL_DIR       = "models"
location_enc    = joblib.load(os.path.join(MODEL_DIR, "location_encoder.pkl"))
ip_country_enc  = joblib.load(os.path.join(MODEL_DIR, "ip_country_encoder.pkl"))
isp_enc         = joblib.load(os.path.join(MODEL_DIR, "isp_encoder.pkl"))
role_enc        = joblib.load(os.path.join(MODEL_DIR, "role_encoder.pkl"))
os_enc          = joblib.load(os.path.join(MODEL_DIR, "device_os_encoder.pkl"))
browser_enc     = joblib.load(os.path.join(MODEL_DIR, "browser_encoder.pkl"))
dtype_enc       = joblib.load(os.path.join(MODEL_DIR, "device_type_encoder.pkl"))
user_id_enc     = joblib.load(os.path.join(MODEL_DIR, "user_id_encoder.pkl"))
model           = joblib.load(os.path.join(MODEL_DIR, "isolation_forest.pkl"))

# ──2) Login Stub for Testing since we are not connected the database and frontend side of things ─────────────────────────
@app.route("/login-test")
def login_test():
    """
    Simulate a user login for testing.
    Sets session['user_id'] and session['role'] so ML has real values.
    """
    session["user_id"] = "2"      # e.g. user #2
    session["role"]    = "Nurse"  # e.g. Nurse role
    return "✅ Test login set: user_id=2, role=Nurse. Now hit / or POST to /predict."

# ─── 3) Helpers ─────────────────────────────────────────────────────────────────
def safe_transform(encoder, raw_value):
    """
    Map raw_value to an integer. Falls back to "UNKNOWN" if unseen.
    """
    val = raw_value if raw_value in encoder.classes_ else "UNKNOWN"
    return int(encoder.transform([val])[0])

def get_location_info(ip):
    """Fetch city, region, country, isp for an IP."""
    try:
        r = requests.get(f"http://ip-api.com/json/{ip}")
        d = r.json()
        return {
            "city":    d.get("city",     "UNKNOWN"),
            "region":  d.get("regionName","UNKNOWN"),
            "country": d.get("country",  "UNKNOWN"),
            "isp":     d.get("isp",      "UNKNOWN")
        }
    except:
        return {"city":"UNKNOWN","region":"UNKNOWN","country":"UNKNOWN","isp":"UNKNOWN"}

def make_feature_dict(ip, user_agent, user_id, role):
    """
    Build the exact feature dict your model expects,
    using the pre-loaded LabelEncoders and safe_transform().
    """
    now = datetime.now()
    loc = get_location_info(ip)

    # Extract OS and browser from user_agent (simple parse)
    try:
        os_raw      = user_agent.split("(",1)[1].split(")")[0]
        browser_raw = user_agent.split(" ")[0]
    except:
        os_raw, browser_raw = "UNKNOWN","UNKNOWN"

    return {
        "hour":            now.hour,
        "weekday":         now.weekday(),
        "location_city":   safe_transform(location_enc, loc["city"]),
        "ip_country":      safe_transform(ip_country_enc, loc["country"]),
        "isp":             safe_transform(isp_enc, loc["isp"]),
        "role":            safe_transform(role_enc, role),
        "device_os":       safe_transform(os_enc, os_raw),
        "browser":         safe_transform(browser_enc, browser_raw),
        "device_type":     safe_transform(dtype_enc, "Desktop"),  
        "user_id":         safe_transform(user_id_enc, str(user_id)),
        "login_success":   1,
        #"login_type":      0,
        "session_duration":30,
        "attempt_count":   1
    }

def log_event(raw_data, feature_dict, classification):
    """
    Append a JSON line to outputs/logs.txt for later analysis/retraining.
    """
    entry = {
        "timestamp":  datetime.now().isoformat(),
        "raw":        raw_data,
        "features":   feature_dict,
        "classification": classification
    }
    with open(LOG_PATH, "a") as f:
        f.write(json.dumps(entry) + "\n")

# Modified print_to_console
def print_to_console(date, result, raw_details, location_details):
    """
    Prints the login event details to the console using raw, human-readable data.
    """
    print("─" * 50)
    print(f"🚨 Login Event ({date}) 🚨")
    print(f"  Result:     {result}")
    print(f"  IP Address: {raw_details.get('ip', 'N/A')}")
    print(f"  User ID:    {raw_details.get('user_id', 'N/A')}")
    print(f"  Role:       {raw_details.get('role', 'N/A')}")
    print(f"  Location:   {location_details.get('city', 'N/A')}, {location_details.get('country', 'N/A')}")
    print(f"  ISP:        {location_details.get('isp', 'N/A')}")
    print(f"  User Agent: {raw_details.get('user_agent', 'N/A')}")
    print("─" * 50)

# Modified send_to_email (placeholder)
def send_to_email(date, result, raw_details, location_details):
    """
    Sends an email alert for the login event using raw, human-readable data.
    Placeholder: Implement your email sending logic here.
    """
    # TODO: Implement your email sending logic
    # Example using raw details:
    # subject = f"Login Alert: {result} from {raw_details.get('ip', 'N/A')} for User {raw_details.get('user_id', 'N/A')}"
    # body = f"""
    # Login Event Details:
    # Date: {date}
    # Result: {result}
    #
    # User Information:
    # IP Address: {raw_details.get('ip', 'N/A')}
    # User ID:    {raw_details.get('user_id', 'N/A')} # e.g., "2" or "some_username"
    # Role:       {raw_details.get('role', 'N/A')}    # e.g., "Nurse" or "Admin"
    #
    # Location & Device:
    # City:       {location_details.get('city', 'N/A')}    # e.g., "New York"
    # Country:    {location_details.get('country', 'N/A')} # e.g., "United States"
    # ISP:        {location_details.get('isp', 'N/A')}     # e.g., "Verizon"
    # User Agent: {raw_details.get('user_agent', 'N/A')}
    # """
    # msg = MIMEText(body)
    # msg['Subject'] = subject
    # msg['From'] = "your_email@example.com"
    # msg['To'] = "recipient_email@example.com"
    #
    # try:
    #     with smtplib.SMTP_SSL('smtp.example.com', 465) as smtp_server:
    #         smtp_server.login("your_email@example.com", "your_password")
    #         smtp_server.sendmail("your_email@example.com", "recipient_email@example.com", msg.as_string())
    #     print(f"Email alert sent for {result} login from {raw_details.get('ip', 'N/A')}")
    # except Exception as e:
    #     print(f"Error sending email: {e}")
    pass

# ─── 4) ML Endpoint ─────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    Expects JSON:
        {
          "ip": "...",
          "user_agent": "...",
          "user_id": 2,
          "role": "Nurse"
        }
    Returns JSON:
        { "classification": "Normal"|"Anomaly" }
    """
    data = request.get_json()
    feat = make_feature_dict(
        ip         = data["ip"],
        user_agent = data["user_agent"],
        user_id    = data["user_id"],
        role       = data["role"]
    )

    values = list(feat.values())
    pred   = model.predict([values])[0]
    cls    = "Anomaly" if pred == -1 else "Normal"

    # Log for retraining & auditing
    log_event(data, feat, cls)

    return jsonify({"classification": cls})

# ─── 5) Root Route ─────────────────────────────────────────────────────────────
@app.route("/")
def index():
    """
    Gathers login info, classifies it, sends email/logs, then redirects.
    """
    ip      = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)
    ua      = request.headers.get("User-Agent")
    now     = datetime.now()
    date    = now.strftime("%Y-%m-%d %H:%M:%S")
    # These are the raw user_id and role from the session
    user_id = session.get("user_id", "N/A") # e.g., "2", "guest"
    role    = session.get("role",    "N/A") # e.g., "Nurse", "Admin"

    # make_feature_dict takes raw inputs and returns encoded features for the model
    feat   = make_feature_dict(ip, ua, user_id, role)
    pred   = model.predict([list(feat.values())])[0]
    result = "Anomaly" if pred == -1 else "Normal"

    # get_location_info returns a dictionary with raw location strings
    loc = get_location_info(ip) # e.g., {"city": "Mountain View", "country": "United States", ...}

    # This dictionary contains all the raw, human-readable data for display and logging the "raw" part
    raw_data_for_display_and_log = {
        "ip": ip,
        "user_agent": ua,
        "user_id": user_id, # This is the actual user ID string
        "role": role        # This is the actual role string
    }

    # Pass the raw data to the notification functions
    send_to_email(date, result, raw_data_for_display_and_log, loc)
    print_to_console(date, result, raw_data_for_display_and_log, loc)

    # Log event (passing the raw data and the encoded features separately)
    log_event(raw_data_for_display_and_log, feat, result)

    return redirect("https://google.com")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)