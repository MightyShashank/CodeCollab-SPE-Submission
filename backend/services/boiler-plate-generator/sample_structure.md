### Description

A clear and concise description of the problem. Explain the goal, the context, and what needs to be calculated or determined. For example:

"Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice."

### Function Signature

This section defines the function that the user is expected to implement.

- Function Name: `twoSum`
- Function Input:
  - nums: Array of Integers
  - target: Integer
- Function Return Type: Array of Integers (containing two indices)

### Execution Details

This section describes how the user's implemented function will be called and tested by the main execution block.

- Main Function Input:
  - Line 1: Comma-separated list of integers for `nums`
  - Line 2: Single integer for `target`
- Main Function Logic: `result = twoSum(nums, target)`
- Main Function Output: The array returned by your `twoSum` function

### Constraints

- 2 <= nums.length <= 1000
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.

### Example

Input:
- 2,7,11,15
- 9

Output:
- [0,1]

Explanation: Because `nums[0] + nums[1] == 9`, we return `[0, 1]`.