import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
from pathlib import Path

# Load dataset
data = pd.read_csv("data/drug_conditions.csv")
X = data[['temp', 'humidity']]
y = data['shelf_life_ok']

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))

# Ensure output folder exists
output_dir = Path(__file__).parent
model_file = output_dir / "drug_spoilage_model.pkl"
joblib.dump(model, model_file)
print(f"Model saved at {model_file}")
