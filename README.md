# SparkLearn ✨

SparkLearn is a modern, kid-friendly web app designed to help children learn reading and math through interactive, AI-powered modules. The app adapts content to the child's age, making learning fun, engaging, and personalized.

## Features

- **Profile Creation:** Kids can create and select their own profiles (name, age) stored in local storage.
- **Age-Appropriate Modules:** Reading and Math modules are generated based on age ranges (1-3, 4-6, 7-9, 10-12).
- **AI-Powered Content:** Uses Gemini Flash 2.5 API (BYOK) to generate stories, math problems, and questions.
- **Interactive Questions:** Multiple-choice questions are presented as cards, with instant feedback and scoring.
- **Modern, Tablet-Friendly UI:** Bright, playful design with emojis and responsive layout.
- **Parental Controls:** Gemini API key management is protected by a birth year validation modal.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/simkeyur/SparkLearn.git
   ```
2. **Open `index.html` in your browser.**
3. **Set your Gemini API key:** Click the floating key icon (bottom right) and enter your API key (parental gate protected).
4. **Create a profile and start learning!**

## Age Ranges & Module Details

- **1-3 years:** Simple stories and counting/math questions with emojis.
- **4-6 years:** Short stories and basic addition/subtraction.
- **7-9 years:** Longer stories, vocabulary, and multiplication/division.
- **10-12 years:** Complex reading comprehension and word/math problems.

## Technologies Used

- Plain HTML, CSS, JavaScript
- [Showdown.js](https://github.com/showdownjs/showdown) for Markdown rendering
- Gemini Flash 2.5 API (BYOK)

## Contributing

Pull requests and suggestions are welcome! Please open an issue or submit a PR.

## License

MIT

---

Made with ❤️ for curious kids and their families.
