export const landingThemeBootstrapScript = String.raw`
    <script>
        (function () {
            try {
                var savedTheme = localStorage.getItem('landing-theme');
                var theme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.dataset.theme = theme;
            } catch (error) {
                document.documentElement.dataset.theme = 'light';
            }
        })();
    </script>
`;

export const landingInteractionScripts = String.raw`
    <script>
        (function () {
            var root = document.documentElement;
            var button = document.querySelector('[data-theme-toggle]');
            if (!button) return;

            function setTheme(theme) {
                root.dataset.theme = theme;
                button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
                try {
                    localStorage.setItem('landing-theme', theme);
                } catch (error) {}
            }

            setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
            button.addEventListener('click', function () {
                setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
            });
        })();

        (function () {
            var menuToggle = document.querySelector('[data-menu-toggle]');
            var navActions = document.querySelector('[data-nav-actions]');
            if (!menuToggle || !navActions) return;

            menuToggle.addEventListener('click', function () {
                var isOpen = navActions.classList.toggle('is-open');
                menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        })();
    </script>
`;
