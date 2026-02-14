# SimpleType Features

## Overview
SimpleType is a minimalist typing test application inspired by MonkeyType, featuring a beautiful glassmorphism UI and comprehensive typing metrics.

## Key Features

### Typing Metrics
- **WPM (Words Per Minute)**: Standard metric that accounts for accuracy
- **RAW WPM**: Pure typing speed without accuracy penalties
- **Accuracy**: Real-time percentage of correct characters typed
- **Visual Feedback**: Color-coded words (green for correct, red for incorrect)

### Test Modes

#### Words Mode
Type a specific number of words:
- 10 words (quick test)
- 25 words (short test)
- 50 words (medium test)
- 100 words (long test)

#### Time Mode
Type as many words as possible within a time limit:
- 15 seconds (sprint)
- 30 seconds (quick)
- 60 seconds (standard)
- 120 seconds (endurance)

### Results & Analytics
- Comprehensive results modal with all statistics
- WPM over time graph (custom canvas implementation)
- Correct vs incorrect word count
- Total time elapsed
- Option to retry or close

### User Experience
- Clean, minimalistic interface
- Glassmorphism design with light mode
- Beautiful purple gradient background
- Smooth animations and transitions
- Keyboard shortcut: Press `Esc` to reset
- Auto-focus on input field
- Responsive design

## Technical Details
- Frontend-only (no backend required)
- No external dependencies
- Custom canvas-based graphing
- Memory-safe with proper cleanup
- Security validated (0 CodeQL alerts)

## Usage
1. Open `index.html` in your browser
2. Select a mode (Words or Time)
3. Choose your preferred setting
4. Start typing when ready
5. Press Space after each word
6. View your results at the end

Enjoy improving your typing speed! 🚀
