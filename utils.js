import fetch, { Headers } from "node-fetch";
import { URLSearchParams } from "url";
import readline from "readline";

const apiToken = process.env.API_TOKEN;
const bearerToken = process.env.BEARER_TOKEN;

const phabUrl = "https://code.uberinternal.com";

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const prompt = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

function getConduitUrl(endpoint) {
  return `${phabUrl}/api/${endpoint}`;
}

async function callConduit(endpoint, params) {
  params["api.token"] = apiToken;
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${bearerToken}`,
  };
  const options = {
    method: "POST",
    body: new URLSearchParams(params),
    headers,
  };
  const response = await fetch(getConduitUrl(endpoint), options);

  const data = await response.json();
  return data.result;
}

export async function getUserPhid(username) {
  const result = await callConduit("user.search", {
    "constraints[usernames][0]": username,
  });

  if (result?.data?.length > 0) {
    return result.data[0].phid;
  }

  return null;
}

export async function getCurrentUser() {
  const result = await callConduit("user.whoami", {});
  return { phid: result?.phid, username: result?.userName };
}

export async function getDiffsByUser(userPhid) {
  let after = 0;
  const commits = [];

  while (true) {
    const result = await callConduit("differential.revision.search", {
      "constraints[authorPHIDs][0]": userPhid,
      after: after,
    });

    commits.push(...result.data);
    after = result.cursor.after;

    if (after === null) {
      break;
    }
  }

  return commits;
}

export async function getReviewsByUser(userPhid) {
  let after = 0;
  const commits = [];

  while (true) {
    const result = await callConduit("differential.revision.search", {
      "constraints[reviewerPHIDs][0]": userPhid,
      after: after,
    });

    commits.push(...result.data);
    after = result.cursor.after;

    if (after === null) {
      break;
    }
  }

  return commits;
}

export function calculateTotalMonthlyAverage(diffs) {
  const monthlyDiffs = {};

  for (const diff of diffs) {
    const timestamp = diff.fields.dateCreated;
    const date = new Date(timestamp * 1000);
    const yearMonth = date.toISOString().slice(0, 7);

    if (monthlyDiffs[yearMonth] === undefined) {
      monthlyDiffs[yearMonth] = 0;
    }

    monthlyDiffs[yearMonth] += 1;
  }

  const totalDiffs = Object.values(monthlyDiffs).reduce((a, b) => a + b, 0);
  const numMonths = Object.keys(monthlyDiffs).length;
  const averageDiffs = numMonths > 0 ? totalDiffs / numMonths : 0;

  return averageDiffs;
}

export function calculateSegmentedMonthlyAverages(diffs) {
  const now = new Date();
  const monthlyDiffs = {};

  for (const diff of diffs) {
    const timestamp = diff.fields.dateCreated;
    const date = new Date(timestamp * 1000);
    const yearMonth = date.toISOString().slice(0, 7);

    if (monthlyDiffs[yearMonth] === undefined) {
      monthlyDiffs[yearMonth] = 0;
    }

    monthlyDiffs[yearMonth] += 1;
  }

  function getAverageForPastMonths(months) {
    const targetDate = new Date(now);
    targetDate.setMonth(targetDate.getMonth() - months);
    const filteredMonths = Object.keys(monthlyDiffs).filter(
      (yearMonth) => yearMonth >= targetDate.toISOString().slice(0, 7)
    );

    const totalDiffs = filteredMonths.reduce(
      (accumulator, yearMonth) => accumulator + monthlyDiffs[yearMonth],
      0
    );
    const numMonths = filteredMonths.length;

    return numMonths > 0 ? totalDiffs / numMonths : 0;
  }

  const averagePastMonth = getAverageForPastMonths(1);
  const averagePastThreeMonths = getAverageForPastMonths(3);
  const averagePastSixMonths = getAverageForPastMonths(6);
  const averagePastYear = getAverageForPastMonths(12);

  return {
    averagePastMonth,
    averagePastThreeMonths,
    averagePastSixMonths,
    averagePastYear,
  };
}

export function printError(error) {
  console.error(error);
  rl.close();
}
