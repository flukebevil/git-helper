import { execSync } from "child_process";
import chalk from "chalk";
import readlineSync from "readline-sync";

const exceptBranches = ["main"];

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

    const selectedBranches = readlineSync.keyInSelect(
      branches,
      "Select branches to delete:",
      { cancel: "Exit", guide: true, multiSelect: true }
    );
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
      chalk.bgYellow(
        remainingBranches.length > 0
          ? `\nBraches remaining: ${remainingBranches?.join(", ")}`
          : "\nNo branches remaining."
      )
    );
  } catch (error) {
    console.error("Error retrieving current branch:", error.message);
  }
};

deleteBranches();
