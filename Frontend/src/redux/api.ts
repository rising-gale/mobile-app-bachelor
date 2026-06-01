import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import {
  ApiResponse,
  AssessmentOut,
  AssessmentSummary,
  CityChoice,
  EmailUpdate,
  IdModel,
  MessageModel,
  NumberWithHistory,
  PageCountModel,
  RefreshTokenRequest,
  TokenResponse,
  UsernameUpdate,
  UserPublic,
  UserSchema,
} from "src/types/api";

// Base URL: use env var if provided, fallback to localhost
const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string) || "http://127.0.0.1:8080/";

// 1. Чистый базовый запрос (занимается только подстановкой текущего access_token)
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: async (headers) => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (token) {
        headers.set(
          "Authorization",
          token.startsWith("Bearer ") ? token : `Bearer ${token}`,
        );
      }
    } catch (e) {
      console.error("Failed to fetch secure token", e);
    }
    return headers;
  },
});

// Переменная для атомарной блокировки (Mutex).
// Предотвращает множественные запросы на /token/refresh при ротации токенов.
let refreshPromise: Promise<boolean> | null = null;

// 2. Кастомная обертка с логикой автоматического рефреша
const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions,
) => {
  // Выполняем исходный запрос
  let result = await baseQuery(args, api, extraOptions);

  // Если сервер вернул 401 Unauthorized — токен протух
  if (result.error && result.error.status === 401) {
    // Если еще никто не запустил процесс обновления токена — запускаем его
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshToken = await SecureStore.getItemAsync("refresh_token");
          if (!refreshToken) return false;

          // Делаем ручной запрос на бэкенд для рефреша через наш же baseQuery.
          // Твой бэкенд принимает JSON body: { refresh_token: "..." }
          const refreshResult = await baseQuery(
            {
              url: "token/refresh",
              method: "POST",
              body: { refresh_token: refreshToken },
            },
            api,
            extraOptions,
          );

          const tokenData = refreshResult.data as
            | ApiResponse<TokenResponse>
            | undefined;

          // Если бэк успешно вернул структуру с новыми токенами
          if (tokenData?.success && tokenData?.data?.access_token) {
            // Сохраняем новый Access Токен
            await SecureStore.setItemAsync(
              "access_token",
              "Bearer " + tokenData.data.access_token,
            );

            // Твой бэкенд ротирует рефреш токен (метод rotate_refresh_token),
            // поэтому обязательно перезаписываем его новым значением из ответа
            if (tokenData.data.refresh_token) {
              await SecureStore.setItemAsync(
                "refresh_token",
                tokenData.data.refresh_token,
              );
            }
            return true;
          }
          return false;
        } catch (error) {
          console.error("Token refresh critical error:", error);
          return false;
        } finally {
          // После завершения (успешного или нет) обязательно очищаем промис,
          // чтобы при следующих истечениях access токена цикл мог повториться
          refreshPromise = null;
        }
      })();
    }

    // Все параллельные запросы, зашедшие в эту ветку, будут смиренно ждать разрешения этого Promise
    const isSuccess = await refreshPromise;

    if (isSuccess) {
      // Если рефреш прошел успешно, повторно выполняем исходный запрос.
      // Метод baseQuery внутри себя снова вызовет prepareHeaders,
      // который прочитает из SecureStore уже СВЕЖИЙ access_token.
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Если обновить токен не удалось (рефреш просрочен, удален из БД или отозван)
      // Полностью зачищаем хранилище токенов
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");

      // СЮДА МОЖНО ДОБАВИТЬ ОЧИСТКУ СТЕЙТА АВТОРИЗАЦИИ:
      // Например, если у тебя есть authSlice:
      // api.dispatch(logout());
    }
  }

  return result;
};

export const mobileApi = createApi({
  reducerPath: "mobileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Assessment", "User"],
  endpoints: (build) => ({
    // Assessment endpoints
    checkNumber: build.mutation<ApiResponse<NumberWithHistory>, FormData>({
      query: (form) => ({
        url: "assessment/check_number",
        method: "POST",
        body: form,
      }),
    }),

    submitAssessment: build.mutation<ApiResponse<IdModel>, FormData>({
      query: (formData) => ({
        url: "assessment/submit",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Assessment"],
    }),

    getNumber: build.query<ApiResponse<NumberWithHistory>, string>({
      query: (digits) =>
        `assessment/get_number?digits=${encodeURIComponent(digits)}`,
    }),

    getHistory: build.query<ApiResponse<AssessmentSummary[]>, number>({
      query: (pageNumber) => `assessment/history?pageNumber=${pageNumber}`,
      providesTags: (result) =>
        result?.data
          ? result.data.map((r) => ({ type: "Assessment" as const, id: r.id }))
          : ["Assessment"],
    }),

    getPageCount: build.query<ApiResponse<PageCountModel>, void>({
      query: () => "assessment/page_count",
    }),

    getHistoryByDigits: build.query<ApiResponse<AssessmentSummary[]>, string>({
      query: (digits) =>
        `assessment/get_history_by_digits?digits=${encodeURIComponent(digits)}`,
    }),

    getAssessmentById: build.query<ApiResponse<AssessmentOut>, string>({
      query: (assessment_id) =>
        `assessment/get_assessment_by_id?assessment_id=${encodeURIComponent(assessment_id)}`,
      providesTags: (result, error, arg) => [{ type: "Assessment", id: arg }],
    }),

    deleteAssessmentById: build.mutation<ApiResponse<MessageModel>, string>({
      query: (assessment_id) => ({
        url: `assessment/delete_by_id?assessment_id=${encodeURIComponent(assessment_id)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assessment"],
    }),

    // saveImage: build.mutation<
    //   ApiResponse<MessageModel>,
    //   { assessment_id: string; form: FormData }
    // >({
    //   query: ({ assessment_id, form }) => ({
    //     url: `assessment/save_image?assessment_id=${encodeURIComponent(assessment_id)}`,
    //     method: "POST",
    //     body: form,
    //   }),
    //   invalidatesTags: ["Assessment"],
    // }),

    // Auth / Token endpoints
    login: build.mutation<
      ApiResponse<TokenResponse>,
      { username: string; password: string } | any
    >({
      query: (body) => ({
        url: "token",
        method: "POST",
        // token endpoint expects x-www-form-urlencoded by backend
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          typeof body === "string"
            ? body
            : `grant_type=password&username=${encodeURIComponent(body.username)}&password=${encodeURIComponent(body.password)}`,
      }),
      invalidatesTags: ["User"],
    }),
    refreshToken: build.mutation<
      ApiResponse<TokenResponse>,
      RefreshTokenRequest
    >({
      query: (body) => ({ url: "token/refresh", method: "POST", body }),
      // invalidatesTags: ["Auth"],
    }),
    revokeToken: build.mutation<ApiResponse<MessageModel>, RefreshTokenRequest>(
      {
        query: (body) => ({ url: "token/revoke", method: "POST", body }),
        // invalidatesTags: ["Auth"],
      },
    ),

    // User endpoints
    getMe: build.query<ApiResponse<UserPublic>, void>({
      query: () => "user/me",
      providesTags: ["User"],
    }),
    signup: build.mutation<ApiResponse<MessageModel>, UserSchema>({
      query: (body) => ({ url: "user/signup", method: "POST", body }),
    }),
    updateUser: build.mutation<ApiResponse<MessageModel>, Partial<UserSchema>>({
      query: (body) => ({ url: "user/update", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    // confirmEmail: build.query<ApiResponse<MessageModel>, string>({
    //   query: (token) => `user/confirm/${encodeURIComponent(token)}`,
    // }),
    getLocations: build.query<ApiResponse<CityChoice[]>, void>({
      query: () => "user/locations",
    }),
    sendEmail: build.query<ApiResponse<MessageModel>, string>({
      query: (send_to) =>
        `user/send_email?send_to=${encodeURIComponent(send_to)}`,
    }),
    changeUsername: build.mutation<ApiResponse<MessageModel>, UsernameUpdate>({
      query: (body) => ({ url: "user/username", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    changeEmail: build.mutation<ApiResponse<MessageModel>, EmailUpdate>({
      query: (body) => ({ url: "user/email", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useCheckNumberMutation,
  // useSaveNumberInfoMutation,
  useSubmitAssessmentMutation,
  useGetNumberQuery,
  useGetHistoryQuery,
  useGetPageCountQuery,
  useGetHistoryByDigitsQuery,
  useGetAssessmentByIdQuery,
  useDeleteAssessmentByIdMutation,
  // useSaveImageMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useRevokeTokenMutation,
  useGetMeQuery,
  useSignupMutation,
  useUpdateUserMutation,
  // useConfirmEmailQuery,
  useGetLocationsQuery,
  useSendEmailQuery,
  useChangeUsernameMutation,
  useChangeEmailMutation,
} = mobileApi;

export default mobileApi;
