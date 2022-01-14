#!/bin/bash

function die {
  echo $1 >&2;
  exit 1;
}

[[ -n "$JSSHELL" ]] || die "Must set JSSHELL"
[[ -e "$JSSHELL" ]] || die "'$JSSHELL' does not exist"

TOTAL=0;
FAILS=0;

for f in tests/*.js; do
  TOTAL=$((TOTAL + 1))
  echo -n "$f ";
  if { $JSSHELL -m $f; } &> /dev/null; then
    echo "PASS";
  else
    echo "FAIL";
    FAILS=$((FAILS + 1))
  fi
done

echo "============================================================"
echo "$FAILS/$TOTAL tests failed"
