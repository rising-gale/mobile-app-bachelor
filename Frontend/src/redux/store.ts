// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import mobileApi from './api';

export const store = configureStore({
  reducer: {
    [mobileApi.reducerPath]: mobileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Отключаем проверку на сериализуемость, если ты планируешь передавать 
      // сырые FormData (например, для картинок) через локальный Redux
      serializableCheck: false, 
    }).concat(mobileApi.middleware),
});

// 3. Опционально, но очень полезно для мобильных приложений:
// Включает возможность refetchOnFocus (перезапрос данных при возвращении приложения из бэкграунда)
setupListeners(store.dispatch);

// Экспортируем типы для будущего использования в TypeScript хуках
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;