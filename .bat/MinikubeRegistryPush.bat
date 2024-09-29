docker push localhost:5000/articles-image
kubectl rollout restart deployment nodejs-deployment
kubectl get pods --watch