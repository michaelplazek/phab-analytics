# phab-analytics
Run analytics on Uber Phabricator users to determine things like monthly diff/review counts.

## Usage

### Configuring credentials
This script uses both an API token from Phabricator and an SSO bearer token for auth to make calls to the Phabricator instance.

#### Set `API_TOKEN`
1. Go to Phabricator > Settings > Conduit API Tokens: https://code.uberinternal.com/settings/user/{your-username}/page/apitokens
2. Copy the Command Line API Token there
3. Set your environment variable: `export API_TOKEN="<copied token>"`

#### Set `BEARER_TOKEN`
1. Establish a ussh session in your shell
2. Run the following command: `export BEARER_TOKEN=$(usso -print -ussh code.uberinternal.com 2>&1 | tail -n 1)`

### Starting the app
1. Set the `BASE_URL` of the Phabricator instance: `export BASE_URL="https://code.uberinternal.com"`
2. Run `npm install && npm start`
