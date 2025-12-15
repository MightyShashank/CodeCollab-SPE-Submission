# 1. Apply the configuration and secrets first
kubectl apply -f api-gateway-configmap.yaml

# 2. Apply the deployment, which uses the configmap/secret
kubectl apply -f api-gateway-deployment.yaml

# 3. Apply the service, which exposes the deployment
kubectl apply -f api-gateway-service.yaml

# 4. Apply the backend config, which annotates the service (This below things is needed only on GCP)
# kubectl apply -f api-gateway-backend-config.yaml 

# 5. Apply the HPA last, as it targets the deployment
kubectl apply -f api-gateway-hpa.yaml

echo "API Gateway deployment complete!"
# kubectl delete -f api-gateway-configmap.yaml
# kubectl delete -f api-gateway-deployment.yaml
# kubectl delete -f api-gateway-service.yaml
# kubectl delete -f api-gateway-backend-config.yaml
# kubectl delete -f api-gateway-hpa.yaml

# DOCKER_BUILDKIT=0 docker build -t mightyshashank/codecollab:api-gateway-image-v64 .
# docker push mightyshashank/codecollab:api-gateway-image-v64
