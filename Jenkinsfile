pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "mightyshashank"
        IMAGE_TAG = "latest"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {

        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Detect Changes") {
            steps {
                script {
                    CHANGED_FILES = sh(
                        script: "git diff --name-only HEAD~1 HEAD",
                        returnStdout: true
                    ).trim().split("\n")

                    echo "Changed files:"
                    CHANGED_FILES.each { echo it }
                }
            }
        }

        stage("Build, Push & Deploy (Changed Only)") {
            parallel {

                /* ================= FRONTEND ================= */

                stage("frontend") {
                    when {
                        expression {
                            CHANGED_FILES.any { it.startsWith("frontend/") }
                        }
                    }
                    steps {
                        sh """
                        ansible-playbook \
                            -i ansible/inventory.ini \
                            ansible/deploy-frontend.yml
                        """
                    }
                }


                /* ================= API GATEWAY ================= */

                stage("api-gateway") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/api-gateway/") } } }
                    steps {
                        dir("backend/services/api-gateway") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/api-gateway:latest .
                                  docker push mightyshashank/api-gateway:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-api-gateway.yml
                        """
                    }
                }

                /* ================= AUTH ================= */

                stage("auth") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/auth/") } } }
                    steps {
                        dir("backend/services/auth") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/auth:latest .
                                  docker push mightyshashank/auth:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-auth.yml
                        """
                    }
                }

                /* ================= BOILER PLATE ================= */

                stage("boiler-plate-generator") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/boiler-plate-generator/") } } }
                    steps {
                        dir("backend/services/boiler-plate-generator") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/boiler-plate-generator:latest .
                                  docker push mightyshashank/boiler-plate-generator:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-boiler-plate-generator.yml
                        """
                    }
                }

                /* ================= PROBLEM AI ================= */

                stage("problem-ai-service") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/problem-ai-service/") } } }
                    steps {
                        dir("backend/services/problem-ai-service") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/problem-ai-service:latest .
                                  docker push mightyshashank/problem-ai-service:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-problem-ai-service.yml
                        """
                    }
                }

                /* ================= WEBHOOK SERVER ================= */

                stage("webhook-server") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/webhook-server/") } } }
                    steps {
                        dir("backend/services/webhook-server") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/webhook-server:latest .
                                  docker push mightyshashank/webhook-server:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-webhook-server.yml
                        """
                    }
                }

                /* ================= CALLBACK ================= */

                stage("webhook-callback-endpoint") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/webhook-callback-endpoint/") } } }
                    steps {
                        dir("backend/services/webhook-callback-endpoint") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/webhook-callback-endpoint:latest .
                                  docker push mightyshashank/webhook-callback-endpoint:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-webhook-callback-endpoint.yml
                        """
                    }
                }

                /* ================= URL PARSER ================= */

                stage("url-parser") {
                    when { expression { CHANGED_FILES.any { it.startsWith("backend/services/url-parser/") } } }
                    steps {
                        dir("backend/services/url-parser") {
                            withCredentials([
                                usernamePassword(
                                    credentialsId: 'dockerhub-creds',
                                    usernameVariable: 'DOCKER_USER',
                                    passwordVariable: 'DOCKER_PASS'
                                )
                            ]) {
                                sh """
                                  echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                                  docker build -t mightyshashank/url-parser:latest .
                                  docker push mightyshashank/url-parser:latest
                                """
                            }
                        }

                        sh """
                          ansible-playbook -i ansible/inventory.ini ansible/deploy-url-parser.yml
                        """
                    }
                }
            }
        }
    }
}
