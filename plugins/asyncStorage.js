const { withGradleProperties } = require('@expo/config-plugins')

module.exports = function withModifyGradle(config) {
  return withGradleProperties(config, config => {
    config.modResults.push({
      type: 'property',
      key: 'AsyncStorage_db_size_in_MB',
      value: 1000,
    });
    return config;
  });
};