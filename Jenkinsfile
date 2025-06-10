pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['qa', 'prod'], description: 'Select test environment')
    }

    stages {
        stage('Clean Reports') {
            steps {
                bat 'echo Cleaning old Allure results and reports...'
                bat 'rmdir /s /q allure-results'
                bat 'rmdir /s /q allure-report'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'echo Installing dependencies...'
                bat 'npm ci'
            }
        }

        stage('Install Browsers') {
            steps {
                bat 'echo Installing Playwright browsers...'
                bat 'npx playwright install --with-deps'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                bat "echo Running tests for %ENV% environment..."
                bat "npm run test:%ENV% -- --workers=1"
            }
        }

        stage('Generate Allure Report') {
            steps {
                bat '"C:\\Program Files\\allure-2.34.0\\bin\\allure.bat" generate ./allure-results -c -o ./allure-report'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
        }
    }
}
