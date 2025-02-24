document.addEventListener('DOMContentLoaded', () => {
    // 1. Determine the browser's preferred language OR get language from localStorage
    let languageCode = localStorage.getItem('language') || navigator.language || navigator.userLanguage; // Get stored language OR browser preference
    languageCode = languageCode.substring(0, 2).toLowerCase();
    let jsonFile = 'en.json'; // Default language is English

    // 2. Determine JSON filename based on language code
    if (languageCode === 'fr') {
        jsonFile = 'fr.json';
    } // Add more language conditions here

    // 3. Fetch the appropriate JSON file and apply translations
    fetchTranslations(jsonFile, languageCode); // Call function to fetch and apply translations


    // 4. Add event listeners to language flags - NEW!
    document.querySelectorAll('#language-selector .lang-option').forEach(langLink => {
        langLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior (page jump)
            const lang = langLink.dataset.lang; // Get selected language from data-lang attribute
            changeLanguage(lang); // Call function to change language
        });
    });


    /**
     * Fetches translations from the specified JSON file and applies them to the page.
     * @param {string} jsonFile - The path to the JSON file containing translations.
     * @param {string} langCode - The language code (e.g., 'en', 'fr').
     */
    function fetchTranslations(jsonFile, langCode) {
        fetch(jsonFile)
            .then(response => response.json())
            .then(translations => {
                document.querySelectorAll('[data-i18n]').forEach(element => {
                    const key = element.dataset.i18n;

                    if (translations[key]) {
                        let translatedText = translations[key];
                        translatedText = interpretMarkdown(translatedText);

                        if (element.tagName === 'A' && element.querySelector('img')) {
                            element.title = translatedText;
                            const imgElement = element.querySelector('img');
                            if (imgElement) {
                                imgElement.alt = translatedText;
                            }
                        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                            element.placeholder = translatedText;
                        } else if (element.tagName === 'IMG') { // --- NOUVELLE CONDITION POUR LES BALISES <img> ---
                            element.alt = translatedText; // On met à jour l'attribut alt des balises <img>
                        } else {
                            element.innerHTML = translatedText; // Default pour les autres éléments (p, h1, h2, etc.)
                        }


                    } else {
                        console.warn(`Translation key '${key}' not found in ${jsonFile} for element:`, element);
                    }
                });
                 // After translations are loaded and applied, update visual language indicator - NEW!
                 updateActiveLanguageFlag(langCode);
            })
            .catch(error => {
                console.error(`Error loading ${jsonFile}:`, error);
            });
    }


    /**
     * Changes the language of the page by loading the appropriate JSON file and updating translations.
     * @param {string} langCode - The language code to switch to (e.g., 'en', 'fr').
     */
    function changeLanguage(langCode) {
        let jsonFile;
        if (langCode === 'fr') {
            jsonFile = 'fr.json';
        } else {
            jsonFile = 'en.json'; // Default to English if langCode is not 'fr' or invalid
            langCode = 'en'; // Ensure languageCode is also reset to default
        }

        localStorage.setItem('language', langCode); // Store selected language in localStorage - NEW!
        fetchTranslations(jsonFile, langCode); // Fetch and apply translations for the new language
    }


    /**
     * Updates the visual indicator (active class) for the currently selected language flag. - NEW!
     * @param {string} langCode - The currently selected language code (e.g., 'en', 'fr').
     */
    function updateActiveLanguageFlag(langCode) {
        document.querySelectorAll('#language-selector .lang-flag').forEach(flag => {
            flag.classList.remove('active'); // Remove 'active' class from all flags
            if (flag.parentElement.dataset.lang === langCode) { // Check if parent <a>'s data-lang matches the langCode
                flag.classList.add('active'); // Add 'active' class to the currently selected flag
            }
        });
    }


    /**
     * Interprets Markdown-like syntax for basic formatting within a text string.
     * Currently supports:
     * - `code`  :  Enclosed in backticks (`) for inline code formatting (<code> tags).
     * - **bold** : Enclosed in double asterisks (**) for bold text (<strong> tags).
     * - [links](url) : Markdown link syntax for creating hyperlinks (<a> tags).
     * - *italic* : Enclosed in single asterisks (*) for italic text (<em> tags). - NEW!
     *
     * @param {string} text - The input text string that may contain Markdown syntax.
     * @returns {string} - The text string with Markdown syntax replaced by HTML tags.
     */
    function interpretMarkdown(text) {
        // 1. Replace backticks with <code> tags
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');

        // 2. Replace double asterisks with <strong> tags
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 3. Replace Markdown links [text](url) with <a> tags
        text = text.replace(/\[([^\]]+)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

        // 4. Replace single asterisks with <em> tags for italic - NEW RULE
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>'); // Regex for *italic* to <em>italic</em> - NEW!

        return text; // Return the processed text with HTML tags
    }

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    const currentTheme = localStorage.getItem('theme') || 'light'; // 'light' by default

    // Dark theme activation
    function enableDarkMode() {
        body.classList.add('dark-theme');
        themeIcon.src = 'sun.png'; 
        themeIcon.alt = 'Thème sombre';
        localStorage.setItem('theme', 'dark');
    }

    // Light theme activation
    function enableLightMode() {
        body.classList.remove('dark-theme');
        themeIcon.src = 'moon.png'; 
        themeIcon.alt = 'Thème clair';
        localStorage.setItem('theme', 'light');
    }

    // Applies initial theme initial upon page loading
    if (currentTheme === 'dark') {
        enableDarkMode();
    } else {
        enableLightMode();
    }

    // Adds an event listener for theme icon
    themeToggle.addEventListener('click', function (e) {
        e.preventDefault();             // Prevents default for link "#"
        if (body.classList.contains('dark-theme')) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    });

});