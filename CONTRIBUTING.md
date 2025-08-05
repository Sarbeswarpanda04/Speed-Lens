# Contributing to Speed Lens

Thank you for your interest in contributing to Speed Lens! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions of all kinds:
- 🐛 Bug reports and fixes
- ✨ New features and enhancements  
- 📖 Documentation improvements
- 🎨 UI/UX improvements
- 🧪 Testing and quality assurance
- 🌍 Translations and localization
- 💡 Ideas and suggestions

## 🚀 Getting Started

### Prerequisites

- **Git** for version control
- **Modern Browser** for testing
- **Code Editor** (VS Code recommended)
- **Node.js** 14+ (for development tools, optional)

### Setup Development Environment

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/speed-lens.git
   cd speed-lens
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Start Development Server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in Browser**
   Navigate to `http://localhost:8000`

## 📝 Development Guidelines

### Code Style

#### JavaScript
- Use **ES6+** features when possible
- Follow **consistent naming conventions**:
  - camelCase for variables and functions
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
- **Comment complex logic** and algorithms
- Use **meaningful variable names**
- Avoid global variables when possible

```javascript
// Good
const calculateSpeedQuality = (speed, type) => {
  // Determine quality based on speed thresholds
  if (type === 'download') {
    return speed >= 100 ? 'excellent' : speed >= 50 ? 'good' : 'fair';
  }
  // ... rest of logic
};

// Avoid
const calc = (s, t) => {
  return s >= 100 ? 'excellent' : 'fair';
};
```

#### CSS
- Follow **BEM methodology** for class naming
- Use **CSS custom properties** for consistency
- **Mobile-first** responsive design
- Group related styles together
- Use meaningful class names

```css
/* Good - BEM methodology */
.speed-gauge {
  /* Base styles */
}

.speed-gauge__value {
  /* Element styles */
}

.speed-gauge--large {
  /* Modifier styles */
}

/* Good - CSS custom properties */
:root {
  --primary-color: #667eea;
  --border-radius: 12px;
}

.button {
  background: var(--primary-color);
  border-radius: var(--border-radius);
}
```

#### HTML
- Use **semantic markup**
- Include **proper accessibility attributes**
- **Validate markup** for standards compliance
- Optimize for **SEO** when applicable

```html
<!-- Good - Semantic and accessible -->
<main>
  <section aria-labelledby="speed-test-heading">
    <h2 id="speed-test-heading">Internet Speed Test</h2>
    <button 
      type="button" 
      aria-describedby="test-description"
      class="test-button">
      Start Test
    </button>
    <p id="test-description">Click to begin speed measurement</p>
  </section>
</main>
```

### File Organization

```
network speed tracker/
├── index.html              # Main entry point
├── styles.css              # Core styles
├── script.js               # Main application logic
├── manifest.json           # PWA configuration
├── docs/                   # Documentation
│   ├── *.md               # Various documentation files
├── assets/                 # Static assets
│   ├── icons/             # App icons
│   └── images/            # Images and graphics
└── tests/                  # Test files (if added)
    ├── unit/              # Unit tests
    └── e2e/               # End-to-end tests
```

## 🐛 Bug Reports

### Before Submitting a Bug Report

1. **Search existing issues** to avoid duplicates
2. **Update to latest version** and test again
3. **Test in multiple browsers** if possible
4. **Gather relevant information** about the issue

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain the problem.

**Environment:**
- OS: [e.g. Windows 10, macOS 11.0, Ubuntu 20.04]
- Browser: [e.g. Chrome 95, Firefox 94, Safari 15]
- Device: [e.g. Desktop, iPhone 12, Samsung Galaxy S21]
- Speed Lens Version: [e.g. 2.0.0]

**Additional Context**
Any other context about the problem.

**Console Errors**
If applicable, include any console errors or warnings.
```

## ✨ Feature Requests

### Before Submitting a Feature Request

1. **Check existing issues** for similar requests
2. **Consider the scope** - is this a core feature?
3. **Think about implementation** - how would this work?
4. **Consider alternatives** - are there other solutions?

### Feature Request Template

```markdown
**Feature Summary**
A clear, concise description of the feature you'd like to see.

**Problem/Need**
Describe the problem this feature would solve or the need it addresses.

**Proposed Solution**
Describe how you envision this feature working.

**Alternative Solutions**
Describe any alternative solutions or workarounds you've considered.

**Use Cases**
Provide specific examples of when and how this feature would be used.

**Implementation Ideas**
If you have ideas about how this could be implemented, share them here.

**Additional Context**
Any other context, mockups, or examples related to the feature.
```

## 🔄 Pull Request Process

### Before Creating a Pull Request

1. **Create an issue** first to discuss the change
2. **Fork the repository** and create a feature branch
3. **Make your changes** following the coding guidelines
4. **Test thoroughly** on multiple browsers/devices
5. **Update documentation** if necessary
6. **Commit with clear messages** following our format

### Pull Request Template

```markdown
**Related Issue**
Fixes #[issue-number] or Closes #[issue-number]

**Description**
Brief description of the changes made.

**Type of Change**
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

**Testing**
- [ ] I have tested this change thoroughly
- [ ] I have tested on multiple browsers
- [ ] I have tested on mobile devices
- [ ] All existing tests pass
- [ ] I have added tests for new functionality

**Screenshots**
If applicable, add screenshots showing the changes.

**Checklist**
- [ ] My code follows the project's coding guidelines
- [ ] I have performed a self-review of my code
- [ ] My changes generate no new warnings or errors
- [ ] Any dependent changes have been merged and published
- [ ] I have updated the documentation accordingly
```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```bash
git commit -m "feat(ui): add dark mode toggle functionality"
git commit -m "fix(test): resolve accuracy issues in speed measurement"
git commit -m "docs(api): update API documentation with new endpoints"
git commit -m "style(css): improve responsive design for mobile devices"
```

## 🧪 Testing Guidelines

### Manual Testing

#### Core Functionality
- [ ] Speed test starts and completes successfully
- [ ] All metrics are measured correctly
- [ ] Results are displayed properly
- [ ] History functionality works
- [ ] Export features function correctly

#### Cross-Browser Testing
- [ ] Chrome (latest and previous version)
- [ ] Firefox (latest and previous version)  
- [ ] Safari (latest and previous version)
- [ ] Edge (latest and previous version)

#### Device Testing
- [ ] Desktop (Windows, macOS, Linux)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet (iPad, Android tablets)

#### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets standards
- [ ] Focus indicators are visible

### Automated Testing

If you're adding automated tests:

```javascript
// Example unit test
describe('SpeedTester', () => {
  test('should calculate speed correctly', () => {
    const speed = calculateSpeed(1000000, 8); // 1MB in 8 seconds
    expect(speed).toBeCloseTo(1.0, 1); // ~1 Mbps
  });
});
```

## 🌍 Internationalization

We welcome translations to make Speed Lens accessible globally:

### Adding a New Language

1. **Create language file**: `i18n/[language-code].json`
2. **Translate all strings** maintaining the same structure
3. **Test the translation** thoroughly
4. **Update language selector** in the UI

```json
{
  "speedTest": {
    "title": "Speed Test",
    "startButton": "Start Test",
    "stopButton": "Stop Test",
    "results": {
      "download": "Download",
      "upload": "Upload", 
      "ping": "Ping"
    }
  }
}
```

## 📖 Documentation

### Documentation Standards

- **Clear and concise** writing
- **Include examples** when helpful
- **Update related docs** when making changes
- **Use proper Markdown** formatting
- **Include screenshots** for UI changes

### Types of Documentation

1. **User Documentation**: How to use the application
2. **API Documentation**: Technical reference for developers
3. **Development Documentation**: Setup and contribution guides
4. **Installation Documentation**: Deployment and setup instructions

## 🏆 Recognition

Contributors will be recognized in:
- **Contributors section** of README
- **Changelog** for significant contributions
- **Special mentions** for outstanding contributions

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For private communication with maintainers

### Response Times

- **Bug reports**: We aim to respond within 48 hours
- **Feature requests**: We aim to respond within 1 week
- **Pull requests**: We aim to review within 1 week

## 📋 Code of Conduct

### Our Pledge

We are committed to making participation in this project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience, nationality
- Personal appearance, race, religion
- Sexual identity and orientation

### Expected Behavior

- **Be respectful** and inclusive
- **Use welcoming** and inclusive language
- **Accept constructive criticism** gracefully
- **Focus on what's best** for the community
- **Show empathy** towards other community members

### Unacceptable Behavior

- **Harassment** of any kind
- **Discriminatory** language or actions
- **Personal attacks** or insults
- **Public or private harassment**
- **Publishing others' private information** without permission

### Enforcement

Violations may result in:
1. **Warning** for minor infractions
2. **Temporary ban** for repeated violations
3. **Permanent ban** for serious violations

## 🎯 Development Priorities

### Current Focus Areas

1. **Performance Optimization**: Speed and efficiency improvements
2. **Mobile Experience**: Enhanced mobile functionality
3. **Accessibility**: Making the app usable by everyone
4. **Internationalization**: Multi-language support
5. **Testing**: Automated testing infrastructure

### Future Roadmap

- **Advanced Analytics**: Enhanced data analysis features
- **API Integration**: External service connectivity
- **Team Features**: Multi-user functionality
- **Enterprise Features**: Advanced business features

## 🙏 Thank You

Thank you for contributing to Speed Lens! Your efforts help make internet speed testing accessible and reliable for users worldwide.

---

**Questions?** Feel free to reach out through GitHub issues or contact the maintainers directly.
