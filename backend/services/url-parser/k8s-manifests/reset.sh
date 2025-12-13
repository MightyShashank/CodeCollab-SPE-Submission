kubectl delete -f url-parser-deployment.yaml
kubectl delete -f url-parser-hpa.yaml
kubectl delete -f url-parser-secret.yaml   # if needed
kubectl delete -f url-parser-service.yaml  