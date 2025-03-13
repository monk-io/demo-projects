from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt.exceptions
from starlette.middleware.base import BaseHTTPMiddleware
from jwt import JWT
from jwt.jwk import OctetJWK
import logging
from typing import Set, Optional

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)  # Set logging level to DEBUG



class VerifyJWTMiddleware(BaseHTTPMiddleware):
    def __init__(
        self, 
        app, 
        jwt_secret: str, 
        public_paths: Set[str] = {"/docs", "/openapi.json", "/health", "/", "/redoc"}
    ):
        super().__init__(app)
        self.secret_key = OctetJWK(jwt_secret.encode('utf-8'))
        self.security = HTTPBearer(auto_error=False)
        self.public_paths = public_paths

    async def dispatch(self, request: Request, call_next):
        logger.debug(f"Processing request to: {request.method} {request.url.path}")
        
        if request.method == "OPTIONS" or request.url.path in self.public_paths:
            logger.debug("Skipping auth for public path or OPTIONS")
            response = await call_next(request)
            return response

        try:
            logger.debug("Attempting to get credentials")
            credentials: Optional[HTTPAuthorizationCredentials] = await self.security(request)
            
            if credentials is None:
                logger.warning("No credentials provided")
                return JSONResponse(
                    status_code=401,
                    content={"message": "Authentication required"}
                )
            
            logger.debug("Decoding token")
            token = credentials.credentials
            try:
                payload = JWT().decode(token, self.secret_key, algorithms=["HS256"])
                logger.debug(f"Token payload: {payload}")
            except Exception as e:
                logger.error(f"Token decode error: {str(e)}")
                return JSONResponse(
                    status_code=401,
                    content={"message": f"Token decode error: {str(e)}"}
                )
            
            # Store user information in request state
            #request.state.user_id = payload.get('user_id')
            request.state.username = payload.get('username')
            logger.debug(f"Set username in state: {request.state.username}")
            
            response = await call_next(request)
            return response

        except Exception as e:
            logger.error(f"Unexpected error in auth middleware: {str(e)}", exc_info=True)
            return JSONResponse(
                status_code=401,
                content={"message": f"Auth error: {str(e)}"}
            )
