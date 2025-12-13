kubectl delete -f problem-ai-service-deployment-secrets.yaml
kubectl delete -f problem-ai-service-deployment.yaml
kubectl delete -f problem-ai-service-service.yaml   # if needed
kubectl delete -f problem-ai-service-hpa.yaml  