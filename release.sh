#!/bin/bash

set -ex

# ensure working dir is clean
git status
if [[ -z $(git status -s) ]]
then
  echo "tree is clean"
else
  echo "tree is dirty, please commit changes before running this"
  exit 1
fi

image="iron/functions-ui"

git pull

version_file="package.json"
if [ -z $(grep -m1 -Eo "[0-9]+\.[0-9]+\.[0-9]+" $version_file) ]; then
  echo "did not find semantic version in $version_file"
  exit 1
fi
# https://github.com/treeder/dockers/tree/master/bump
docker run --rm -it -v $PWD:/app -w /app treeder/bump --filename package.json patch
version=$(grep -m1 -Eo "[0-9]+\.[0-9]+\.[0-9]+" $version_file)
echo "Version: $version"

./build.sh

tag="$version"
git add -u
git commit -m "functions-ui: $version [skip ci]"
git tag -f -a $tag -m "functions-ui: $version"
git push
git push origin $tag

docker tag $image:latest $image:$version
docker push $image:$version
docker push $image:latest
