#!/bin/bash
set -e  # Exit if any command fails
# kubectl delete namespace judge0 ingress-nginx server # to clear already existing ones
echo "🚀 Starting Judge0 Kubernetes deployment..."

# 1. Create namespace
echo "📦 Creating namespace..."
kubectl apply -f k8s-global/namespaces.yaml

# 2. Apply global secrets (judge0-env.yaml, express-env.yaml, etc.)
echo "🔑 Applying secrets..."
kubectl apply -f k8s-global/secrets/judge0-env.yaml
# kubectl apply -f k8s-global/secrets/express-env.yaml

# 3. Deploy Postgres
echo "🐘 Deploying Postgres..."
kubectl apply -f judge0/postgres/deployment.yaml
kubectl apply -f judge0/postgres/service.yaml
# Autoscaling Postgres
echo "📈 Applying Postgres autoscaler..."
kubectl apply -f judge0/postgres/hpa.yaml

# Redis deployment
echo "⚙️ Deploying Redis Deployment..."
kubectl apply -f judge0/redis/values.yaml

# 7. Apply Redis Autoscaler
echo "📈 Applying Redis autoscaler..."
kubectl apply -f judge0/redis/hpa.yaml

# 8. Apply redis service, it connects to redis-master
echo "🖥️ Applying Redis service"
kubectl apply -f judge0/redis/service.yaml

# 4. Deploy Judge0 API Server
echo "🖥️ Deploying Judge0 API Server..."
kubectl apply -f judge0/judge0-api-server/deployment.yaml
kubectl apply -f judge0/judge0-api-server/service.yaml
# Autoscaling API Server
echo "📈 Applying Judge0 API Server autoscaler..."
kubectl apply -f judge0/judge0-api-server/hpa.yaml

# 5. Deploy Judge0 Worker
echo "⚙️ Deploying Judge0 Worker..."
kubectl apply -f judge0/judge0-worker/deployment.yaml
kubectl apply -f judge0/judge0-worker/service.yaml
# Autoscaling Judge0 worker
echo "📈 Applying Judge0 Worker autoscaler..."
kubectl apply -f judge0/judge0-worker/hpa.yaml

# 6. Deploy Redis using Helm with Bitnami chart
# echo "🗄️ Installing Redis..."
# helm repo add bitnami https://charts.bitnami.com/bitnami
# helm repo update
# helm install redis-simple bitnami/redis \
#   --namespace judge0 \
#   --set architecture=standalone \
#   --set auth.enabled=false \
#   --set persistence.enabled=false



# 8 Deploy Nginx ingress controller
echo "📈 Applying Nginx ingress controller..."
kubectl apply -f k8s-global/ingress-controller/nginx-configmap.yaml
kubectl apply -f k8s-global/ingress-controller/nginx-deploy.yaml
kubectl apply -f k8s-global/ingress-controller/nginx-service.yaml



# To run the above do:
# Step 1 (make an executable): 
    # chmod +x deploy_judge0.sh
# Step 2 (Run the above executable)
    # ./deploy_judge0.sh
