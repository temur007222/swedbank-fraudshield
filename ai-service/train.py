"""
Model training script for Swedbank FraudShield AI.

Trains two models:
1. RandomForestClassifier for transaction fraud detection
2. TF-IDF + LogisticRegression for message (SMS/email) classification

Saves trained models and metrics to models/saved/.
"""

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

DATA_DIR = Path(__file__).resolve().parent / "data" / "output"
MODEL_DIR = Path(__file__).resolve().parent / "models" / "saved"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

SEED = 42


# ---------------------------------------------------------------------------
# Transaction fraud model
# ---------------------------------------------------------------------------

TRANSACTION_FEATURES = [
    "amount_eur",
    "hour_of_day",
    "is_international",
    "is_new_merchant",
    "velocity_last_1h",
    "velocity_last_24h",
    "days_since_last_txn",
    "amount_vs_avg_ratio",
]


def train_transaction_model() -> dict:
    print("\n=== Training Transaction Fraud Model ===")

    with open(DATA_DIR / "transactions.json") as f:
        transactions = json.load(f)

    df = pd.DataFrame(transactions)

    # Encode country risk: foreign high-risk countries get higher score
    high_risk_countries = {"NG", "UA", "RU", "CN", "BR", "PH", "ID", "VN", "GH", "KE"}
    df["country_risk"] = df["country"].apply(
        lambda c: 2 if c in high_risk_countries else (1 if c not in {"LV", "LT", "EE"} else 0)
    )

    features = TRANSACTION_FEATURES + ["country_risk"]

    # Convert booleans to int
    for col in ["is_international", "is_new_merchant"]:
        df[col] = df[col].astype(int)

    X = df[features].values
    y = df["is_fraud"].astype(int).values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED, stratify=y
    )

    print(f"  Train set: {len(X_train):,} samples ({y_train.sum():,} fraud)")
    print(f"  Test set:  {len(X_test):,} samples ({y_test.sum():,} fraud)")

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=SEED,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "feature_importances": {
            name: round(float(imp), 4)
            for name, imp in zip(features, model.feature_importances_)
        },
    }

    print(f"\n  Accuracy:  {metrics['accuracy']}")
    print(f"  Precision: {metrics['precision']}")
    print(f"  Recall:    {metrics['recall']}")
    print(f"  F1:        {metrics['f1']}")
    print(f"  ROC AUC:   {metrics['roc_auc']}")
    print(f"\n  Feature importances:")
    for feat, imp in sorted(metrics["feature_importances"].items(), key=lambda x: -x[1]):
        print(f"    {feat:25s} {imp:.4f}")

    # Save model and feature list
    joblib.dump(model, MODEL_DIR / "transaction_rf_model.joblib")
    joblib.dump(features, MODEL_DIR / "transaction_features.joblib")
    print(f"\n  Model saved to {MODEL_DIR / 'transaction_rf_model.joblib'}")

    return metrics


# ---------------------------------------------------------------------------
# Message classification model
# ---------------------------------------------------------------------------

def train_message_model() -> dict:
    print("\n=== Training Message Classification Model ===")

    with open(DATA_DIR / "communications.json") as f:
        communications = json.load(f)

    df = pd.DataFrame(communications)

    # Combine subject and body for text features
    df["text"] = df.apply(
        lambda row: (
            (row["subject"] + " " if row["subject"] else "") + row["body"]
        ),
        axis=1,
    )

    X = df["text"].values
    y = df["is_fraud"].astype(int).values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=SEED, stratify=y
    )

    print(f"  Train set: {len(X_train):,} samples ({y_train.sum():,} fraud)")
    print(f"  Test set:  {len(X_test):,} samples ({y_test.sum():,} fraud)")

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
            min_df=2,
            max_df=0.95,
        )),
        ("clf", LogisticRegression(
            C=1.0,
            class_weight="balanced",
            max_iter=1000,
            random_state=SEED,
        )),
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }

    # Get top features
    tfidf = pipeline.named_steps["tfidf"]
    clf = pipeline.named_steps["clf"]
    feature_names = tfidf.get_feature_names_out()
    coefs = clf.coef_[0]
    top_fraud_indices = np.argsort(coefs)[-15:]
    top_legit_indices = np.argsort(coefs)[:15]

    metrics["top_fraud_words"] = [
        {"word": feature_names[i], "weight": round(float(coefs[i]), 4)}
        for i in reversed(top_fraud_indices)
    ]
    metrics["top_legit_words"] = [
        {"word": feature_names[i], "weight": round(float(coefs[i]), 4)}
        for i in top_legit_indices
    ]

    print(f"\n  Accuracy:  {metrics['accuracy']}")
    print(f"  Precision: {metrics['precision']}")
    print(f"  Recall:    {metrics['recall']}")
    print(f"  F1:        {metrics['f1']}")
    print(f"  ROC AUC:   {metrics['roc_auc']}")
    print(f"\n  Top fraud-indicating words:")
    for entry in metrics["top_fraud_words"][:10]:
        print(f"    {entry['word']:30s} {entry['weight']:.4f}")

    # Save
    joblib.dump(pipeline, MODEL_DIR / "message_classifier_pipeline.joblib")
    print(f"\n  Model saved to {MODEL_DIR / 'message_classifier_pipeline.joblib'}")

    return metrics


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    # Check data exists
    for name in ["transactions.json", "communications.json"]:
        if not (DATA_DIR / name).exists():
            print(f"ERROR: {DATA_DIR / name} not found. Run data/generate_dataset.py first.")
            sys.exit(1)

    txn_metrics = train_transaction_model()
    msg_metrics = train_message_model()

    # Combined metrics output
    all_metrics = {
        "transaction_model": txn_metrics,
        "message_model": msg_metrics,
    }

    metrics_path = MODEL_DIR / "metrics.json"
    with open(metrics_path, "w") as f:
        json.dump(all_metrics, f, indent=2)

    print(f"\n=== All metrics saved to {metrics_path} ===")
    print("Training complete.")


if __name__ == "__main__":
    main()
