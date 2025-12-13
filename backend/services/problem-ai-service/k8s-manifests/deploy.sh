# build img and push to docker hub
# docker build -t mightyshashank/codecollab:problem-ai-service-image-v5 .
# docker push mightyshashank/codecollab:problem-ai-service-image-v5

# 1. Apply the Secret and ConfigMap first, as the Deployment depends on them.
kubectl apply -f problem-ai-service-deployment-secrets.yaml
kubectl apply -f problem-ai-service-configmap.yaml

# 2. Apply the Deployment, which creates the pods.
kubectl apply -f problem-ai-service-deployment.yaml

# 3. Apply the Service to give the pods a stable network address.
kubectl apply -f problem-ai-service-service.yaml

# 4. Apply the BackendConfig to configure the health checks for the Service.
# kubectl apply -f problem-ai-service-backend-config.yaml

# 5. Apply the HPA last to manage the scaling of the Deployment.
kubectl apply -f problem-ai-service-hpa.yaml