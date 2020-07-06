module.exports = {
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	transform: {},
	setupFilesAfterEnv: ["<rootDir>/config/jest/setupTests.js"],
	testPathIgnorePatterns: [".notest."],
	testEnvironment: "jsdom",
	testURL: "http://localhost",
	transform: {
		"^.+\\.(js|jsx)$": "<rootDir>/node_modules/babel-jest",
		"^.+\\.(ts|tsx)$": "ts-jest",
		"^.+\\.css$": "<rootDir>/config/jest/cssTransform.js",
		"^(?!.*\\.(js|jsx|ts|tsx|css|json)$)": "<rootDir>/config/jest/fileTransform.js"
	},
	moduleDirectories: ["node_modules", "src"],
	transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$", "^.+\\.module\\.(css|sass|scss)$"]
};
