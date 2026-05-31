// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: ['expo-router/babel', 'react-native-reanimated/plugin'],
//   };
// };


module.exports = function (api) {
  api.cache(true);
  return {
    // ЖЕСТКО контролируем, что эти две строки находятся в presets, а не в plugins!
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Если у тебя используются другие плагины (например, для reanimated), 
      // они должны быть ТУТ. Но nativewind и expo-router здесь быть НЕ должно.
      // 'react-native-reanimated/plugin', // (опционально, если требует твоя версия reanimated)
    ],
  };
};