# apply manifests
kubectl apply -f url-parser-secret.yaml
kubectl apply -f url-parser-deployment.yaml
kubectl apply -f url-parser-backend-config.yaml
kubectl apply -f url-parser-service.yaml   # if needed
kubectl apply -f url-parser-hpa.yaml                # optional

# build img and push to docker hub
# docker build -t mightyshashank/codecollab:url-parser-server-image-v14 .
# docker push mightyshashank/codecollab:url-parser-server-image-v14

# apply manifests
# kubectl delete -f url-parser-secret.yaml
# kubectl delete -f url-parser-deployment.yaml
# kubectl delete -f url-parser-backend-config.yaml
# kubectl delete -f url-parser-service.yaml   # if needed
# kubectl delete -f url-parser-hpa.yaml     