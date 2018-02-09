#!/bin/bash
#-----------------------#
# Publish A New Release #
#-----------------------#
#
# @author Max Milton <max@wearegenki.com>
# @licence MIT (see ../LICENCE.md)
#

# stop on error
set -eo errtrace
trap 'echo -e "\n\e[1;31m❌ RELEASE FAILED\e[0m"' ERR

# global variables
NAME=$(jq --raw-output .name package.json)
VERSION=$(jq --raw-output .version_name dist/manifest.json)
APP_ID=cpcibnbdmpmcmnkhoiilpnlaepkepknb

# feedback utilities
echo_err() { echo -e "\n\e[1;31mERROR:\e[0m $1" 1>&2; echo -en "\a"; }
echo_info() { echo -e "\n\e[33m$1\e[0m\n" >&1; }

# run script relative to project root
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"/..

make_zip() { zip -9 -j "dist/$NAME.zip" dist/*; }

# create zip file and exit if requested
if [[ "$1" == "--zip-only" ]]; then
  NO_SOURCE_MAP_URL=true yarn run build
  make_zip
  echo -e "\n\e[1;32m✅ ZIP FILE FINISHED \e[0m"
  exit 0
fi

# check we're on the git "master" branch
GIT_BRANCH=$(git symbolic-ref --short HEAD)
[[ "$GIT_BRANCH" != "master" ]] && { echo_err 'Not on git "master" branch'; exit 1; }

# interactive initial setup
echo -e "\n\e[1;97;44m$NAME $VERSION\e[0m\n"
read -p "Create release for this version? (y/n) " -n 1 -r
[[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
echo
read -p "Publish to Google Chrome Webstore? (y/n) " -n 1 -r
[[ $REPLY =~ ^[Yy]$ ]] && publish_chrome=1

# run build
echo_info "[1/7] Building project..."
NO_SOURCE_MAP_URL=true yarn run build

# create zip package
echo_info "[2/7] Packing into zip..."
make_zip

# only publish if requested
if [[ ! -z "$publish_chrome" ]]; then
  # Google Webstore variables
  GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:?Environment variable not found}"
  GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:?Environment variable not found}"
  GOOGLE_REFRESH_TOKEN="${GOOGLE_REFRESH_TOKEN:?Environment variable not found}"

  # get access token
  echo_info "[3/7] Getting Google access token..."
  GOOGLE_ACCESS_TOKEN="$(curl https://www.googleapis.com/oauth2/v4/token -q \
    -d "client_id=$GOOGLE_CLIENT_ID&client_secret=$GOOGLE_CLIENT_SECRET&refresh_token=$GOOGLE_REFRESH_TOKEN&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" \
    | jq --raw-output .access_token)"

  # upload to Google Chrome Webstore
  echo_info "[4/7] Uploading to Google Chrome Webstore..."
  curl "https://www.googleapis.com/upload/chromewebstore/v1.1/items/$APP_ID" \
    -H "Authorization: Bearer $GOOGLE_ACCESS_TOKEN"  \
    -H "x-goog-api-version: 2" \
    -X PUT \
    -T "$NAME.zip" \
    --progress-bar

  # publish chrome extension
  echo_info "[5/7] Publishing Chrome extension..."
  curl "https://www.googleapis.com/chromewebstore/v1.1/items/$APP_ID/publish" \
    -H "Authorization: Bearer $GOOGLE_ACCESS_TOKEN"  \
    -X POST \
    -d ""
fi

# Sentry variables
SENTRY_API_KEY="${SENTRY_API_KEY:?Environment variable not found}"

# FIXME: this borrowed code is out of date; use https://docs.sentry.io/learn/releases/

# create release in Sentry
echo_info "[6/7] Creating Sentry release..."
curl "https://app.getsentry.com/api/0/projects/we-are-genki/$NAME/releases/" \
  -u "$SENTRY_API_KEY": \
  -X POST \
  -d '{"version": "'"$VERSION"'"}' \
  -H 'Content-Type: application/json'

# upload source files to Sentry
echo_info "[7/7] Uploading source files to Sentry..."
for file in dist/src/*.js*; do
  echo "$file"
  NAME="chrome-extension://$APP_ID/src/$(basename "$file")"

  curl "https://app.getsentry.com/api/0/projects/we-are-genki/$NAME/releases/$VERSION/files/" \
    -u "$SENTRY_API_KEY": \
    -X POST \
    -F file=@"$file" \
    -F name="$NAME" \
    -w "%{http_code}\n"
done

echo -e "\n\e[1;32m✅ RELEASE COMPLETE\e[0m"
