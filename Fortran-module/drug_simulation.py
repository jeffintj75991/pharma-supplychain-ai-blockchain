from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import drug_degradation_py
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Drug Stability Simulation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationInput(BaseModel):
    C0: float
    A: float
    Ea: float
    time_start: float
    time_end: float
    time_points: int
    temperature_profile: list[float]
    humidity_profile: list[float]

@app.post("/simulate")
def simulate_drug_stability(data: SimulationInput):

    time_array = np.linspace(data.time_start, data.time_end, data.time_points)

   
    result = drug_degradation_py.drug_degradation_module.simulate_stability_profile(
        data.C0,
        data.A,
        data.Ea,
        time_array,
        np.array(data.temperature_profile),
        np.array(data.humidity_profile)
    )

    
    simulation_data = [
        {
            "time_h": float(t),
            "temperature_C": float(temp),
            "humidity_percent": float(hum),
            "remaining_percent": float(conc),
        }
        for t, temp, hum, conc in zip(time_array, data.temperature_profile, data.humidity_profile, result)
    ]

    return {"curve": simulation_data}
