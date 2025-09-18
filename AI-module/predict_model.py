from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from pathlib import Path

# --- Load trained model once at startup ---
model_path = Path(__file__).parent / "drug_spoilage_model.pkl"
model = joblib.load(model_path)

# --- Define request schema ---
class SpoilageRequest(BaseModel):
    temp: float
    humidity: float

app = FastAPI()

@app.post("/predict")
def predict_spoilage(req: SpoilageRequest):
    # Prepare input for the model
    input_data = pd.DataFrame([{"temp": req.temp, "humidity": req.humidity}])
    prediction = model.predict(input_data)
    return {
        "spoiled": bool(prediction[0] == 1),
        "risk": "Yes" if prediction[0] == 1 else "No"
    }
