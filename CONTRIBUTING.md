# Contributing to Enhanced CLI Agents

Thank you for your interest in contributing to Enhanced CLI Agents! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include details about your configuration and environment**

### Suggesting Enhancements

If you have a suggestion for a new feature or enhancement, please:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**

### Pull Requests

1. **Fork the repository**
2. **Create a new branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and commit them (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: Version 16 or higher
- **npm**: For package management
- **Git**: For version control

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/enhanced-cli-agents.git
cd enhanced-cli-agents

# Install dependencies
npm install

# Run in development mode
npm start

# Run tests
npm test

# Build package
npm run build
```

### Code Style

We use the following code style guidelines:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Trailing commas**: Use trailing commas in objects and arrays
- **Line length**: Maximum 80 characters
- **File naming**: Use kebab-case for files

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- test-file.js
```

## 📁 Project Structure

```
enhanced-cli-agents/
├── enhanced-cli-agent.js      # Main enhanced CLI agent
├── simple-cli-agent.js        # Simple CLI agent
├── oauth-auth.js             # OAuth authentication module
├── autocomplete.js           # Autocomplete functionality
├── setup.js                  # Setup and installation script
├── package.json              # Package configuration
├── README.md                 # Main documentation
├── LICENSE                   # MIT license
├── .github/                  # GitHub configuration
│   └── workflows/           # CI/CD workflows
├── docs/                    # Documentation
└── tests/                   # Test files
```

## 🔧 Development Guidelines

### Adding New Features

1. **Create a feature branch** from `main`
2. **Implement the feature** with proper error handling
3. **Add tests** for your new functionality
4. **Update documentation** if needed
5. **Submit a pull request**

### Adding New Tools

1. **Create the tool function** in the appropriate agent file
2. **Add tool registration** in the tool registry
3. **Add autocomplete support** in the autocomplete module
4. **Update documentation** with usage examples
5. **Add tests** for the new tool

### Adding New Commands

1. **Create the command handler** in the agent file
2. **Add command registration** in the command list
3. **Add autocomplete support** for the command
4. **Update help text** with command description
5. **Add tests** for the new command

### Security Guidelines

- **Never commit API keys** or sensitive information
- **Use environment variables** for configuration
- **Validate all user input** to prevent injection attacks
- **Use HTTPS** for all external communications
- **Implement proper error handling** without exposing sensitive data

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- --grep "authentication"
```

### Writing Tests

- **Test all public functions** and methods
- **Include edge cases** and error conditions
- **Mock external dependencies** (APIs, file system)
- **Use descriptive test names** that explain the behavior
- **Keep tests simple** and focused on one thing

### Test Structure

```javascript
describe('Feature Name', () => {
  describe('when condition is met', () => {
    it('should behave as expected', () => {
      // Test implementation
    });
  });

  describe('when error occurs', () => {
    it('should handle error gracefully', () => {
      // Error test implementation
    });
  });
});
```

## 📝 Documentation

### Code Documentation

- **Use JSDoc comments** for all public functions
- **Include parameter types** and return types
- **Provide usage examples** for complex functions
- **Document error conditions** and exceptions

### README Updates

When adding new features, update the following documentation:

- **README.md**: Main documentation and quick start
- **Feature-specific READMEs**: Detailed feature documentation
- **Command help**: Inline help text for commands

## 🚀 Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/) for version numbers:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

Before releasing a new version:

- [ ] **All tests pass**
- [ ] **Documentation is updated**
- [ ] **Version number is updated**
- [ ] **Changelog is updated**
- [ ] **Release notes are prepared**
- [ ] **GitHub release is created**

### Creating a Release

1. **Update version** in `package.json`
2. **Update changelog** with new features and fixes
3. **Create a release branch** from `main`
4. **Submit a pull request** for the release
5. **Merge and tag** the release
6. **Publish to npm** (if applicable)

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive
- **Help others** learn and grow
- **Provide constructive feedback**
- **Follow the project's coding standards**
- **Be patient** with new contributors

### Communication

- **Use clear language** in issues and pull requests
- **Provide context** for your suggestions
- **Ask questions** if something is unclear
- **Be open to feedback** and suggestions

## 📞 Getting Help

If you need help with contributing:

- **Check the documentation** in the repository
- **Search existing issues** for similar problems
- **Ask questions** in GitHub Discussions
- **Join our community** chat (if available)

## 🙏 Recognition

Contributors will be recognized in:

- **README.md**: List of contributors
- **Release notes**: Credit for significant contributions
- **GitHub contributors**: Automatic recognition on GitHub

## 📄 License

By contributing to Enhanced CLI Agents, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Enhanced CLI Agents! 🚀**
