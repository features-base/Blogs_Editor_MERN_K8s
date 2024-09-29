::  NOTE: This batch is to be run only if the local docker daemon is running inside a virtual machine.
::      Docker desktop by default runs in the host environment and not inside any VM.

::  Redirects the docker VM's http://localhost:5000 to the host environment's http://localhost:5000
::      It can be used to push local images to minikube local registry
::  NOTE: The command requires a seperate running terminal kept open. 
docker run --rm -it --network=host alpine ash -c "apk add socat && socat TCP-LISTEN:5000,reuseaddr,fork TCP:host.docker.internal:5000"