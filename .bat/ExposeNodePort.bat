:: Exposes the nodeport of the service to a localhost (http://127.0.0.1) port
del ./js_scripts/data/nodePortExposedUrl.txt
minikube service nodejs-server --url > ./js_scripts/data/nodePortExposedUrl.txt