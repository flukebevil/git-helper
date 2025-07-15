#!/usr/bin/env node
import { execSync } from "child_process";
import chalk from "chalk";
import readlineSync from "readline-sync";

const exceptBranches = ["main"];

const selectPaginationItem = (items) => {
  if (!items || !items.length) {
    return -1;
  }

  const MAX_ITEMS = 8,
    MAX_PAGE_INDEX = Math.ceil(items.length / MAX_ITEMS) - 1;

  let pageIndex = 0;
  while (true) {
    const PAGE_ITEMS = [];
    let indexPrev = -1,
      indexNext = -1;
    if (pageIndex > 0) {
      PAGE_ITEMS.push(`(PREVIOUS ${MAX_ITEMS} items)`);
      indexPrev = PAGE_ITEMS.length - 1;
    }
    Array.prototype.push.apply(
      PAGE_ITEMS,
      items.slice(pageIndex * MAX_ITEMS, (pageIndex + 1) * MAX_ITEMS)
    );
    if (pageIndex < MAX_PAGE_INDEX) {
      PAGE_ITEMS.push(
        `(NEXT ${
          pageIndex < MAX_PAGE_INDEX - 1
            ? MAX_ITEMS
            : items.length - MAX_ITEMS * (pageIndex + 1)
        } item(s))`
      );
      indexNext = PAGE_ITEMS.length - 1;
    }

    console.log("\x1B[2J");
    const index = readlineSync.keyInSelect(PAGE_ITEMS);
    if (indexPrev !== -1 && index === indexPrev) {
      pageIndex--;
    } else if (indexNext !== -1 && index === indexNext) {
      pageIndex++;
    } else {
      return index === -1
        ? index
        : index + pageIndex * MAX_ITEMS - (indexPrev === -1 ? 0 : 1);
    }
  }
};

const branchList = () => {
  let branches = execSync("git branch")
    .toString()
    .trim()
    .replace(/^\* /gm, "")
    .split("\n")
    .reduce((result, branch) => {
      if (
        branch &&
        branch?.trim() &&
        !exceptBranches?.includes(branch?.trim())
      ) {
        result.push(branch.trim());
      }

      return result;
    }, []);

  return branches;
};

const deleteBranches = () => {
  try {
    const branches = branchList();
    if (branches.length === 0) {
      console.log("No branches available to delete.");
      return;
    }
    branches.unshift("all branches");
    const selectedBranches = selectPaginationItem(branches);
    if (selectedBranches === -1) {
      console.log("Exiting without deleting any branches.");
      return;
    }

    let branchesToDelete = [branches[selectedBranches]];
    if (selectedBranches === 0) {
      branchesToDelete = branches.slice(1);
    }

    const confirm = readlineSync.keyInYNStrict(
      `Are you sure you want to delete the selected branches? (${branchesToDelete.join(
        ", "
      )})`
    );

    console.log(`Deleting branches: ${branchesToDelete}`);
    if (confirm) {
      for (const branchToDelete of branchesToDelete) {
        if (branchToDelete) {
          execSync(`git branch -D ${branchToDelete}`);
          console.log(chalk.green(`\nDeleted branch: ${branchToDelete}`));
        }
      }
    }

    const remainingBranches = branchList();
    console.log(
      chalk.green(
        remainingBranches.length > 0
          ? `\nBraches remaining:\n${remainingBranches?.join("\n")}`
          : "\nNo branches remaining."
      )
    );
  } catch (error) {
    console.log(error);
    // console.error("Error retrieving current branch:", error.message);
  }
};

deleteBranches();
