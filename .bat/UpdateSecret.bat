node ./js_scripts/createK8sSecretManifest.js
kubectl apply -f ./k8s_specs/local-azure-secret.yaml
kubectl rollout restart deployment nodejs-deployment
kubectl get pods --watch