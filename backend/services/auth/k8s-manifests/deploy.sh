kubectl apply -f auth-secret.yaml
kubectl apply -f auth-configmap.yaml
kubectl apply -f auth-deployment.yaml
kubectl apply -f auth-service.yaml
kubectl apply -f auth-hpa.yaml
# kubectl apply -f auth-cronjob-cleanup.yaml

# build img and push to docker hub
# docker build -t mightyshashank/codecollab:auth-server-image-v23 .
# docker push mightyshashank/codecollab:auth-server-image-v23

# kubectl delete -f auth-secret.yaml
# kubectl delete -f auth-configmap.yaml
# kubectl delete -f auth-deployment.yaml
# kubectl delete -f auth-service.yaml
# kubectl delete -f auth-hpa.yaml
# kubectl delete -f auth-cronjob-cleanup.yaml