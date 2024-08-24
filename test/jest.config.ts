import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: './', // Root directory including both src and test
    testRegex: '.*\\.spec\\.ts$', // Pattern to match test files
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest', // Use ts-jest to transform TypeScript files
    },
    collectCoverage: true,
    coverageDirectory: 'coverage', // Directory to output coverage reports
    testPathIgnorePatterns: ['/node_modules/'], // Ignore node_modules folder
    moduleDirectories: ['node_modules', 'src'], // Directories to look for modules
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};

export default config;