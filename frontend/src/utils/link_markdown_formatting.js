/** ARCHIVED FILE, NOT USED ANYMORE
 * Formats a programming problem into a beautiful, Discord-style Markdown string.
 *
 * @param {object} problemData - The problem data.
 * @param {string} problemData.title - The title of the problem.
 * @param {string} problemData.description_md - The problem description in Markdown.
 * @param {string} problemData.constraints_md - The constraints in Markdown.
 * @param {string} problemData.examples_md - The examples in Markdown.
 * @returns {string} The fully formatted Markdown string.
 */
export function formatProblemMarkdown({ title, description_md, constraints_md, examples_md }) {
  // Emojis for different sections to add visual flair
  const titleEmoji = '🎯';
  const descriptionEmoji = '📝';
  const constraintsEmoji = '⛓️';
  const examplesEmoji = '🧪';

  // Format the title with a large heading and an emoji
  const formattedTitle = `# ${titleEmoji} ${title}\n\n`;

  // Format the description inside a blockquote for a clean, indented look
  const formattedDescription = `## ${descriptionEmoji} Problem Description\n\n> ${description_md.replace(/\n/g, '\n> ')}\n\n`;

  // Format constraints with a clear heading and within a code block for readability
  const formattedConstraints = `## ${constraintsEmoji} Constraints\n\n\`\`\`\n${constraints_md}\n\`\`\`\n\n`;

  // Format examples with a heading and place them inside a code block
  const formattedExamples = `## ${examplesEmoji} Examples\n\n\`\`\`\n${examples_md}\n\`\`\``;

  // Combine all the formatted parts into the final Markdown string
  const beautiful_md = formattedTitle + formattedDescription + formattedConstraints + formattedExamples;

  return beautiful_md;
}

// --- HOW TO USE IT ---

// 1. Get your data from the backend
// const problemDataFromBackend = {
//   title: "Two Sum",
//   description_md: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
//   constraints_md: "• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.",
//   examples_md: "Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]"
// };

// 2. Call the function to get the formatted markdown
// const beautifulMarkdown = formatProblemMarkdown(problemDataFromBackend);

// 3. Set the state in your component
// setProblemMarkdown(beautifulMarkdown);

// You can log it to see the result
// console.log(beautifulMarkdown);