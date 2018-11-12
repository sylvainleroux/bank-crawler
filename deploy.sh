#!/usr/bin/env bash

TARGET=pi
VERSION=`yarn -s run version`
PACKAGE_NAME="bank-crawler_${VERSION}_all.deb"

echo ${PACKAGE_NAME}

UUID=`uuidgen`
TMP_PATH=/tmp/$UUID

ssh ${TARGET} mkdir -p $TMP_PATH
scp ${PACKAGE_NAME} ${TARGET}:$TMP_PATH
ssh ${TARGET} sudo apt-get update
ssh ${TARGET} sudo QT_QPA_PLATFORM="offscreen" dpkg -i $TMP_PATH/*.deb
ssh ${TARGET} sudo QT_QPA_PLATFORM="offscreen" apt-get install -f -y
ssh ${TARGET} rm -Rf $TMP_PATH