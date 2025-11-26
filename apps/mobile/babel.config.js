module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // No plugins needed for env, Expo handles EXPO_PUBLIC_* automatically
  };
};



