module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(firebase|@firebase|react-native-elements|react-native|expo|@expo|expo-font|expo-constants|expo-sqlite|expo-modules-core)/)'    ],
  };