kubectl apply -f callback-url-deployment.yaml
kubectl apply -f callback-url-service.yaml

# kubectl rollout status deployment/codecollab-callback-url
# kubectl get pods -l app=codecollab-callback-url -o wide
# kubectl get svc codecollab-callback-url -o wide

# enable HPA
kubectl apply -f callback-url-hpa.yaml
# kubectl get hpa


# Above stuff for the callback url can now be accessed as:
# http://codecollab-callback-url.default.svc.cluster.local:3000/webhook
