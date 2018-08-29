#!/bin/sh
# This script is used for CI, when the deployment is not straightforward as with heroku.
# It is called by the CI deployment server, e.g. from `circle.yml` or `.travis.yml`.
# See this article about deployment http://the.webapp.cat/2015/07/Deploy-to-Gandi-Simple-Hosting.html
#
# Params:
# * $1 is the ssh host of the server, e.g. abcd@efg.com
# * $2 is the path on the server where we want the zip file to be deployed
# * $3 is the password for ssh
#
# Useful environement variables:
# * `SILEX_RELOAD_ROUTE`: the path to call to reboot the nodejs server

# ls a generated folder to check that compilation did go well
ls -al dist/client/js/

# zip Silex files to be deployed
zip -r silex.zip dist/server dist/client node_modules/ static/ package.json

# upload files to the server
echo 'put silex.zip' | sshpass -p "$3" sftp -o "StrictHostKeyChecking no" "$1:$2"

# unzip in a tmp folder
sshpass -p "$3" ssh "$1" "cd $2 && rm -rf tmp-deploy ; unzip silex.zip -d tmp-deploy"

# rename
sshpass -p "$3" ssh "$1" "cd $2 && rm silex.zip ; rm -rf old-Silex ; mv Silex old-Silex ; mv tmp-deploy Silex"

# reboot the server
sshpass -p "$3" ssh "$1" "shutdown -r now"

