:: Stops and removes the container if already exists
docker stop articles-image
docker remove articles-image
::  Running the image in a container "articles-image" with port 443 exposed to port 443
docker run --rm -i --publish 443:443 --env-file=.azure.development.env ^
    --name articles-image localhost:5000/articles-image