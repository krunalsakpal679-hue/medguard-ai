import requests
import argparse
import sys
import time
from typing import List, Dict, Any

class MedGuardIntegrationTester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.token = None
        self.results = []
        self.start_time = time.time()
        self.drug_ids = {}

    def report(self, step: str, status: bool, message: str = ""):
        self.results.append({"step": step, "passed": status, "message": message})
        icon = "✅" if status else "❌"
        print(f"{icon} {step}: {message}")

    def run_all(self):
        print(f"\n🚀 Starting MedGuard AI Integration Pipeline: {self.base_url}")
        print("=" * 60)

        try:
            self.step1_health()
            self.step2_drug_search()
            self.step3_drug_detail()
            self.step4_auth()
            self.step5_upload_text()
            self.step6_prediction()
            self.step7_chat()
        except Exception as e:
            self.report("GLOBAL_ERROR", False, str(e))

        self.summary()

    def step1_health(self):
        try:
            res = requests.get(f"{self.base_url}/health", timeout=5)
            data = res.json()
            status = res.status_code == 200 and data.get("db_connected") is True
            self.report("STEP 1: Health Check", status, f"DB Status: {data.get('db_connected')}")
        except Exception as e:
            self.report("STEP 1: Health Check", False, str(e))
            raise

    def step2_drug_search(self):
        try:
            res = requests.get(f"{self.base_url}/api/v1/drugs/search?q=sertra", timeout=5)
            data = res.json()
            # Find Sertraline
            sertraline = next((d for d in data if "sertraline" in d["name"].lower()), None)
            
            if sertraline:
                self.drug_ids["sertraline"] = sertraline["id"]
                self.report("STEP 2: Drug Search", True, f"Found '{sertraline['name']}' in {len(data)} results.")
            else:
                self.report("STEP 2: Drug Search", False, "Could not find Sertraline in results.")
        except Exception as e:
            self.report("STEP 2: Drug Search", False, str(e))

    def step3_drug_detail(self):
        if "sertraline" not in self.drug_ids:
            self.report("STEP 3: Drug Detail", False, "Skipped - Missing Sertraline ID")
            return

        try:
            d_id = self.drug_ids["sertraline"]
            res = requests.get(f"{self.base_url}/api/v1/drugs/{d_id}", timeout=5)
            data = res.json()
            status = data.get("name") == "Sertraline"
            self.report("STEP 3: Drug Detail", status, f"Full metadata retrieved for {data.get('name')}")
        except Exception as e:
            self.report("STEP 3: Drug Detail", False, str(e))

    def step4_auth(self):
        try:
            res = requests.post(f"{self.base_url}/api/v1/auth/test-token", timeout=5)
            if res.status_code == 200:
                data = res.json()
                self.token = data["access_token"]
                self.report("STEP 4: Auth Flow (Mock)", True, "Issued integration test JWT.")
            else:
                self.report("STEP 4: Auth Flow (Mock)", False, f"Failed: {res.text}")
        except Exception as e:
            self.report("STEP 4: Auth Flow (Mock)", False, str(e))

    def step5_upload_text(self):
        if not self.token:
             self.report("STEP 5: Upload Text", False, "Skipped - No Auth Token")
             return

        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {"text": "Patient is taking Sertraline and Warfarin."}
            res = requests.post(f"{self.base_url}/api/v1/upload/text", json=payload, headers=headers, timeout=5)
            data = res.json()
            
            # Extract IDs for prediction
            extracted = data.get("extracted_drugs", [])
            for drug in extracted:
                self.drug_ids[drug["name"].lower()] = drug["id"]
                
            status = any("warfarin" in d["name"].lower() for d in extracted)
            self.report("STEP 5: OCR/Text Parsing", status, f"Extracted {len(extracted)} molecules from clinical note.")
        except Exception as e:
            self.report("STEP 5: OCR/Text Parsing", False, str(e))

    def step6_prediction(self):
        if not self.token or "warfarin" not in self.drug_ids:
            self.report("STEP 6: AI Prediction", False, "Skipped - Missing context/token")
            return

        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "drug_ids": [self.drug_ids["sertraline"], self.drug_ids["warfarin"]]
            }
            res = requests.post(f"{self.base_url}/api/v1/predictions/check", json=payload, headers=headers, timeout=10)
            data = res.json()
            
            severity = data.get("overall_risk_level")
            self.report("STEP 6: AI Prediction", severity is not None, f"Detected Severity: {severity}")
        except Exception as e:
            self.report("STEP 6: AI Prediction", False, str(e))

    def step7_chat(self):
        if not self.token:
            self.report("STEP 7: Conversational AI", False, "Skipped - No Auth Token")
            return

        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {"message": "Tell me about Warfarin interactions.", "language": "en"}
            res = requests.post(f"{self.base_url}/api/v1/chat/message", json=payload, headers=headers, timeout=10)
            response_text = res.json().get("response", "")
            
            status = len(response_text) > 20
            self.report("STEP 7: Conversational AI", status, f"Agent Response: {response_text[:40]}...")
        except Exception as e:
            self.report("STEP 7: Conversational AI", False, str(e))

    def summary(self):
        total_time = time.time() - self.start_time
        all_passed = all(r["passed"] for r in self.results)
        
        print("\n" + "=" * 60)
        print(f"📊 INTEGRATION SUMMARY | Total Time: {total_time:.2f}s")
        print("-" * 60)
        for r in self.results:
            status = "PASS" if r["passed"] else "FAIL"
            print(f"{status:6} | {r['step']}")
        print("=" * 60)
        
        if all_passed:
            print("\n✅ ALL CLUSTER TESTS PASSED. SYSTEM STABLE.\n")
            sys.exit(0)
        else:
            print("\n❌ SYSTEM INSTABILITY DETECTED. CHECK LOGS.\n")
            sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MedGuard Full-Stack Integration Tester")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Base URL of API")
    args = parser.parse_args()
    
    tester = MedGuardIntegrationTester(args.base_url)
    tester.run_all()
