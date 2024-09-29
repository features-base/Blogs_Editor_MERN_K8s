:: Starts minikube cluster
minikube start
:: Starts a local registry within minikube and exposes it to localhost:5000
minikube addons enable registry
kubectl port-forward --namespace kube-system service/registry 5000:80 