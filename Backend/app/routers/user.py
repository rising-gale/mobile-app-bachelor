from fastapi import APIRouter, Depends, Body, Security, Response, HTTPException, status
from fastapi.responses import FileResponse

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# from app.auth.auth_bearer import JWTBearer
# from app.auth.auth_handler import signJWT
from app.models.user import UserSchema, UserLoginSchema, UserPublic
from app.models.token import RefreshTokenRequest, TokenResponse
from app.models.response import ApiResponse, MessageModel
from app.services import user as UserService
from app.utils.response import success
# from app.auth.auth_handler import decodeJWT

from datetime import datetime, timedelta, timezone
from typing import Annotated
from app.models.token import TokenData

router = APIRouter()

ACCESS_TOKEN_EXPIRE_MINUTES = int(__import__("os").environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))

@router.post("/token",  tags=["user"], response_model=ApiResponse[TokenResponse])
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
        data={"sub": user['username']}, expires_delta=access_token_expires
    )
    refresh_token = UserService.create_refresh_token(user['username'])
    expires_in = int(access_token_expires.total_seconds())
    return ApiResponse(success=True, data={"access_token": access_token, "token_type": "bearer", "expires_in": expires_in, "refresh_token": refresh_token})


@router.post("/token/refresh", tags=["user"], response_model=ApiResponse[TokenResponse])
def refresh_access_token(payload: RefreshTokenRequest = Body(...)):
    refresh_token = payload.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")
    # verify and rotate
    username = UserService.verify_refresh_token(refresh_token)
    access_token_expires = timedelta(minutes=UserService.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = UserService.create_access_token(data={"sub": username}, expires_delta=access_token_expires)
    new_refresh = UserService.rotate_refresh_token(refresh_token)
    expires_in = int(access_token_expires.total_seconds())
    return ApiResponse(success=True, data={"access_token": access_token, "token_type": "bearer", "expires_in": expires_in, "refresh_token": new_refresh})


@router.post("/token/revoke", tags=["user"], response_model=ApiResponse[MessageModel])
def revoke_refresh(payload: RefreshTokenRequest = Body(...)):
    refresh_token = payload.refresh_token
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="refresh_token required")
    ok = UserService.revoke_refresh_token(refresh_token)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to revoke token")
    return ApiResponse(success=True, data={"message": "revoked"})

@router.get("/user/me", tags=["user"], response_model=ApiResponse[UserPublic])
def read_users_me(
    current_user: Annotated[dict, Depends(UserService.get_current_active_user)]
):
    public = UserService.user_to_public(current_user)
    return ApiResponse(success=True, data=public)

@router.post("/user/signup", tags=["user"], response_model=ApiResponse[MessageModel])
def register_user(user: UserSchema = Body(...)):
    return ApiResponse(success=True, data=UserService.create_user(user)) 

@router.patch('/user/update', tags=["user"], response_model=ApiResponse[MessageModel])
def update_user(user: UserSchema = Body(...)):
    return ApiResponse(success=True, data=UserService.update_current_user(user))

@router.get("/user/confirm/{token}", tags=["user"], response_model=ApiResponse[MessageModel])
def confirm_email(token):
    return ApiResponse(success=True, data=UserService.confirm_email(token))

@router.get('/user/send_email', tags=['user'], response_model=ApiResponse[MessageModel])
def send_email(send_to: str):
    return ApiResponse(success=True, data=UserService.resend_confirmation_email(send_to))

# @router.post('/user/refresh')
# def refresh(Authorize: AuthJWT = Depends()):
#     Authorize.jwt_refresh_token_required()

#     current_user = Authorize.get_jwt_subject()
#     new_access_token = Authorize.create_access_token(subject=current_user)
#     # Set the JWT and CSRF double submit cookies in the response
#     Authorize.set_access_cookies(new_access_token)
#     return {"msg":"The token has been refresh"}

# @router.delete('/user/logout')
# def logout(Authorize: AuthJWT = Depends()):
#     """
#     Because the JWT are stored in an httponly cookie now, we cannot
#     log the user out by simply deleting the cookie in the frontend.
#     We need the backend to send us a response to delete the cookies.
#     """
#     Authorize.jwt_required()

#     Authorize.unset_jwt_cookies()
#     return {"msg":"Successfully logout"}

# @router.get("/user/me", tags=["user"])
# def get_current_user_data(Authorize: AuthJWT = Depends()):
#     Authorize.jwt_required()
#     current_username = Authorize.get_jwt_subject()
#     return UserService.check_user(decodeJWT(current_username)['username'])