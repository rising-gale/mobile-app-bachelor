from fastapi import APIRouter, Depends, Body, Security, Response, HTTPException, status
# from fastapi.responses import FileResponse

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# from app.auth.auth_bearer import JWTBearer
# from app.auth.auth_handler import signJWT
from app.models.user import UserSchema, UserLoginSchema, UserPublic, UsernameUpdate, EmailUpdate, UserUpdateFields, CityChoice, LOCATIONS
from app.models.token import RefreshTokenRequest, TokenResponse
from app.models.response import ApiResponse, MessageModel
from app.services import user as UserService
from app.utils.response import success
# from app.auth.auth_handler import decodeJWT

from datetime import datetime, timedelta, timezone
from typing import Annotated

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = int(__import__("os").environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))

@router.post("/token",  tags=["user"], response_model=ApiResponse[TokenResponse],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}}
)
def login_for_access_token(response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = UserService.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=UserService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = UserService.create_access_token(
        data={"sub": user['_id']}, expires_delta=access_token_expires
    )
    refresh_token = UserService.create_refresh_token(user['_id'])
    expires_in = int(access_token_expires.total_seconds())
    return ApiResponse(success=True, data={"access_token": access_token, "token_type": "bearer", "expires_in": expires_in, "refresh_token": refresh_token})


@router.post("/token/refresh", tags=["user"], response_model=ApiResponse[TokenResponse],
    responses={400: {"model": ApiResponse[MessageModel], "description": "Bad Request"}, 401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}}
)
def refresh_access_token(payload: RefreshTokenRequest = Body(...)):
    refresh_token = payload.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")
    # verify and rotate
    user_id = UserService.verify_refresh_token(refresh_token)
    access_token_expires = timedelta(minutes=UserService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = UserService.create_access_token(data={"sub": user_id}, expires_delta=access_token_expires)
    new_refresh = UserService.rotate_refresh_token(refresh_token)
    expires_in = int(access_token_expires.total_seconds())
    return ApiResponse(success=True, data={"access_token": access_token, "token_type": "bearer", "expires_in": expires_in, "refresh_token": new_refresh})


@router.post("/token/revoke", tags=["user"], response_model=ApiResponse[MessageModel],
    responses={400: {"model": ApiResponse[MessageModel], "description": "Bad Request"}}
)
def revoke_refresh(payload: RefreshTokenRequest = Body(...)):
    refresh_token = payload.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")
    ok = UserService.revoke_refresh_token(refresh_token)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to revoke token")
    return ApiResponse(success=True, data={"message": "revoked"})

@router.get("/user/me", tags=["user"], response_model=ApiResponse[UserPublic],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}}
)
def read_users_me(current_user: UserPublic = Depends(UserService.get_current_active_user)):
    return ApiResponse(success=True, data=current_user)

@router.post("/user/signup", tags=["user"], response_model=ApiResponse[MessageModel])
def register_user(user: UserSchema = Body(...)):
    return ApiResponse(success=True, data=UserService.create_user(user)) 

@router.patch('/user/update', tags=["user"], response_model=ApiResponse[MessageModel],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}}
)
def update_user(payload: UserUpdateFields = Body(...), current_user: UserPublic = Depends(UserService.get_current_active_user)):
    return ApiResponse(success=True, data=UserService.update_current_user(current_user, payload))

@router.get("/user/confirm/{token}", tags=["user"], response_model=ApiResponse[MessageModel])
def confirm_email(token: str):
    return ApiResponse(success=True, data=UserService.confirm_email(token))


@router.get('/user/locations', tags=['user'], response_model=ApiResponse[list[CityChoice]])
def get_locations():
    """Return list of allowed work/location choices (Ukrainian major cities)."""
    return ApiResponse(success=True, data=LOCATIONS)

@router.get('/user/send_email', tags=['user'], response_model=ApiResponse[MessageModel])
def send_email(send_to: str):
    return ApiResponse(success=True, data=UserService.resend_confirmation_email(send_to))

@router.patch('/user/username', tags=['user'], response_model=ApiResponse[MessageModel],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}, 409: {"model": ApiResponse[MessageModel], "description": "Conflict"}}
)
def change_username(payload: UsernameUpdate = Body(...), current_user: UserPublic = Depends(UserService.get_current_active_user)):
    return ApiResponse(success=True, data=UserService.update_username(current_user, payload.username))


@router.patch('/user/email', tags=['user'], response_model=ApiResponse[MessageModel],
    responses={401: {"model": ApiResponse[MessageModel], "description": "Unauthorized"}, 409: {"model": ApiResponse[MessageModel], "description": "Conflict"}}
)
def change_email(payload: EmailUpdate = Body(...), current_user: UserPublic = Depends(UserService.get_current_active_user)):
    return ApiResponse(success=True, data=UserService.update_email(current_user, payload.email))