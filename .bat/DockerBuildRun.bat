:: Build the image with tag pointing to the minikube local registry
call ./.bat/DockerBuild.bat
:: Run the built image in a container
call ./.bat/DockerRun.bat