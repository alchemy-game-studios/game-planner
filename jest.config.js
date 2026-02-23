export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        "/node_modules/",
    ],
    transform: {
        "^.+\\.jsx?$": "babel-jest",
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    setupFiles: ["<rootDir>/jest.setup.js"],
    globals: {
        TextEncoder: TextEncoder,
        TextDecoder: TextDecoder,
    }
}