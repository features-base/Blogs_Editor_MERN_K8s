:: Build the image with tag pointing to the minikube local registry
docker build -t localhost:5000/articles-image .
:: Run the built image in a container
./.bat/DockerRun.bat