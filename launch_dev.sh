#!/bin/sh
docker build -t photo_triage . && clear && docker run -it --rm --name photo-triage -v /tmp/srv:/srv -p 9000:9000 photo_triage
