pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['qa', 'prod'], description: 'Select test environment')
    }

    stages {
        stage('Clean Reports') {
            steps {
                bat '''
                echo Cleaning old Allure results and reports...
                if exist allure-results ( rmdir /s /q allure-results )
                if exist allure-report ( rmdir /s /q allure-report )
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                bat '''
                echo Installing dependencies...
                npm ci
                '''
            }
        }

        stage('Install Browsers') {
            steps {
                bat '''
                echo Installing Playwright browsers...
                npx playwright install --with-deps
                '''
            }
        }

        stage('Run Playwright Tests') {
            steps {
                bat "echo Running tests for ${params.ENV} environment..."
                bat "npm run test:${params.ENV} -- --workers=1"
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

            // This line enables the Allure Report tab in Jenkins (after plugin installation)
            allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
        }
    }

}
