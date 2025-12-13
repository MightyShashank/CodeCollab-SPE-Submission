# infra/minio

Files:
- secret.yaml
- pvc.yaml
- deployment.yaml
- services.yaml
- init-bucket-job.yaml

Apply order:
1. kubectl apply -f secret.yaml
2. kubectl apply -f pvc.yaml
3. kubectl apply -f deployment.yaml
4. kubectl apply -f services.yaml
5. kubectl apply -f init-bucket-job.yaml

Check status:
- kubectl get pods -l app=minio
- kubectl get pvc minio-pvc
- kubectl get svc minio minio-console
- kubectl logs job/minio-init-bucket

Port-forward console (local use):
- kubectl port-forward svc/minio-console 9001:9001
  open http://localhost:9001 (login = minioadmin / minioadmin)

Port-forward S3 endpoint (local use):
- kubectl port-forward svc/minio 9000:9000

Remove:
- kubectl delete -f init-bucket-job.yaml
- kubectl delete -f services.yaml
- kubectl delete -f deployment.yaml
- kubectl delete -f pvc.yaml
- kubectl delete -f secret.yaml


To see if pod healthy:
- kubectl get pods -l app=minio

Job logs:
- kubectl logs job/minio-init-bucket

- open http://localhost:9001  (login: minioadmin / minioadmin)

- To view on console do the port forwarding:
- kubectl port-forward svc/minio-console 9001:9001
- user: minioadmin, password: minioadmin