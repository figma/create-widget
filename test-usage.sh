#!/usr/bin/env bash

set -xueo pipefail

rm -rf test-artifacts
mkdir -p test-artifacts
pushd test-artifacts

# Without iframe
node ../cli -n CounterNoUI -p counter-no-ui-widget --iframe=N
pushd counter-no-ui-widget

if [ -d "ui-src/" ]; then
  echo "ERROR: Should not have ui-src folder in no-ui test case"
  exit 1
fi

npm run test
popd

# With iframe
node ../cli -n CounterWithUI -p counter-with-ui-widget --iframe=Y
pushd counter-with-ui-widget
npm run test
popd

popd
