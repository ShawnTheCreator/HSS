import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Paths
DATA_PATH = os.path.join('data', 'numeric_login_data.csv')
MODEL_PATH = os.path.join('models', 'isolation_forest.pkl')

# Load and preprocess the dataset
def load_data():
    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=['is_anomaly'])  # Features
    y = df['is_anomaly']  # Labels (for testing, not needed for training)
    return X, y

# Train Isolation Forest model
def train_model():
    X, _ = load_data()
    model = IsolationForest(n_estimators=100, contamination=0.2, random_state=42)
    model.fit(X)
    joblib.dump(model, MODEL_PATH)
    print("Model trained and saved at:", MODEL_PATH)

# Load the trained model
def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Trained model not found. Run train_model() first.")
    return joblib.load(MODEL_PATH)


# Predict whether a new login record is normal or an anomaly
##############################Updated################################
def predict_login(input_dict):
    model = load_model()
    df_input = pd.DataFrame([input_dict])
    # Ensure the order of columns in df_input matches the order used during training
    # If your training data (X in train_model) had a specific column order,
    # you might need to reorder df_input.columns here if it's different.
    # For example:
    # X_train_columns = [...] # List of column names in the order the model was trained
    # df_input = df_input[X_train_columns]
    prediction = model.predict(df_input)[0]  # -1 = anomaly, 1 = normal
    return "Anomaly" if prediction == -1 else "Normal"

# Example usage (for testing)
if __name__ == "__main__":
    # Ensure the model is trained if it doesn't exist
    if not os.path.exists(MODEL_PATH):
        print("Training model as it was not found...")
        train_model()
    else:
        print(f"Using existing model from: {MODEL_PATH}")

    # --- Using a log from logs.txt ---
    LOG_FILE_PATH = os.path.join('..', 'outputs', 'logs.txt') # Path to your logs.txt

    if os.path.exists(LOG_FILE_PATH):
        try:
            with open(LOG_FILE_PATH, 'r') as f:
                # Read the first log entry (as an example)
                first_log_line = f.readline()
                if first_log_line:
                    log_entry_dict = json.loads(first_log_line)
                    
                    # Extract the 'features' dictionary from the log entry
                    # This assumes your log_event function in app.py stores features under the key "features"
                    features_from_log = log_entry_dict.get("features")

                    if features_from_log:
                        print("\n--- Predicting based on a log from logs.txt ---")
                        print(f"Features from log: {features_from_log}")
                        result_from_log = predict_login(features_from_log)
                        print(f"Log classification: {result_from_log}")
                    else:
                        print("Could not find 'features' key in the log entry.")
                else:
                    print(f"{LOG_FILE_PATH} is empty.")
        except Exception as e:
            print(f"Error reading or processing log file: {e}")
    else:
        print(f"Log file not found at {LOG_FILE_PATH}. Run the Flask app to generate logs.")


    # --- Original test_login example (optional, can be kept for comparison) ---
    # print("\n--- Predicting based on the hardcoded test_login ---")
    # test_login = {
    #     'hour': 3,
    #     'weekday': 6,
    #     'location_city': 1,
    #     'ip_country': 2,
    #     'isp': 1,
    #     'role': 3,
    #     'device_os': 0,
    #     'browser': 2,
    #     'device_type': 1,
    #     'user_id': 2,
    #     'login_success': 1,
    #     # 'login_type': 0, # Ensure this matches the features your model was trained on
    #     'session_duration': 12,
    #     'attempt_count': 1
    # }
    # result = predict_login(test_login)
    # print("Login classification (test_login):", result)
