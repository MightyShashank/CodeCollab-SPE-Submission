# kubectl delete -f backend-config.yaml
kubectl delete -f configmap.yaml
kubectl delete -f secret.yaml
kubectl delete -f deployment.yaml
kubectl delete -f service-lb.yaml
kubectl delete -f service-internal.yaml   # if needed
kubectl delete -f hpa.yaml  