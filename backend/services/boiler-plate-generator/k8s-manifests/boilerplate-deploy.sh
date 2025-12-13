# build img and push to docker hub
# DOCKER_BUILDKIT=0 docker build -t mightyshashank/codecollab:boilerplate-server-v4 .
# docker push mightyshashank/codecollab:boilerplate-server-v4

# kubectl apply -f boilerplate-backend-config.yaml
kubectl apply -f boilerplate-secret.yaml
kubectl apply -f boilerplate-deployment.yaml
kubectl apply -f boilerplate-service.yaml   # if needed
kubectl apply -f boilerplate-hpa.yaml      

# kubectl delete -f boilerplate-secret.yaml
# kubectl delete -f boilerplate-deployment.yaml
# kubectl delete -f boilerplate-service.yaml   # if needed
# kubectl delete -f boilerplate-hpa.yaml  