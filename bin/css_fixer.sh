#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"
cd ..
sed -i .sedbak 's/url("images/url("chrome-extension:\/\/__MSG_@@extension_id__\/images/g' css/*
cd css
find . -name "*.sedbak" | xargs rm
cd ..
