export default {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    transformIgnorePatterns: [
        "/node_modules/",
    ],
    transform: {
        "^.+\\.jsx?$": "babel-jest",
        "^.+\\.tsx?$": "ts-jest"
    }
}