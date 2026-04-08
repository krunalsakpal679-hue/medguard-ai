# Clinical Troubleshooting Guide: Common Fixes

This document outlines the top 15 most frequent issues encountered during MedGuard AI development and deployment, with verified solutions.

---

## 1. Motor/MongoDB Connection Timeout

**Error:** `ServerSelectionTimeoutError`

- **Root Cause:** MongoDB instance unreachable or port not mapped.
- **Fix:**
  - Verify `MONGO_URI` in `.env` (use `localhost:27017` for local execution outside Docker).
  - Ensure the container is mapping ports: `docker run -p 27017:27017 mongo`.
  - Increase timeout in client options: `serverSelectionTimeoutMS=5000`.

## 2. JWT Signature Verification Failed

**Error:** `jose.exceptions.JWTError: Signature verification failed`

- **Root Cause:** `SECRET_KEY` changed or token from a different environment.
- **Fix:**
  - Clear browser `localStorage` and `cookies`.
  - Ensure `.env` secret key matches on all nodes.
  - Force global logout by incrementing `JWT_VERSION` in configuration (if implemented).

## 3. EasyOCR CUDA Out of Memory

**Error:** `RuntimeError: CUDA out of memory`

- **Root Cause:** GPU memory exhausted by high-resolution prescription images.
- **Fix:**
  - Force CPU mode: `os.environ["CUDA_VISIBLE_DEVICES"] = ""`.
  - Or, initialize OCR with `gpu=False`: `Reader(['en'], gpu=False)`.

## 4. Pydantic Validation Error for ObjectId

**Error:** `value is not a valid ObjectId`

- **Root Cause:** Pydantic doesn't natively handle MongoDB `ObjectId`.
- **Fix:**
  - Use `Annotated[str, BeforeValidator(str)]` in definitions.
  - Or set `model_config = ConfigDict(arbitrary_types_allowed=True)`.

## 5. CORS Header Missing

**Error:** `No 'Access-Control-Allow-Origin' header present`

- **Root Cause:** Frontend URL not whitelisted in backend.
- **Fix:**
  - Update `CORS_ORIGINS` in `.env` to include the exact frontend URL (e.g., `http://localhost:5173`).
  - Ensure `CORSMiddleware` is registered *early* in `main.py`.

## 6. Google OAuth Connection in Docker

**Error:** `TransportError: unable to connect to googleapis.com`

- **Root Cause:** Container DNS resolution or internet access blocked.
- **Fix:**
  - Verify internet via: `docker exec -it <id> curl https://www.google.com`.
  - Check Docker daemon DNS settings (`/etc/docker/daemon.json`).

## 7. PyTorch Weights Not Found

**Error:** `FileNotFoundError: weights/ddi_model.pt`

- **Root Cause:** DDI model weight file missing from volume.
- **Fix:**
  - Check if weights are pre-downloaded or generated.
  - Trigger training if in specialized environment: `python -m app.ml.model.train`.

## 15. MongoDB Duplicate Key Error on Drug Insert

**Error:** `E11000 duplicate key error`

- **Root Cause:** Unique index on `name` or `generic_name` violated.
- **Fix:**
  - Use `upsert=True` in update operations.
  - Run a check before insert: `if not await db.drugs.find_one(...)`.
