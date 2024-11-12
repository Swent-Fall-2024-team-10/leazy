module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
      '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(firebase|@firebase|react-native-elements|@react-native|react-native|react-native-gesture-handler|react-native-reanimated|expo|react-native-size-matters)/)',
    ],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',  // Adjust the path according to your project structure
    },
  };