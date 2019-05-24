#!/bin/bash
FILES="$(find content/notebooks -type f -name '*.ipynb')"
for f in $FILES
do
    nb2hugo $f --site-dir . --section posts
done
hugo 
