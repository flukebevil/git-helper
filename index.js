const { execSync } = require("child_process");

const main = () => {
    try {
        const output = execSync("git branch").toString().trim();
        console.log(`Current branch: ${output}`);
    } catch (error) {
        console.error("Error retrieving current branch:", error.message);
    }
}

main();