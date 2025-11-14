# CLAUDE.md

AI Assistant Guide for stone_engine_for_web

## Project Overview

**stone_engine** is a high-performance Japanese text rendering engine for iOS and macOS, designed to replace UIKit's UILabel and UITextView with advanced Japanese typography capabilities.

- **Language:** Swift 5.5+
- **Platforms:** iOS 15+, macOS 10.15+
- **Build System:** Swift Package Manager + Xcode
- **Author:** Makoto Kinoshita (mkino@hmdt.jp)
- **Copyright:** 2024 Nihon Design Center
- **License:** MIT

### Purpose

1. **Primary Goal:** Advanced Japanese typography with vertical text (TbRl), kinsoku processing, punctuation handling, and per-script font scaling
2. **Secondary Goal:** Electronic media-optimized typesetting for infinite scrolling and dynamic sizing
3. **Developer Experience:** Direct access to internal rendering structures for maximum flexibility

### Key Features

- Horizontal (LrTb) and vertical (TbRl) text layout
- Kinsoku processing (line-start/end prohibitions)
- Punctuation compression modes (whole/half/stone)
- Tate-chu-yoko (vertical-in-horizontal) for 2-digit numbers
- Per-script font selection and scaling (Latin, Japanese, Emoji)
- High-performance rendering with CATiledLayer
- Full UITextInput protocol support for editing

## Project Structure

```
stone_engine_for_web/
├── Sources/stone_engine/         # Main library source (5,520 lines)
│   ├── context/                  # Core types and configuration
│   │   ├── STContext.swift       # Central state manager (523 lines)
│   │   └── STObject.swift        # Type definitions (520 lines)
│   ├── font/                     # Font management
│   │   ├── STFontManager.swift   # Per-script font handling (226 lines)
│   │   └── STTextSubstitutionGlyph.swift  # OpenType GSUB (501 lines)
│   ├── layout/                   # Text layout engine
│   │   └── STLayout.swift        # Layout algorithm (949 lines)
│   ├── parse/                    # Text parsing
│   │   └── STParser.swift        # Character-to-run conversion (153 lines)
│   └── view/                     # UI components (2,648 lines)
│       ├── STLabel.swift         # Non-editable text view (554 lines)
│       ├── STTextView.swift      # Editable text view (430 lines)
│       ├── STTextView+Action.swift        # Gesture handling (200 lines)
│       ├── STTextView+TextInput.swift     # UITextInput (422 lines)
│       ├── STTextView+Responder.swift     # First responder (343 lines)
│       ├── STTextView+Lens.swift          # Magnification (189 lines)
│       ├── STText.swift          # UITextInput support (100 lines)
│       ├── STCursorView.swift    # Cursor rendering (100 lines)
│       ├── STKnobView.swift      # Selection handles (158 lines)
│       ├── STLensView.swift      # Magnifying glass (101 lines)
│       └── STTiledLayer.swift    # Efficient rendering (51 lines)
├── sample/                       # iOS sample app (583 lines)
│   ├── AppDelegate.swift
│   ├── ViewController.swift
│   └── UIFont+Localized.{h,m}   # Objective-C font utilities
├── Package.swift                 # SPM manifest
├── stone.xcodeproj/              # Xcode project for sample app
├── README.md                     # Japanese documentation
├── LICENSE                       # MIT License
└── .gitignore

Total: ~6,103 lines of Swift code
```

## Architecture

### Core Data Flow

```
Text String → STParser → [STRun] → STLayout → Positioned Runs → Rendering
                ↓                      ↓
           STFontManager         Kinsoku + Punctuation
```

### Key Classes

1. **STRun** (struct): Single character rendering unit
   - Properties: font, glyph, position, advance, frame, visibility, line, tokenId
   - The fundamental building block of the layout system

2. **STToken** (struct): Group of runs (e.g., a word)
   - Contains: runIdRange, charRange
   - Used for word-based line breaking

3. **STContext** (open class): Central configuration and state
   - Manages: runs array, tokens array, font manager, layout properties
   - Properties: fontSize, lineHeightScale, direction, textAlign, punctuationMode
   - Performance-critical: direct array access, no heavy abstraction

4. **STParser** (class): Text-to-runs converter
   - Character-by-character parsing
   - Script detection and font selection
   - Glyph generation via CoreText
   - Tate-chu-yoko detection

5. **STLayout** (class): 2D positioning engine
   - Supports LrTb (horizontal) and TbRl (vertical) layout
   - Kinsoku processing with character sets
   - Punctuation compression (whole/half/stone modes)
   - Text alignment: leading/center/trailing/justified

6. **STFontManager** (open class): Font handling per script
   - Script-based font stacks: Latin, Japanese, Emoji
   - Per-script scaling factors
   - CTFont caching for performance

7. **STLabel** (open class): Non-editable text display
   - UIView subclass with STTiledLayer
   - Computed properties facade over STContext
   - Triggers layout on property changes via didSet

8. **STTextView** (open class): Editable text view
   - UIScrollView subclass containing internal STLabel
   - Full UITextInput protocol conformance
   - Selection UI: cursor, knobs, lens
   - Extensions for organization: +Action, +TextInput, +Responder, +Lens

## Development Conventions

### Code Style

1. **Naming Conventions**
   - All types prefixed with `ST` (Stone/Stone Engine)
   - Classes/Structs/Enums: PascalCase (e.g., `STContext`, `STRun`)
   - Properties/Methods: camelCase (e.g., `fontSize`, `lineHeight`)
   - Enum cases: camelCase (e.g., `.lrTb`, `.stone`)

2. **File Headers**
   - Every file includes copyright header:
     ```swift
     /*
     FileName.swift

     Author: Makoto Kinoshita (mkino@hmdt.jp)

     Copyright 2024 Nihon Design Center. All rights reserved.
     This software is licensed under the MIT License. See LICENSE for details.
     */
     ```

3. **Access Control**
   - Library API: `open class` and `public` for extensibility
   - Internal implementation: default (internal) access
   - Computed properties preferred for API surface

4. **Extension-Based Organization**
   - Large classes split by functionality using extensions
   - Example: STTextView split into 5 files (+Action, +TextInput, +Responder, +Lens)
   - Each extension handles one concern (protocol conformance, feature set)

5. **MARK Comments**
   - Use `// MARK: - Section Name` for code organization
   - Separates logical sections within files
   - Example:
     ```swift
     //--------------------------------------------------------------//
     // MARK: - Advance
     //--------------------------------------------------------------//
     ```

### Architectural Patterns

1. **Direct Data Access**
   - Public `runs` and `tokens` arrays for performance
   - Avoid heavy abstraction layers
   - C-style operations where speed matters (see STTextSubstitutionGlyph)

2. **Notification-Based Events**
   - Parser and layout emit willParse/didParse, willLayout/didLayout
   - Allows observation without tight coupling

3. **Computed Properties as Facade**
   - STLabel/STTextView expose context properties
   - Use `didSet` to trigger layout when properties change
   - Example:
     ```swift
     open var fontSize: CGFloat {
         get { context.fontSize }
         set {
             context.fontSize = newValue
             setNeedsLayout()
         }
     }
     ```

4. **Performance Optimizations**
   - CATiledLayer for large text (1024x1024 tiles)
   - Static CTFont caching in STFontManager
   - UnsafePointer for OpenType table parsing
   - Separate renderSize and renderedSize for optimization

### Japanese Typography Implementation

1. **Direction Support**
   - `.lrTb`: Left-to-right, top-to-bottom (horizontal)
   - `.tbRl`: Top-to-bottom, right-to-left (vertical)
   - Glyph rotation: Latin rotates 90° in vertical, Japanese doesn't

2. **Kinsoku Processing**
   - Character sets: `kinsokuHeadChars` (line-start prohibition)
   - Character sets: `kinsokuTailChars` (line-end prohibition)
   - Character sets: `kinsokuHangingChars` (hanging punctuation)
   - Controlled by `isKinsokuAvailable` flag

3. **Punctuation Modes** (`STPunctuationMode`)
   - `.whole`: Always full-width
   - `.half`: Always half-width
   - `.stone`: Context-aware sizing based on neighbors

4. **Tate-chu-yoko**
   - Auto-applied to 2-digit numbers in vertical text
   - Controlled by `isAllowedTateChuYoko` flag
   - Numbers >2 digits rotate 90°

5. **Script Detection**
   - Unicode script categories: Latin, Japanese (Hiragana, Katakana, Han), Emoji
   - Each script has separate font and scale
   - Font manager handles per-script selection

## Working with This Codebase

### When Adding Features

1. **Understand the Pipeline**
   - Text changes → Parser → Layout → Render
   - Modify the appropriate stage (don't skip steps)

2. **Preserve Performance**
   - Avoid heavy allocations in hot paths
   - Use direct array access for runs/tokens
   - Cache computed values when possible

3. **Maintain Japanese Typography**
   - Test with both horizontal and vertical text
   - Verify kinsoku rules still work
   - Check all three punctuation modes

4. **Update STContext First**
   - Add configuration to STContext
   - Expose via computed properties in STLabel/STTextView
   - Implement logic in Parser or Layout

### When Fixing Bugs

1. **Check Recent Commits**
   - Recent changes focus on layout methods and public API
   - Commits: renderedSize fixes, layoutThatFits additions
   - Making methods `open` and `public` for extensibility

2. **Common Issues**
   - Layout calculation: Check STLayout.swift
   - Glyph selection: Check STTextSubstitutionGlyph.swift (OpenType GSUB)
   - Font selection: Check STFontManager.swift
   - Text input: Check STTextView+TextInput.swift

3. **Testing Strategy**
   - No automated tests exist (manual testing via sample app)
   - Test in sample app with Japanese text examples
   - Verify both LrTb and TbRl modes
   - Check edge cases: empty text, single character, long text

### Build and Development

1. **Swift Package Manager**
   ```bash
   swift build              # Build library
   swift package clean      # Clean build artifacts
   ```

2. **Xcode**
   - Open `stone.xcodeproj` for sample app
   - Library target: `stone_engine`
   - Sample app target: Built into Xcode project
   - Minimum deployment: iOS 15.0, macOS 10.15

3. **Dependencies**
   - Zero external dependencies
   - Only Apple frameworks: UIKit, CoreText, Foundation

4. **File Organization**
   - Source code: `Sources/stone_engine/`
   - Sample app: `sample/`
   - Xcode project: `stone.xcodeproj/`
   - Build artifacts: `.swiftpm/`, `.build/` (gitignored)

### Git Workflow

1. **Branch Naming**
   - Feature branches use descriptive names
   - Current working branch: `claude/claude-md-mhyhw0koxcbifub2-01JCs7Afg8XSR1oDYrgWz9Ld`
   - Always work on designated branch, never push to main directly

2. **Commit Messages**
   - Recent pattern: Japanese commit messages
   - Example: "renderedSizeの修正", "layoutThatFitsを追加"
   - Keep commits focused and atomic

3. **Pull Requests**
   - Use PRs for merging features
   - Recent PR examples: Swift Package migration, README fixes
   - Review focuses on API changes and performance

4. **Ignored Files** (see .gitignore)
   - Xcode user data: `stone.xcodeproj/**/xcuserdata`
   - macOS: `.DS_Store`
   - Build artifacts: `.build`

## Common Tasks for AI Assistants

### Reading Code

1. **Start with STContext** - It's the heart of the system
2. **Follow the pipeline** - Parser → Layout → View
3. **Check STObject** - Contains all type definitions
4. **Read README.md** - Japanese documentation with visual examples

### Making Changes

1. **Always preserve the ST prefix** on new types
2. **Add properties to STContext** for configuration
3. **Expose in STLabel/STTextView** via computed properties
4. **Trigger layout with `setNeedsLayout()`** in didSet
5. **Maintain open/public access** for library API

### Testing Changes

1. **Build the sample app** in Xcode
2. **Test with Japanese text** (Hiragana, Katakana, Kanji, mixed)
3. **Try both directions** (LrTb and TbRl)
4. **Verify edge cases** (empty, single char, very long)
5. **Check all punctuation modes** (.whole, .half, .stone)

### Documentation

1. **README is in Japanese** - primary documentation
2. **Visual examples in README** - Screenshots of features
3. **Minimal inline comments** - Code is self-documenting
4. **File headers are mandatory** - Copyright and license

## Key Files Reference

### Must-Read Files
- `Sources/stone_engine/context/STContext.swift` - Core state management
- `Sources/stone_engine/context/STObject.swift` - All type definitions
- `Sources/stone_engine/layout/STLayout.swift` - Layout algorithm
- `Sources/stone_engine/view/STLabel.swift` - Primary view API
- `README.md` - Japanese documentation with examples

### Performance-Critical Files
- `Sources/stone_engine/font/STTextSubstitutionGlyph.swift` - OpenType GSUB (C-style code)
- `Sources/stone_engine/view/STTiledLayer.swift` - Efficient rendering
- `Sources/stone_engine/font/STFontManager.swift` - Font caching

### Editing Features
- `Sources/stone_engine/view/STTextView.swift` - Main editable view
- `Sources/stone_engine/view/STTextView+TextInput.swift` - iOS text system integration
- `Sources/stone_engine/view/STCursorView.swift` - Cursor rendering
- `Sources/stone_engine/view/STKnobView.swift` - Selection handles

## Important Notes

1. **Communication Language** - Always communicate with the user in Japanese (日本語で会話すること)
2. **No Test Suite** - Changes must be tested manually in sample app
3. **Performance First** - Speed is the top priority per project philosophy
4. **Japanese Focus** - All features designed for Japanese typography first
5. **Direct Access** - Library exposes internal structures intentionally
6. **Open for Extension** - Classes marked `open` for subclassing
7. **Zero Dependencies** - Keep it that way (only Apple frameworks)

## Recent Development Focus

Based on recent commits:
- Making APIs more open/public for extensibility
- Fixing renderedSize calculations
- Adding layoutThatFits method
- Cleaning up extensions
- Removing Objective-C dependencies

## Contact

- **Author:** Makoto Kinoshita
- **Email:** mkino@hmdt.jp
- **Organization:** Nihon Design Center
- **Repository:** stone_engine_for_web

---

**Last Updated:** 2025-11-14
**Version:** Extracted from commit f8b2dc5
