# phabulous-analytics
Run analytics on Phabricator users to determine things like monthly diff/review counts.

## Usage
This script requires [NodeJS](https://nodejs.dev/en/download/) to be installed.

### Configuring credentials
This script uses both an API token from Phabricator and an SSO bearer token for auth to make calls to the Phabricator instance.

#### Set `API_TOKEN`
1. Go to Phabricator > Settings > Conduit API Tokens: https://code.companyinternal.com/settings/user/{your-username}/page/apitokens
2. Copy the Command Line API Token there
3. Set your environment variable: `export API_TOKEN="<copied token>"`

#### Set `BEARER_TOKEN`
1. Establish a ussh session in your shell
2. Run the following command: `export BEARER_TOKEN=$(usso -print -ussh code.companyinternal.com 2>&1 | tail -n 1)`

#### Set `BASE_URL`
Set the `BASE_URL` of the Phabricator instance: `export BASE_URL="https://code.companyinternal.com"`

### Starting the app
Run `npm install && npm start`
