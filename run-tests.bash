#!/bin/bash

function die {
  echo $1 >&2;
  exit 1;
}

[[ -n "$JSSHELL" ]] || die "Must set JSSHELL"
[[ -e "$JSSHELL" ]] || die "'$JSSHELL' does not exist"

PLAIN=$(  echo -en '\e[0m')
BOLD=$(   tput bold)
RED=$(    tput setaf 1)
GREEN=$(  tput setaf 2)

TOTAL=0;
FAILS=0;

for f in tests/*.js; do
  TOTAL=$((TOTAL + 1))
  printf "%-26s " $f;
  if { $JSSHELL -m $f; } &> /dev/null; then
    echo "${GREEN}PASS${PLAIN}";
  else
    echo "${BOLD}${RED}FAIL${PLAIN}";
    FAILS=$((FAILS + 1))
  fi
done

echo "============================================================"
echo "$FAILS/$TOTAL tests failed"
