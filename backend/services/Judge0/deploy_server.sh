# 9. Deploying your express server
echo "📈 Applying express server..."
kubectl apply -f express-server/deployment.yaml
kubectl apply -f express-server/service.yaml
kubectl apply -f express-server/hpa.yaml
kubectl apply -f express-server/ingress.yaml
kubectl apply -f express-server/ratelimit-config.yaml

echo "✅ Deployment complete!"
