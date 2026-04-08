import sys
import os
import subprocess
import importlib
import shutil
from pathlib import Path
from dotenv import load_dotenv

class MedGuardVerifier:
    def __init__(self):
        self.passes = 0
        self.warns = 0
        self.fails = 0
        self.fail_msgs = []
        self.base_path = Path(__file__).parent.parent

    def check(self, name, condition, message, is_critical=True, fix_hint=""):
        if condition:
            print(f"✅ PASS: {name} - {message}")
            self.passes += 1
        elif is_critical:
            print(f"❌ FAIL: {name} - {message}")
            self.fails += 1
            self.fail_msgs.append(f"{name}: {message} (Fix: {fix_hint})")
        else:
            print(f"⚠️  WARN: {name} - {message}")
            self.warns += 1

    def run_all(self):
        print("\n🏥 MedGuard AI — Environment Verification")
        print("=" * 60)

        self.check_system()
        self.check_python_packages()
        self.check_system_tools()
        self.check_env_vars()
        self.check_db_connection()
        self.check_file_structure()

        self.summary()

    def check_system(self):
        print("\n[SYSTEM REQUIREMENTS]")
        # Python
        self.check("Python Version", sys.version_info >= (3, 11), f"Found {sys.version.split()[0]}", True, "Install Python 3.11+")
        
        # Node
        try:
            node_v = subprocess.check_output(["node", "--version"]).decode().strip()
            self.check("Node.js Version", node_v.startswith("v18") or node_v.startswith("v2"), f"Found {node_v}", True, "Install Node.js 18+")
        except Exception:
            self.check("Node.js", False, "Not found", True, "Install Node.js")

        # Docker (Optional)
        docker = shutil.which("docker")
        self.check("Docker", docker is not None, "Found" if docker else "Not found", False, "Install Docker for local MongoDB/Redis")

    def check_python_packages(self):
        print("\n[PYTHON PACKAGES]")
        packages = [
            ("fastapi", True),
            ("motor", True),
            ("torch", True),
            ("pytesseract", True),
            ("PIL", True),
            ("google.oauth2", True),
            ("easyocr", False)
        ]
        for pkg, critical in packages:
            try:
                importlib.import_module(pkg)
                self.check(f"Package {pkg}", True, "Found", critical)
            except ImportError:
                self.check(f"Package {pkg}", False, "Not found", critical, f"pip install {pkg}")

    def check_system_tools(self):
        print("\n[SYSTEM TOOLS]")
        tesseract = shutil.which("tesseract")
        self.check("Tesseract OCR", tesseract is not None, "Found" if tesseract else "Not found", True, "Install Tesseract-OCR binary")
        
        redis = shutil.which("redis-cli")
        self.check("Redis CLI", redis is not None, "Found" if redis else "Not found", False, "Install Redis for caching")

    def check_env_vars(self):
        print("\n[ENVIRONMENT VARIABLES]")
        env_path = self.base_path / "backend" / ".env"
        if not env_path.exists():
            self.check("Backend .env", False, "File missing", True, "cp backend/.env.example backend/.env")
            return

        load_dotenv(env_path)
        uri = os.getenv("MONGO_URI", "")
        self.check("MONGO_URI", "mongodb" in uri and "user" not in uri, "Configured", True, "Set real MONGO_URI in .env")
        
        secret = os.getenv("SECRET_KEY", "")
        self.check("SECRET_KEY", len(secret) >= 32, "Secure length", True, "Generate 32+ char SECRET_KEY")

    def check_db_connection(self):
        print("\n[MONGODB CONNECTION]")
        try:
            from pymongo import MongoClient
            uri = os.getenv("MONGO_URI")
            if uri and "user" not in uri:
                client = MongoClient(uri, serverSelectionTimeoutMS=2000)
                client.server_info()
                self.check("Atlas Connection", True, "Reachable", True)
                
                db = client.get_database()
                colls = db.list_collection_names()
                self.check("Collections", len(colls) > 0, f"Found {len(colls)} collections", False)
            else:
                self.check("MongoDB Connect", False, "Skipped - Missing URI", True)
        except Exception as e:
            self.check("MongoDB Connect", False, str(e), True)

    def check_file_structure(self):
        print("\n[FILE STRUCTURE]")
        crucial_files = [
            ("Backend Entry", "backend/app/main.py"),
            ("Frontend Entry", "frontend/src/main.jsx"),
            ("Mobile App", "mobile/App.js")
        ]
        for name, path in crucial_files:
            exists = (self.base_path / path).exists()
            self.check(name, exists, "Found" if exists else "Missing", True)

    def summary(self):
        print("\n" + "=" * 60)
        print(f"SUMMARY: {self.passes} Passed, {self.warns} Warnings, {self.fails} Failed")
        print("=" * 60)

        if self.fails > 0:
            print(f"\n🚫 {self.fails} CRITICAL ERRORS DETECTED:")
            for msg in self.fail_msgs:
                print(f"  - {msg}")
            sys.exit(1)
        else:
            print("\n✨ SYSTEM VERIFIED. READY FOR CLINICAL DEPLOYMENT.\n")
            sys.exit(0)

if __name__ == "__main__":
    verifier = MedGuardVerifier()
    verifier.run_all()
