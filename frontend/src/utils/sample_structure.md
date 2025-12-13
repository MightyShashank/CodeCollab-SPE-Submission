### Description
Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.

### Function Signature
- Function Name: `isValid`
- Function Input:  
	- s: String
- Function Return Type: Boolean

### Execution Details
- Main Function Input:
- Line 1: A single string `s`
- Main Function Logic: `result = isValid(s)`
- Main Function Output: The boolean value (`true` or `false`) returned by your function

### Constraints
- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.

### Example
Input:
- ()
Output:
- true