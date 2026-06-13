/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(ts|tsx)$': [ 'ts-jest', {
            tsconfig: 'tsconfig.test.json',
        } ],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: [ '<rootDir>/tests/**/*.test.(ts|tsx)' ],
    collectCoverageFrom: [
        'src/engine/**/*.ts',
        'src/utils/**/*.ts',
        '!src/**/*.d.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },
};

module.exports = config;
