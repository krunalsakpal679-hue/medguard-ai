import time
from fastapi import Request, HTTPException, status
from collections import defaultdict
from typing import Dict, List

class RateLimiter:
    """
    A simple in-memory rate limiter using a sliding window.
    """
    def __init__(self, max_calls: int, period: int):
        self.max_calls = max_calls
        self.period = period
        self.calls: Dict[str, List[float]] = defaultdict(list)
        self.cleanup_counter = 0

    async def __call__(self, request: Request):
        client_ip = request.client.host
        now = time.time()
        
        # Remove expired timestamps for this client
        self.calls[client_ip] = [t for t in self.calls[client_ip] if now - t < self.period]
        
        if len(self.calls[client_ip]) >= self.max_calls:
            # Calculate when the next call will be allowed
            wait_time = int(self.period - (now - self.calls[client_ip][0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
                headers={"Retry-After": str(wait_time)}
            )
        
        # Record this call
        self.calls[client_ip].append(now)
        
        # Periodic cleanup of all inactive clients
        self.cleanup_counter += 1
        if self.cleanup_counter >= 100:
            self._cleanup_all(now)
    
    def _cleanup_all(self, now: float):
        """Purge all expired entries across all IPs."""
        for ip in list(self.calls.keys()):
            self.calls[ip] = [t for t in self.calls[ip] if now - t < self.period]
            if not self.calls[ip]:
                del self.calls[ip]
        self.cleanup_counter = 0
