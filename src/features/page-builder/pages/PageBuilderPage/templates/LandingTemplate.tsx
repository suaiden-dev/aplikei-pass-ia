const landingTemplateHtml = String.raw`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aplikei</title>
    <meta name="description" content="Premium legal advisory for B1/B2, F1, status extension, and change of status. Legal strategy from start to finish for your visa process.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
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
    <style>
        :root {
            color-scheme: light;
            --bg: #ffffff;
            --bg-soft: #f5f7fb;
            --bg-panel: #fbfcfe;
            --surface: #ffffff;
            --surface-strong: #ffffff;
            --ink: #0b1220;
            --muted: #516073;
            --muted-2: #7d899b;
            --line: #e5eaf2;
            --line-strong: #d7deea;
            --dark: #080d1c;
            --dark-2: #101936;
            --dark-3: #172348;
            --on-dark: #eef4ff;
            --on-dark-muted: #a9b8d4;
            --primary: #2d63ff;
            --primary-2: #1e49db;
            --cyan: #22c7df;
            --green: #16b981;
            --yellow: #f6b13e;
            --header-bg: rgba(255, 255, 255, 0.84);
            --header-border: rgba(229, 234, 242, 0.82);
            --button-soft: rgba(255, 255, 255, 0.78);
            --badge-bg: rgba(255, 255, 255, 0.82);
            --hero-bg:
                radial-gradient(900px 420px at 88% 10%, rgba(45, 99, 255, 0.14), transparent 62%),
                linear-gradient(180deg, #ffffff 0%, #f5f7fb 100%);
            --hero-ink: #0b1220;
            --hero-muted: #516073;
            --hero-highlight: #1e49db;
            --hero-line: rgba(13, 22, 48, 0.08);
            --metric-bg: rgba(255, 255, 255, 0.82);
            --metric-border: #e5eaf2;
            --metric-ink: #0b1220;
            --metric-muted: #516073;
            --preview-bg: #f8fafc;
            --preview-soft: #eef2f8;
            --preview-line: #dbe3ef;
            --preview-search: #e9eef6;
            --success-bg: #dffbf2;
            --success-ink: #08795f;
            --proof-bg: #f5f7fb;
            --proof-ink: #0b1220;
            --proof-muted: #516073;
            --proof-card-bg: #ffffff;
            --proof-card-border: #e5eaf2;
            --footer-bg: #f5f7fb;
            --footer-ink: #0b1220;
            --footer-muted: #516073;
            --footer-border: #e5eaf2;
            --card-button-bg: #2d63ff;
            --card-button-ink: #ffffff;
            --radius: 8px;
            --shadow: 0 16px 48px rgba(13, 22, 48, 0.12);
            --shadow-soft: 0 10px 30px rgba(13, 22, 48, 0.08);
            --max: 1180px;
        }

        :root[data-theme="dark"] {
            color-scheme: dark;
            --bg: #080d1c;
            --bg-soft: #0d1530;
            --bg-panel: #101936;
            --surface: #101936;
            --surface-strong: #152044;
            --ink: #eef4ff;
            --muted: #a9b8d4;
            --muted-2: #7f90b0;
            --line: rgba(255, 255, 255, 0.11);
            --line-strong: rgba(255, 255, 255, 0.18);
            --dark: #050915;
            --dark-2: #0b1228;
            --dark-3: #172348;
            --on-dark: #eef4ff;
            --on-dark-muted: #a9b8d4;
            --primary: #6ea2ff;
            --primary-2: #4d82f0;
            --cyan: #35d4ee;
            --header-bg: rgba(8, 13, 28, 0.82);
            --header-border: rgba(255, 255, 255, 0.1);
            --button-soft: rgba(255, 255, 255, 0.08);
            --badge-bg: rgba(255, 255, 255, 0.08);
            --hero-bg:
                radial-gradient(900px 420px at 88% 10%, rgba(45, 99, 255, 0.18), transparent 64%),
                linear-gradient(180deg, #050915 0%, #080d1c 100%);
            --hero-ink: #eef4ff;
            --hero-muted: #a9b8d4;
            --hero-highlight: #7ddfff;
            --hero-line: rgba(255, 255, 255, 0.16);
            --metric-bg: rgba(255, 255, 255, 0.04);
            --metric-border: rgba(255, 255, 255, 0.1);
            --metric-ink: #eef4ff;
            --metric-muted: #a9b8d4;
            --preview-bg: #0d1530;
            --preview-soft: #182447;
            --preview-line: #263354;
            --preview-search: #1c294d;
            --success-bg: rgba(22, 185, 129, 0.14);
            --success-ink: #55e1b4;
            --proof-bg: #0d1530;
            --proof-ink: #eef4ff;
            --proof-muted: #a9b8d4;
            --proof-card-bg: rgba(255, 255, 255, 0.04);
            --proof-card-border: rgba(255, 255, 255, 0.12);
            --footer-bg: #050915;
            --footer-ink: #eef4ff;
            --footer-muted: #a9b8d4;
            --footer-border: rgba(255, 255, 255, 0.12);
            --card-button-bg: #6ea2ff;
            --card-button-ink: #050915;
            --shadow: 0 18px 54px rgba(0, 0, 0, 0.36);
            --shadow-soft: 0 14px 34px rgba(0, 0, 0, 0.26);
        }

        * {
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg);
            color: var(--ink);
            line-height: 1.6;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }

        body::selection {
            color: #ffffff;
            background: var(--primary);
        }

        h1, h2, h3, h4, p {
            margin: 0;
        }

        h1, h2, h3, h4 {
            font-family: 'Manrope', 'Inter', sans-serif;
            font-weight: 800;
            line-height: 1.04;
            letter-spacing: 0;
        }

        a {
            color: inherit;
        }

        .container {
            width: min(var(--max), calc(100% - 40px));
            margin: 0 auto;
        }

        .section {
            padding: clamp(64px, 8vw, 112px) 0;
        }

        .section-header {
            max-width: 700px;
            margin: 0 auto 42px;
            text-align: center;
        }

        .section-title {
            font-size: clamp(30px, 4vw, 48px);
            color: var(--ink);
        }

        .section-subtitle {
            max-width: 660px;
            margin: 14px auto 0;
            color: var(--muted);
            font-size: clamp(16px, 1.6vw, 18px);
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            width: fit-content;
            max-width: 100%;
            padding: 7px 13px;
            border: 1px solid rgba(45, 99, 255, 0.2);
            border-radius: 999px;
            background: var(--badge-bg);
            color: var(--primary);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            box-shadow: 0 10px 28px rgba(45, 99, 255, 0.1);
        }

        .badge::before {
            content: "";
            width: 8px;
            height: 8px;
            flex: 0 0 auto;
            border-radius: 50%;
            background: var(--primary);
            box-shadow: 0 0 0 4px rgba(45, 99, 255, 0.15);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 48px;
            padding: 13px 22px;
            border: 1px solid transparent;
            border-radius: 999px;
            font-size: 15px;
            font-weight: 800;
            line-height: 1;
            text-decoration: none;
            white-space: nowrap;
            transition: transform 160ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .btn-sm {
            min-height: 40px;
            padding: 10px 16px;
            font-size: 14px;
        }

        .btn-primary {
            color: #ffffff;
            background: var(--primary);
            box-shadow: 0 14px 30px rgba(45, 99, 255, 0.34);
        }

        .btn-primary:hover {
            background: var(--primary-2);
            box-shadow: 0 18px 34px rgba(45, 99, 255, 0.42);
        }

        .btn-secondary,
        .btn-outline {
            color: var(--ink);
            background: var(--button-soft);
            border-color: var(--line);
        }

        .btn-secondary:hover,
        .btn-outline:hover {
            border-color: rgba(45, 99, 255, 0.3);
            box-shadow: var(--shadow-soft);
        }

        .btn-card {
            width: 100%;
            margin-top: auto;
            color: var(--card-button-ink);
            background: var(--card-button-bg);
            box-shadow: none;
        }

        .btn-card:hover {
            background: var(--primary);
            box-shadow: 0 12px 28px rgba(45, 99, 255, 0.26);
        }

        .header {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 50;
            width: 100%;
            padding: 18px 0;
            background: var(--header-bg);
            border-bottom: 1px solid var(--header-border);
            backdrop-filter: blur(18px);
        }

        .header .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
        }

        .menu-toggle {
            display: none;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid var(--line);
            border-radius: 10px;
            background: var(--button-soft);
            color: var(--ink);
            font-size: 18px;
            cursor: pointer;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 28px;
            flex: 1 1 auto;
            justify-content: flex-end;
        }

        .nav {
            display: flex;
            align-items: center;
            gap: 24px;
        }

        .nav-link {
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: var(--muted);
            text-decoration: none;
            transition: color 160ms ease;
        }

        .nav-link:hover {
            color: var(--ink);
        }

        .logo,
        .footer-logo {
            display: inline-flex;
            align-items: center;
            min-width: 0;
        }

        .logo-text {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
            color: var(--ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 21px;
            font-weight: 800;
            letter-spacing: 0;
        }

        .logo-text::before {
            content: "A";
            display: grid;
            place-items: center;
            width: 32px;
            height: 32px;
            flex: 0 0 auto;
            border-radius: 8px;
            color: #ffffff;
            background: var(--primary);
            box-shadow: 0 10px 24px rgba(45, 99, 255, 0.28);
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .theme-toggle {
            position: relative;
            display: inline-flex;
            align-items: center;
            width: 74px;
            height: 40px;
            padding: 4px;
            border: 1px solid var(--line);
            border-radius: 999px;
            color: var(--ink);
            background: var(--button-soft);
            cursor: pointer;
            backdrop-filter: blur(12px);
            transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }

        .theme-toggle:hover {
            border-color: rgba(45, 99, 255, 0.36);
            box-shadow: var(--shadow-soft);
        }

        .theme-toggle::before {
            content: "";
            position: absolute;
            left: 4px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: var(--surface);
            box-shadow: 0 6px 18px rgba(13, 22, 48, 0.18);
            transition: transform 180ms ease, background 180ms ease;
        }

        :root[data-theme="dark"] .theme-toggle::before {
            transform: translateX(34px);
            background: var(--primary);
        }

        .theme-toggle-icon {
            position: relative;
            z-index: 1;
            display: grid;
            place-items: center;
            width: 30px;
            height: 30px;
            flex: 0 0 30px;
            font-size: 15px;
            line-height: 1;
        }

        .hero {
            position: relative;
            min-height: 94vh;
            padding: clamp(120px, 13vw, 172px) 0 clamp(60px, 8vw, 100px);
            overflow: hidden;
            color: var(--hero-ink);
            background: var(--hero-bg);
        }

        .hero::before {
            content: "";
            position: absolute;
            inset: 74px 0 auto;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--hero-line), transparent);
        }

        .hero .container {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 0.92fr) minmax(440px, 1.08fr);
            align-items: center;
            gap: clamp(36px, 6vw, 72px);
        }

        .hero-content {
            max-width: 620px;
        }

        .hero-title {
            margin-top: 22px;
            font-size: clamp(42px, 5.2vw, 68px);
            color: var(--hero-ink);
        }

        .hero-title .highlight {
            color: var(--hero-highlight);
        }

        .hero-description {
            max-width: 590px;
            margin-top: 20px;
            color: var(--hero-muted);
            font-size: clamp(17px, 1.7vw, 20px);
            line-height: 1.64;
        }

        .hero-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            margin-top: 32px;
        }

        .hero-metrics {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-top: 40px;
        }

        .hero-metric {
            padding: 16px 14px;
            border: 1px solid var(--metric-border);
            border-radius: var(--radius);
            background: var(--metric-bg);
        }

        .hero-metric strong {
            display: block;
            color: var(--metric-ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 24px;
            line-height: 1;
        }

        .hero-metric span {
            display: block;
            margin-top: 7px;
            color: var(--metric-muted);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        .hero-card {
            position: relative;
            align-self: stretch;
            display: grid;
            align-items: center;
        }

        .platform-preview {
            overflow: hidden;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--preview-bg);
            box-shadow: var(--shadow);
        }

        .preview-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px 18px;
            border-bottom: 1px solid var(--line);
            color: var(--ink);
            background: var(--surface);
        }

        .preview-window-dots {
            display: flex;
            gap: 7px;
        }

        .preview-window-dots span {
            width: 9px;
            height: 9px;
            border-radius: 50%;
            background: #d7deea;
        }

        .preview-window-dots span:first-child {
            background: #f87171;
        }

        .preview-window-dots span:nth-child(2) {
            background: #fbbf24;
        }

        .preview-window-dots span:nth-child(3) {
            background: #34d399;
        }

        .preview-label {
            color: var(--muted);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        .preview-shell {
            display: grid;
            grid-template-columns: 180px minmax(0, 1fr);
            min-height: 470px;
            color: var(--ink);
        }

        .preview-sidebar {
            padding: 20px;
            border-right: 1px solid var(--line);
            background: var(--surface);
        }

        .preview-mini-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 28px;
            font-weight: 800;
        }

        .preview-mini-brand span {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: var(--primary);
        }

        .preview-nav {
            display: grid;
            gap: 10px;
        }

        .preview-nav span {
            height: 34px;
            border-radius: 8px;
            background: var(--preview-soft);
        }

        .preview-nav span:first-child {
            background: var(--dark);
        }

        .preview-content {
            padding: 22px;
        }

        .preview-content-head {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 18px;
        }

        .preview-heading {
            width: 210px;
            height: 16px;
            border-radius: 999px;
            background: var(--dark);
        }

        .preview-search {
            width: 148px;
            height: 34px;
            border-radius: 999px;
            background: var(--preview-search);
        }

        .case-table {
            overflow: hidden;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--surface);
        }

        .case-row {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr 0.8fr 1fr;
            align-items: center;
            gap: 16px;
            min-height: 70px;
            padding: 14px 18px;
            border-bottom: 1px solid var(--line);
        }

        .case-row:last-child {
            border-bottom: 0;
        }

        .client-cell {
            display: flex;
            align-items: center;
            gap: 11px;
        }

        .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--cyan));
        }

        .line-stack {
            display: grid;
            gap: 6px;
            width: 100%;
        }

        .line {
            display: block;
            height: 9px;
            border-radius: 999px;
            background: var(--preview-line);
        }

        .line.short {
            width: 58%;
        }

        .line.mid {
            width: 76%;
        }

        .status-pill {
            justify-self: start;
            padding: 6px 10px;
            border-radius: 999px;
            color: var(--success-ink);
            background: var(--success-bg);
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }

        .progress-track {
            height: 8px;
            border-radius: 999px;
            background: var(--preview-soft);
        }

        .progress-track span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: var(--primary);
        }

        .portal-shell {
            display: grid;
            grid-template-columns: 190px minmax(0, 1fr);
            min-height: 500px;
            color: var(--ink);
        }

        .portal-sidebar {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 20px;
            border-right: 1px solid var(--line);
            background: var(--surface);
        }

        .portal-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--ink);
            font-size: 14px;
            font-weight: 800;
        }

        .portal-brand-mark {
            display: grid;
            place-items: center;
            width: 30px;
            height: 30px;
            border-radius: var(--radius);
            color: #ffffff;
            background: var(--primary);
            font-size: 13px;
        }

        .portal-menu {
            display: grid;
            gap: 8px;
        }

        .portal-menu-item {
            display: flex;
            align-items: center;
            gap: 9px;
            min-height: 34px;
            padding: 0 10px;
            border-radius: var(--radius);
            color: var(--muted);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        .portal-menu-item::before {
            content: "";
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--preview-line);
        }

        .portal-menu-item.active {
            color: var(--primary);
            background: color-mix(in srgb, var(--primary) 12%, transparent);
        }

        .portal-menu-item.active::before {
            background: var(--primary);
        }

        .portal-help {
            margin-top: auto;
            padding: 14px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--bg-panel);
        }

        .portal-help strong {
            display: block;
            color: var(--ink);
            font-size: 13px;
            line-height: 1.25;
        }

        .portal-help span {
            display: block;
            margin-top: 6px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.4;
        }

        .portal-main {
            display: grid;
            gap: 16px;
            padding: 22px;
        }

        .portal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .portal-kicker {
            color: var(--muted);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .portal-title {
            margin-top: 4px;
            color: var(--ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 22px;
            font-weight: 800;
            line-height: 1.12;
        }

        .portal-user {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 10px;
            border: 1px solid var(--line);
            border-radius: 999px;
            background: var(--surface);
            color: var(--ink);
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
        }

        .portal-user-avatar {
            display: grid;
            place-items: center;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            color: #ffffff;
            background: linear-gradient(135deg, var(--primary), var(--cyan));
            font-size: 11px;
        }

        .portal-case-card {
            padding: 20px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background:
                linear-gradient(135deg, color-mix(in srgb, var(--primary) 11%, transparent), transparent 42%),
                var(--surface);
            box-shadow: var(--shadow-soft);
        }

        .portal-case-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
        }

        .portal-case-type {
            color: var(--primary);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
        }

        .portal-case-title {
            margin-top: 6px;
            color: var(--ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 24px;
            font-weight: 800;
            line-height: 1.08;
        }

        .portal-pill {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 7px 10px;
            border-radius: 999px;
            color: var(--success-ink);
            background: var(--success-bg);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .portal-pill::before {
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
        }

        .portal-progress-row {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 14px;
            align-items: center;
            margin-top: 18px;
        }

        .portal-progress-label {
            color: var(--muted);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .portal-progress-value {
            color: var(--ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 20px;
            font-weight: 800;
            line-height: 1;
        }

        .portal-progress-bar {
            grid-column: 1 / -1;
            height: 10px;
            overflow: hidden;
            border-radius: 999px;
            background: var(--preview-soft);
        }

        .portal-progress-bar span {
            display: block;
            width: 68%;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, var(--primary), var(--cyan));
        }

        .portal-grid {
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
            gap: 16px;
        }

        .portal-panel {
            padding: 16px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--surface);
        }

        .portal-panel-title {
            color: var(--ink);
            font-size: 14px;
            font-weight: 800;
        }

        .portal-task-list {
            display: grid;
            gap: 11px;
            margin-top: 14px;
        }

        .portal-task {
            display: grid;
            grid-template-columns: 24px minmax(0, 1fr);
            gap: 10px;
            align-items: start;
        }

        .portal-check {
            display: grid;
            place-items: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            color: #ffffff;
            background: var(--primary);
            font-size: 12px;
            font-weight: 800;
        }

        .portal-task.pending .portal-check {
            color: var(--primary);
            background: color-mix(in srgb, var(--primary) 14%, transparent);
        }

        .portal-task strong {
            display: block;
            color: var(--ink);
            font-size: 13px;
            line-height: 1.25;
        }

        .portal-task span {
            display: block;
            margin-top: 3px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.35;
        }

        .portal-docs {
            display: grid;
            gap: 9px;
            margin-top: 14px;
        }

        .portal-doc {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 11px 12px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--bg-panel);
        }

        .portal-doc-name {
            color: var(--ink);
            font-size: 13px;
            font-weight: 800;
        }

        .portal-doc-status {
            color: var(--muted);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .glass-card {
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: color-mix(in srgb, var(--surface) 92%, transparent);
            box-shadow: var(--shadow-soft);
        }

        .expert-card {
            position: absolute;
            right: 24px;
            bottom: -36px;
            width: min(360px, calc(100% - 48px));
            padding: 22px;
            color: var(--ink);
        }

        .expert-tag {
            display: inline-block;
            color: var(--primary);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .expert-name {
            margin-top: 8px;
            font-size: 24px;
            color: var(--ink);
        }

        .expert-title {
            margin-top: 7px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.55;
        }

        .expert-stats {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
            padding-top: 16px;
            border-top: 1px solid var(--line);
        }

        .stat-value {
            display: block;
            color: var(--ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 22px;
            font-weight: 800;
            line-height: 1;
        }

        .stat-label {
            display: block;
            margin-top: 6px;
            color: var(--muted);
            font-size: 12px;
            font-weight: 700;
            line-height: 1.35;
        }

        .services {
            padding: clamp(72px, 9vw, 120px) 0;
            background: var(--bg-soft);
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
        }

        .service-card {
            display: flex;
            min-height: 310px;
            flex-direction: column;
            padding: 24px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--surface);
            box-shadow: 0 1px 0 rgba(13, 22, 48, 0.02);
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }

        .service-card:hover {
            transform: translateY(-4px);
            border-color: rgba(45, 99, 255, 0.26);
            box-shadow: var(--shadow-soft);
        }

        .service-tag {
            width: fit-content;
            padding: 6px 10px;
            border-radius: 999px;
            color: var(--primary);
            background: color-mix(in srgb, var(--primary) 14%, transparent);
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
        }

        .service-name {
            margin-top: 22px;
            color: var(--ink);
            font-size: 23px;
            line-height: 1.12;
        }

        .service-desc {
            margin-top: 14px;
            margin-bottom: 24px;
            color: var(--muted);
            font-size: 15px;
            line-height: 1.62;
        }

        .how-it-works {
            padding: clamp(72px, 9vw, 118px) 0;
            background: var(--bg);
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
            margin-top: 38px;
        }

        .step-card {
            position: relative;
            min-height: 260px;
            padding: 26px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: linear-gradient(180deg, var(--surface), var(--bg-panel));
        }

        .step-number {
            color: var(--primary);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.16em;
        }

        .step-title {
            margin-top: 42px;
            color: var(--ink);
            font-size: 25px;
        }

        .step-desc {
            margin-top: 13px;
            color: var(--muted);
            font-size: 15px;
        }

        .proof-band {
            padding: 44px 0;
            color: var(--proof-ink);
            background: var(--proof-bg);
        }

        .proof-grid {
            display: grid;
            grid-template-columns: 1.4fr repeat(3, minmax(0, 1fr));
            gap: 18px;
            align-items: center;
        }

        .proof-title {
            color: var(--proof-ink);
            font-size: 25px;
        }

        .proof-copy {
            margin-top: 8px;
            color: var(--proof-muted);
            font-size: 15px;
        }

        .proof-item {
            padding: 18px;
            border: 1px solid var(--proof-card-border);
            border-radius: var(--radius);
            background: var(--proof-card-bg);
        }

        .proof-item strong {
            display: block;
            color: var(--proof-ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 27px;
            line-height: 1;
        }

        .proof-item span {
            display: block;
            margin-top: 8px;
            color: var(--proof-muted);
            font-size: 13px;
            font-weight: 700;
        }

        .testimonials {
            padding: clamp(72px, 9vw, 118px) 0;
            background: var(--bg-soft);
        }

        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
        }

        .testimonial-card {
            display: flex;
            min-height: 280px;
            flex-direction: column;
            gap: 20px;
            padding: 24px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--surface);
        }

        .testimonial-text {
            color: var(--ink);
            font-size: 16px;
            line-height: 1.7;
        }

        .testimonial-author {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: auto;
            padding-top: 18px;
            border-top: 1px solid var(--line);
        }

        .testimonial-photo {
            width: 38px;
            height: 38px;
            flex: 0 0 auto;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid color-mix(in srgb, var(--primary) 24%, var(--surface));
            background: linear-gradient(135deg, var(--primary), var(--cyan));
        }

        .author-name {
            display: block;
            color: var(--ink);
            font-weight: 800;
        }

        .author-role {
            display: block;
            margin-top: 3px;
            color: var(--muted);
            font-size: 13px;
            font-weight: 600;
        }

        .faq {
            padding: clamp(72px, 9vw, 112px) 0;
            background: var(--bg);
        }

        .faq-list {
            max-width: 850px;
            margin: 0 auto;
            display: grid;
            gap: 12px;
        }

        .faq-item {
            padding: 22px 24px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: var(--surface);
        }

        .faq-question {
            color: var(--ink);
            font-family: 'Manrope', 'Inter', sans-serif;
            font-size: 18px;
            font-weight: 800;
            line-height: 1.25;
        }

        .faq-answer {
            margin-top: 9px;
            color: var(--muted);
            font-size: 15px;
        }

        .footer {
            padding: 58px 0 30px;
            color: var(--footer-ink);
            background: var(--footer-bg);
            border-top: 1px solid var(--footer-border);
        }

        .footer-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(180px, 0.8fr) minmax(240px, 1fr) minmax(180px, 0.9fr);
            gap: 36px;
            margin-bottom: 44px;
        }

        .footer .logo-text {
            color: var(--footer-ink);
        }

        .footer .logo-text::before {
            background: var(--primary);
            color: #ffffff;
            box-shadow: 0 10px 24px rgba(45, 99, 255, 0.22);
        }

        .footer-desc {
            max-width: 390px;
            margin-top: 18px;
            color: var(--footer-muted);
            font-size: 15px;
        }

        .footer h4 {
            margin-bottom: 16px;
            color: var(--footer-ink);
            font-size: 12px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        .footer ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .footer li {
            margin-bottom: 10px;
            color: var(--footer-muted);
            font-size: 14px;
        }

        .footer a {
            color: var(--footer-muted);
            text-decoration: none;
        }

        .footer a:hover {
            color: var(--footer-ink);
        }

        .footer-social {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .footer-social-links {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .footer-social-links a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 104px;
            padding: 11px 14px;
            border-radius: 999px;
            border: 1px solid var(--footer-border);
            background: rgba(255, 255, 255, 0.35);
            color: var(--footer-muted);
            transition: color .2s ease, border-color .2s ease, background .2s ease;
        }

        .footer-social-links a:hover {
            color: var(--footer-ink);
            border-color: rgba(45, 99, 255, 0.18);
            background: rgba(255, 255, 255, 0.7);
        }

        .footer-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding-top: 24px;
            border-top: 1px solid var(--footer-border);
            color: var(--footer-muted);
            font-size: 14px;
        }

        .social-links {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }

        @media (max-width: 1080px) {
            .menu-toggle {
                display: inline-flex;
                order: 2;
            }

            .header .container {
                flex-wrap: wrap;
            }

            .nav-actions {
                display: none;
                order: 3;
                flex-basis: 100%;
                flex-direction: column;
                align-items: stretch;
                justify-content: flex-start;
                gap: 16px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--header-border);
            }

            .nav-actions.is-open {
                display: flex;
            }

            .nav {
                flex-direction: column;
                align-items: flex-start;
                gap: 14px;
            }

            .header-actions {
                flex-direction: column;
                align-items: stretch;
                gap: 10px;
            }

            .header-actions .btn {
                width: 100%;
            }

            .hero .container {
                grid-template-columns: 1fr;
            }

            .hero-content {
                max-width: 820px;
            }

            .hero-card {
                max-width: 820px;
            }

            .services-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 900px) {
            .steps-grid,
            .testimonials-grid,
            .proof-grid,
            .footer-grid {
                grid-template-columns: 1fr;
            }

            .proof-grid {
                gap: 12px;
            }
        }

        @media (max-width: 720px) {
            .container {
                width: min(var(--max), calc(100% - 28px));
            }

            .header {
                padding: 12px 0;
            }

            .logo-text {
                max-width: 190px;
                overflow: hidden;
                font-size: 18px;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .logo-text::before {
                width: 29px;
                height: 29px;
            }

            .hero {
                min-height: auto;
                padding-top: 104px;
            }

            .hero-title {
                font-size: clamp(35px, 12vw, 48px);
            }

            .hero-actions {
                display: grid;
            }

            .hero-actions .btn,
            .header-actions .btn {
                width: 100%;
            }

            .hero-metrics {
                grid-template-columns: 1fr;
            }

            .preview-shell {
                grid-template-columns: 1fr;
                min-height: auto;
            }

            .preview-sidebar {
                display: none;
            }

            .portal-shell {
                grid-template-columns: 1fr;
                min-height: auto;
            }

            .portal-sidebar {
                display: none;
            }

            .portal-main {
                padding: 14px;
            }

            .portal-header,
            .portal-case-top {
                align-items: flex-start;
                flex-direction: column;
            }

            .portal-grid {
                grid-template-columns: 1fr;
            }

            .portal-user,
            .portal-pill {
                white-space: normal;
            }

            .case-row {
                grid-template-columns: 1fr;
                gap: 10px;
            }

            .preview-content-head {
                flex-direction: column;
            }

            .preview-search,
            .preview-heading {
                width: 100%;
            }

            .expert-card {
                position: static;
                width: 100%;
                margin-top: 14px;
            }

            .services-grid {
                grid-template-columns: 1fr;
            }

            .service-card,
            .step-card,
            .testimonial-card {
                min-height: auto;
            }

            .footer-bottom {
                flex-direction: column;
                align-items: flex-start;
            }
        }

        @media (max-width: 420px) {
            .header .container {
                gap: 12px;
            }

            .logo-text {
                max-width: 128px;
                font-size: 16px;
            }

            .btn-sm {
                padding-inline: 12px;
            }

            .badge {
                font-size: 11px;
                letter-spacing: 0.08em;
            }

            .section-header {
                text-align: left;
            }

            .section-subtitle {
                margin-left: 0;
            }

            .preview-topbar {
                padding-inline: 14px;
            }

            .preview-content {
                padding: 14px;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">
                <span class="logo-text">SEU LOGO</span>
            </div>
            <button class="menu-toggle" type="button" data-menu-toggle aria-label="Abrir menu" aria-expanded="false">
                <span aria-hidden="true">☰</span>
            </button>
            <div class="nav-actions" data-nav-actions>
                <nav class="nav">
                    <a href="/" class="nav-link">Início</a>
                    <a href="/quem-somos" class="nav-link">Quem Somos</a>
                    <a href="/servicos" class="nav-link">Nossos Serviços</a>
                    <a href="/contato" class="nav-link">Fale Conosco</a>
                </nav>
                <div class="header-actions">
                    <button class="theme-toggle" type="button" data-theme-toggle aria-label="Alternar tema" aria-pressed="false">
                        <span class="theme-toggle-icon" aria-hidden="true">☀</span>
                        <span class="theme-toggle-icon" aria-hidden="true">☾</span>
                    </button>
                    <a href="/track-my-visa" class="btn btn-outline btn-sm btn-track">Acompanhar Caso</a>
                    <a href="#" class="btn btn-outline btn-sm">Entrar</a>
                </div>
            </div>
        </div>
    </header>

    <main>
        <section class="hero">
            <div class="container">
                <div class="hero-content">
                    <div class="badge">PREMIUM VISA ADVISORY</div>
                    <h1 class="hero-title">Stop wasting time with visa uncertainty: get <span class="highlight">legal strategy</span> from start to finish</h1>
                    <p class="hero-description">Premium advisory for B1/B2, F1, status extension, and change of status with human support and a clear action plan.</p>
                    <div class="hero-actions">
                        <a href="#" class="btn btn-primary">I want my case reviewed</a>
                        <a href="#" class="btn btn-secondary">Falar com especialista</a>
                    </div>
                    <div class="hero-metrics" aria-label="Indicadores de atendimento">
                        <div class="hero-metric">
                            <strong>−70%</strong>
                            <span>menos retrabalho</span>
                        </div>
                        <div class="hero-metric">
                            <strong>24h</strong>
                            <span>plano inicial</span>
                        </div>
                        <div class="hero-metric">
                            <strong>4.9/5</strong>
                            <span>satisfacao media</span>
                        </div>
                    </div>
                </div>

                <div class="hero-card">
                    <div class="platform-preview" aria-hidden="true">
                        <div class="preview-topbar">
                            <div class="preview-window-dots"><span></span><span></span><span></span></div>
                            <span class="preview-label">Portal do cliente</span>
                        </div>
                        <div class="portal-shell">
                            <aside class="portal-sidebar">
                                <div class="portal-brand">
                                    <span class="portal-brand-mark">A</span>
                                    <span>Visa desk</span>
                                </div>
                                <div class="portal-menu">
                                    <span class="portal-menu-item active">Meu caso</span>
                                    <span class="portal-menu-item">Documentos</span>
                                    <span class="portal-menu-item">Mensagens</span>
                                    <span class="portal-menu-item">Pagamentos</span>
                                </div>
                                <div class="portal-help">
                                    <strong class="portal-help-title">Proxima orientacao</strong>
                                    <span class="portal-help-desc">Revise o checklist antes da entrevista consular.</span>
                                </div>
                            </aside>
                            <div class="portal-main">
                                <div class="portal-header">
                                    <div>
                                        <div class="portal-kicker">Acompanhamento em tempo real</div>
                                        <div class="portal-title">Portal do cliente</div>
                                    </div>
                                    <div class="portal-user">
                                        <span class="portal-user-avatar">MC</span>
                                        <span class="portal-user-name">Marina Costa</span>
                                    </div>
                                </div>

                                <div class="portal-case-card">
                                    <div class="portal-case-top">
                                        <div>
                                            <div class="portal-case-type">Visto F-1 · estudante</div>
                                            <div class="portal-case-title">Preparacao DS-160 e entrevista</div>
                                        </div>
                                        <span class="portal-pill">Em revisao</span>
                                    </div>
                                    <div class="portal-progress-row">
                                        <span class="portal-progress-label">Progresso do caso</span>
                                        <strong class="portal-progress-value">68%</strong>
                                        <span class="portal-progress-bar"><span style="width:68%"></span></span>
                                    </div>
                                </div>

                                <div class="portal-grid">
                                    <div class="portal-panel">
                                        <div class="portal-panel-title">Checklist da jornada</div>
                                        <div class="portal-task-list">
                                            <div class="portal-task">
                                                <span class="portal-check">✓</span>
                                                <div>
                                                    <strong class="portal-task-title">Perfil analisado</strong>
                                                    <span class="portal-task-desc">Estrategia definida pela equipe juridica.</span>
                                                </div>
                                            </div>
                                            <div class="portal-task">
                                                <span class="portal-check">✓</span>
                                                <div>
                                                    <strong class="portal-task-title">Documentos recebidos</strong>
                                                    <span class="portal-task-desc">Comprovantes organizados no dossie.</span>
                                                </div>
                                            </div>
                                            <div class="portal-task pending">
                                                <span class="portal-check">3</span>
                                                <div>
                                                    <strong class="portal-task-title">Revisao final</strong>
                                                    <span class="portal-task-desc">Formulario e narrativa em validacao.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="portal-panel">
                                        <div class="portal-panel-title">Documentos recentes</div>
                                        <div class="portal-docs">
                                            <div class="portal-doc">
                                                <span class="portal-doc-name">I-20 atualizado</span>
                                                <span class="portal-doc-status">Aprovado</span>
                                            </div>
                                            <div class="portal-doc">
                                                <span class="portal-doc-name">Extrato financeiro</span>
                                                <span class="portal-doc-status">Recebido</span>
                                            </div>
                                            <div class="portal-doc">
                                                <span class="portal-doc-name">DS-160 draft</span>
                                                <span class="portal-doc-status">Revisao</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="glass-card expert-card">
                        <div class="expert-header">
                            <span class="expert-tag">Direct support from a responsible attorney</span>
                            <h3 class="expert-name">Dra. Carolina Mendes</h3>
                            <p class="expert-title">Immigration attorney focused on visas and approval strategy.</p>
                        </div>
                        <div class="expert-stats">
                            <div class="stat-item">
                                <span class="stat-value">+2.000</span>
                                <span class="stat-label">Clientes atendidos</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">4.9/5</span>
                                <span class="stat-label">Average satisfaction</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="services">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Visa services focused on results</h2>
                    <p class="section-subtitle">Legal solutions for every stage of your immigration journey, with document organization and tailored strategy.</p>
                </div>

                <div class="services-grid">
                    <div class="service-card">
                        <div class="service-tag">B1/B2</div>
                        <h3 class="service-name">Tourist Visa</h3>
                        <p class="service-desc">Tourism and business support with profile prep, DS-160, and interview guidance.</p>
                        <a href="#" class="btn btn-card">Hire service</a>
                    </div>

                    <div class="service-card">
                        <div class="service-tag">F1</div>
                        <h3 class="service-name">Student Visa</h3>
                        <p class="service-desc">Complete plan for students, aligning academic documentation and immigration narrative.</p>
                        <a href="#" class="btn btn-card">Hire service</a>
                    </div>

                    <div class="service-card">
                        <div class="service-tag">EOS</div>
                        <h3 class="service-name">Status Extension</h3>
                        <p class="service-desc">Technical filing to extend lawful stay without improvisation.</p>
                        <a href="#" class="btn btn-card">Hire service</a>
                    </div>

                    <div class="service-card">
                        <div class="service-tag">COS</div>
                        <h3 class="service-name">Change of Status</h3>
                        <p class="service-desc">Category change with legal strategy and denial-risk mitigation.</p>
                        <a href="#" class="btn btn-card">Hire service</a>
                    </div>
                </div>
            </div>
        </section>

        <section class="how-it-works">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Como funciona nossa assessoria</h2>
                    <p class="section-subtitle">A clear, structured process to maximize your visa approval chances.</p>
                </div>
                <div class="steps-grid">
                    <div class="step-card">
                        <div class="step-number">01</div>
                        <h3 class="step-title">Profile Analysis</h3>
                        <p class="step-desc">We assess your history and goals to define the best immigration strategy.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">02</div>
                        <h3 class="step-title">Document Preparation</h3>
                        <p class="step-desc">We organize all required documents with technical rigor and double-checking.</p>
                    </div>
                    <div class="step-card">
                        <div class="step-number">03</div>
                        <h3 class="step-title">Protocolo e Acompanhamento</h3>
                        <p class="step-desc">We file and track every step through the final consular decision.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="proof-band" aria-label="Indicadores de confianca">
            <div class="container">
                <div class="proof-grid">
                    <div>
                        <h2 class="proof-title">Execucao previsivel do primeiro contato ate a decisao.</h2>
                        <p class="proof-copy">Padronize documentos, reduza ruído com o cliente e acompanhe cada etapa em uma experiencia clara.</p>
                    </div>
                    <div class="proof-item">
                        <strong>3×</strong>
                        <span>mais organizacao operacional</span>
                    </div>
                    <div class="proof-item">
                        <strong>99%</strong>
                        <span>consistencia no checklist</span>
                    </div>
                    <div class="proof-item">
                        <strong>1</strong>
                        <span>portal para toda a jornada</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="testimonials">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Quem contrata recomenda</h2>
                    <p class="section-subtitle">Success stories from clients who trusted our strategic advisory.</p>
                </div>
                <div class="testimonials-grid">
                    <div class="testimonial-card">
                        <p class="testimonial-text">"Carolina's strategy was essential for my F1 visa approval after a previous denial. Highly recommended!"</p>
                        <div class="testimonial-author">
                            <img class="testimonial-photo" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80" alt="Ricardo Silva" loading="lazy" />
                            <div class="author-info">
                                <span class="author-name">Ricardo Silva</span>
                                <span class="author-role">Estudante em Boston</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <p class="testimonial-text">"Impeccable professionalism. My status extension was handled with total confidence and clarity. Outstanding team."</p>
                        <div class="testimonial-author">
                            <img class="testimonial-photo" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80" alt="Mariana Costa" loading="lazy" />
                            <div class="author-info">
                                <span class="author-name">Mariana Costa</span>
                                <span class="author-role">Tourism and Business</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card">
                        <p class="testimonial-text">"Human support is the key difference. I felt confident at every step. Fast approval!"</p>
                        <div class="testimonial-author">
                            <img class="testimonial-photo" src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80" alt="Juliana Lins" loading="lazy" />
                            <div class="author-info">
                                <span class="author-name">Juliana Lins</span>
                                <span class="author-role">Change of Status</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="faq">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Frequently Asked Questions</h2>
                    <p class="section-subtitle">Get answers about the visa process and our advisory.</p>
                </div>
                <div class="faq-list">
                    <div class="faq-item">
                        <div class="faq-question">What is the difference between advisory services and an attorney?</div>
                        <div class="faq-answer">Our advisory is led by specialist attorneys, ensuring legal rigor beyond standard advisory services.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Quanto tempo demora o processo?</div>
                        <div class="faq-answer">Timing varies by visa type and consular demand, but our preparation usually takes 15 to 30 days.</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">Do you guarantee approval?</div>
                        <div class="faq-answer">No professional can guarantee approval, but our legal strategy maximizes your chances by mitigating common risks.</div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <span class="logo-text">SEU LOGO</span>
                    <p class="footer-desc">Strategic legal advisory for those seeking confidence and clarity in the U.S. visa process.</p>
                    <div class="footer-social-links">
                        <a href="#">Instagram</a>
                        <a href="#">LinkedIn</a>
                        <a href="#">WhatsApp</a>
                    </div>
                </div>
                <div class="footer-links">
                    <h4>Useful Links</h4>
                    <ul>
                        <li><a href="#">Services</a></li>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Depoimentos</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>Contact</h4>
                    <ul>
                        <li>contato@seulogo.com.br</li>
                        <li>+55 (11) 99999-9999</li>
                        <li>Sao Paulo, SP - Brazil</li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="#">Terms of Use</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Refund Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>Powered by Aplikei</p>
                <div class="social-links">
                    <a href="#">Terms of Use</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Refund Policy</a>
                </div>
            </div>
        </div>
    </footer>

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
</body>
</html>

`;

export function getLandingTemplateHtml() {
  return landingTemplateHtml;
}
