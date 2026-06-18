```markdown
# perscrutari Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill covers the core development conventions and workflows used in the `perscrutari` JavaScript repository. It documents file organization, code style, testing patterns, and provides step-by-step instructions for common tasks. This guide is ideal for contributors looking to quickly align with the project's established practices.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `dataProcessor.js`, `userProfile.js`

### Import Style
- Use **relative imports** for modules within the codebase.
  - Example:
    ```javascript
    import { fetchData } from './apiUtils';
    ```

### Export Style
- Prefer **named exports** over default exports.
  - Example:
    ```javascript
    // In dataProcessor.js
    export function processData(input) {
      // ...
    }
    ```
    ```javascript
    // In another file
    import { processData } from './dataProcessor';
    ```

### Commit Messages
- Commit messages are **freeform**, with no strict prefix requirements.
- Average commit message length is about 46 characters.

## Workflows

### Adding a New Module
**Trigger:** When you need to add a new feature or utility to the codebase  
**Command:** `/add-module`

1. Create a new file using camelCase naming (e.g., `newFeature.js`).
2. Implement your logic using named exports.
3. Use relative imports to include dependencies.
4. Write a corresponding test file following the `*.test.*` pattern.
5. Commit your changes with a clear, descriptive message.

### Running Tests
**Trigger:** When you want to verify code correctness  
**Command:** `/run-tests`

1. Locate all test files matching the `*.test.*` pattern.
2. Use the project's preferred (unknown) test runner to execute tests.
3. Review test output and address any failures.

### Refactoring Code
**Trigger:** When improving or restructuring existing code  
**Command:** `/refactor`

1. Update file and function names to follow camelCase convention.
2. Ensure all imports are relative and exports are named.
3. Update any affected test files.
4. Commit changes with a descriptive message.

## Testing Patterns

- Test files follow the `*.test.*` naming pattern (e.g., `apiUtils.test.js`).
- The specific testing framework is **unknown**; check project documentation or existing test files for details.
- Example test file structure:
  ```javascript
  import { processData } from './dataProcessor';

  test('processData returns expected result', () => {
    const input = [1, 2, 3];
    const result = processData(input);
    expect(result).toEqual([/* expected output */]);
  });
  ```

## Commands
| Command       | Purpose                                      |
|---------------|----------------------------------------------|
| /add-module   | Scaffold and add a new module                |
| /run-tests    | Run all tests in the repository              |
| /refactor     | Refactor code to align with conventions      |
```
