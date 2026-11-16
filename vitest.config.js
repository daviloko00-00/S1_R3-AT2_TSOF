import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: ['src/**/*.js'],
            exclude: ['src/server.js']
        },
        projects: [
            {
                test: {
                    name: 'unit',
                    environment: 'node',
                    include: ['src/tests/**/*.test.js']
                }
            },
            {
                test: {
                    name: 'integration',
                    environment: 'node',
                    include: ['test/**/*.test.js'],
                    globalSetup: ['./test/globalSetup.js'],
                    fileParallelism: false,
                    testTimeout: 15000,
                    hookTimeout: 30000
                }
            }
        ]
    }
});
