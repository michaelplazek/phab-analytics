import {
  prompt,
  rl,
  getUserPhid,
  getCurrentUser,
  printError,
  getDiffsByUser,
  getReviewsByUser,
  calculateTotalMonthlyAverage,
  calculateSegmentedMonthlyAverages,
} from "./utils.js";

(async () => {
  try {
    if (!process.env.API_TOKEN) {
      return printError(
        "Please set an API_TOKEN with the Conduit API Token found in your Phabricator settings"
      );
    }

    if (!process.env.BEARER_TOKEN) {
      return printError(
        'Please set a BEARER_TOKEN by using the following command: "export BEARER_TOKEN=$(usso -print -ussh code.uberinternal.com 2>&1 | tail -n 1)"'
      );
    }

    let username = await prompt(
      "\nEnter Phabricator username or leave blank to use current user\n\n"
    );

    let userPhid;
    if (username) {
      userPhid = await getUserPhid(username);
    } else {
      const { phid, username: currentUsername } = await getCurrentUser();
      userPhid = phid;
      username = currentUsername;
      console.log(`Using ${currentUsername}\n`);
    }

    if (!userPhid) {
      return printError("User not found. Try using a different username.");
    }

    const option = await prompt(
      "\nSelect option:\n\n1. Get average monthly diff counts\n2. Get average monthly review counts\n\n"
    );

    switch (option) {
      case "1":
        return await handleAverageDiffsOption(username, userPhid);
      case "2":
        return await handleAverageReviewsOption(username, userPhid);
      default:
        console.error("Invalid choice. Try again.");
    }
  } catch (e) {
    console.error(e);
    rl.close();
  }
})();

async function handleAverageDiffsOption(username, userPhid) {
  const diffs = await getDiffsByUser(userPhid);
  const averageDiffs = calculateTotalMonthlyAverage(diffs);
  const {
    averagePastMonth,
    averagePastThreeMonths,
    averagePastSixMonths,
    averagePastYear,
  } = calculateSegmentedMonthlyAverages(diffs);
  console.log(`\nAverage Diff Count for ${username} (${userPhid})\n`);
  console.log(
    `Entire historical average number of monthly diffs: ${averageDiffs.toFixed(
      2
    )}`
  );
  console.log(
    `Average number of diffs in last month: ${averagePastMonth.toFixed(2)}`
  );
  console.log(
    `Average number of diffs in last 3 months: ${averagePastThreeMonths.toFixed(
      2
    )}`
  );
  console.log(
    `Average number of diffs in last 6 months: ${averagePastSixMonths.toFixed(
      2
    )}`
  );
  console.log(
    `Average number of diffs in last year: ${averagePastYear.toFixed(2)}`
  );
  rl.close();
}

async function handleAverageReviewsOption(username, userPhid) {
  const reviews = await getReviewsByUser(userPhid);
  const averageReviews = calculateTotalMonthlyAverage(reviews);
  const {
    averagePastMonth,
    averagePastThreeMonths,
    averagePastSixMonths,
    averagePastYear,
  } = calculateSegmentedMonthlyAverages(reviews);
  console.log(`\nAverage Review Count for ${username} (${userPhid})\n`);
  console.log(
    `Entire historical average number of monthly reviews: ${averageReviews.toFixed(
      2
    )}`
  );
  console.log(
    `Average number of reviews in last month: ${averagePastMonth.toFixed(2)}`
  );
  console.log(
    `Average number of reviews in last 3 months: ${averagePastThreeMonths.toFixed(
      2
    )}`
  );
  console.log(
    `Average number of reviews in last 6 months: ${averagePastSixMonths.toFixed(
      2
    )}`
  );
  console.log(
    `Average number of reviews in last year: ${averagePastYear.toFixed(2)}`
  );
  rl.close();
}
