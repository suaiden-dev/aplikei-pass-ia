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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --secondary: #1e293b;
            --bg-dark: #ffffff;
            --bg-section: #f1f5f9;
            --bg-card: rgba(255, 255, 255, 0.9);
            --text-main: #0f172a;
            --text-muted: #475569;
            --accent: #2563eb;
            --glass-border: rgba(0, 0, 0, 0.1);
            --container-width: 1200px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-dark);
            color: var(--text-main);
            line-height: 1.6;
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        h1, h2, h3 {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
        }

        .container {
            max-width: var(--container-width);
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Header */
        .header {
            padding: 1.5rem 0;
            position: absolute;
            width: 100%;
            z-index: 100;
        }

        .header .container {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-text {
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, var(--text-main) 0%, var(--text-muted) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }

        /* Hero Section */
        .hero {
            position: relative;
            padding: 10rem 0 6rem;
            min-height: 100vh;
            display: flex;
            align-items: center;
            background: radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 90% 80%, rgba(96, 165, 250, 0.05) 0%, transparent 50%);
        }

        .hero .container {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 4rem;
            align-items: center;
        }

        .badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 99px;
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--accent);
            margin-bottom: 1.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            animation: fadeInDown 0.8s ease-out;
        }

        .hero-title {
            font-size: 4rem;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            animation: fadeInUp 0.8s ease-out;
        }

        .hero-title .highlight {
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .hero-description {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 600px;
            margin-bottom: 2.5rem;
            animation: fadeInUp 0.8s ease-out 0.2s backwards;
        }

        .hero-actions {
            display: flex;
            gap: 1.5rem;
            animation: fadeInUp 0.8s ease-out 0.4s backwards;
        }

        .hero-card {
            position: relative;
            animation: zoomIn 1s ease-out 0.3s backwards;
        }

        /* Buttons */
        .btn {
            display: inline-block;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            cursor: pointer;
            border: none;
        }

        .btn-sm {
            padding: 0.6rem 1.5rem;
            font-size: 0.875rem;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.5);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-main);
            border: 1px solid var(--glass-border);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }

        .btn-outline {
            border: 1px solid var(--glass-border);
            color: var(--text-main);
            background: transparent;
        }

        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .btn-card {
            width: 100%;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            color: var(--text-main);
            margin-top: auto;
        }

        .btn-card:hover {
            background: var(--primary);
            border-color: var(--primary);
            color: white;
        }

        /* Expert Card */
        .glass-card {
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        }

        .expert-tag {
            display: inline-block;
            font-size: 0.75rem;
            color: var(--accent);
            margin-bottom: 0.75rem;
        }

        .expert-name {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .expert-title {
            font-size: 0.875rem;
            color: var(--text-muted);
            margin-bottom: 2rem;
        }

        .expert-stats {
            display: flex;
            gap: 3rem;
            border-top: 1px solid var(--glass-border);
            padding-top: 1.5rem;
        }

        .stat-item {
            display: flex;
            flex-direction: column;
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--text-main);
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        /* Services Section */
        .services {
            padding: 8rem 0;
            background: var(--bg-section);
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .section-subtitle {
            color: var(--text-muted);
            max-width: 600px;
            margin: 0 auto;
        }

        .services-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }

        .service-card {
            background: white;
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 2rem;
            transition: var(--transition);
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .service-card:hover {
            transform: translateY(-10px);
            background: white;
            border-color: var(--primary);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .service-tag {
            font-size: 0.75rem;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 1rem;
            opacity: 0.7;
        }

        .service-name {
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }

        .service-desc {
            color: var(--text-muted);
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }

        /* How It Works Section */
        .how-it-works {
            padding: 8rem 0;
            background: var(--bg-dark);
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 3rem;
            margin-top: 4rem;
        }

        .step-card {
            position: relative;
            padding: 2rem;
        }

        .step-number {
            font-family: 'Outfit', sans-serif;
            font-size: 4rem;
            font-weight: 800;
            color: rgba(59, 130, 246, 0.1);
            position: absolute;
            top: 0;
            left: 0;
            line-height: 1;
        }

        .step-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            position: relative;
            z-index: 1;
        }

        .step-desc {
            color: var(--text-muted);
            position: relative;
            z-index: 1;
        }

        /* Testimonials Section */
        .testimonials {
            padding: 8rem 0;
            background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
        }

        .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
        }

        .testimonial-card {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            height: 100%;
        }

        .testimonial-text {
            font-style: italic;
            color: var(--text-main);
            line-height: 1.8;
        }

        .testimonial-author {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .author-name {
            display: block;
            font-weight: 700;
            color: var(--text-main);
        }

        .author-role {
            font-size: 0.875rem;
            color: var(--accent);
        }

        /* FAQ Section */
        .faq {
            padding: 5rem 0 3rem;
            background: var(--bg-section);
        }

        .faq-list {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }

        .faq-item {
            background: var(--bg-card);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 1.5rem 2rem;
        }

        .faq-question {
            font-family: 'Outfit', sans-serif;
            font-weight: 600;
            font-size: 1.125rem;
            margin-bottom: 0.75rem;
            color: var(--accent);
        }

        .faq-answer {
            color: var(--text-muted);
            font-size: 1rem;
        }

        /* Footer Section */
        .footer {
            padding: 3rem 0 2rem;
            background: var(--bg-section);
            border-top: 1px solid var(--glass-border);
        }

        .footer-grid {
            display: grid;
            grid-template-columns: 2fr 1fr 1.5fr;
            gap: 4rem;
            margin-bottom: 4rem;
        }

        .footer-brand .footer-desc {
            margin-top: 1.5rem;
            color: var(--text-muted);
            max-width: 300px;
        }

        .footer h4 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.125rem;
            margin-bottom: 1.5rem;
            color: var(--text-main);
        }

        .footer ul {
            list-style: none;
        }

        .footer ul li {
            margin-bottom: 0.75rem;
        }

        .footer ul li a {
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer ul li a:hover {
            color: var(--accent);
        }

        .footer-contact li {
            color: var(--text-muted);
        }

        .footer-bottom {
            padding-top: 2rem;
            border-top: 1px solid var(--glass-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        .social-links {
            display: flex;
            gap: 1.5rem;
        }

        .social-links a {
            color: var(--text-muted);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .social-links a:hover {
            color: var(--accent);
        }

        /* Animations */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes zoomIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        /* Responsive */
        @media (max-width: 1024px) {
            .hero-title { font-size: 3.5rem; }
        }

        @media (max-width: 992px) {
            .hero { padding: 8rem 0 4rem; }
            .hero .container { grid-template-columns: 1fr; text-align: center; gap: 3rem; }
            .hero-title { font-size: 3rem; }
            .hero-description { margin-left: auto; margin-right: auto; font-size: 1.1rem; }
            .hero-actions { justify-content: center; flex-wrap: wrap; }
            .expert-stats { justify-content: center; }
            .footer-grid { grid-template-columns: 1fr; gap: 3rem; text-align: center; }
            .footer-brand .footer-desc { margin-left: auto; margin-right: auto; }
            .footer-contact ul { display: inline-block; text-align: left; }
        }

        @media (max-width: 768px) {
            .header { padding: 0.85rem 0; }
            .header .container { padding: 0 1rem; }
            .header-actions { gap: 0.75rem; }
            .btn-sm { padding: 0.55rem 1rem; }
            .hero {
                min-height: auto;
                padding: 6.5rem 0 3.5rem;
                align-items: flex-start;
            }
            .hero .container { gap: 2rem; }
            .hero-content { max-width: 36rem; margin: 0 auto; }
            .section-title { font-size: 2rem; }
            .services, .how-it-works, .testimonials, .faq { padding: 5rem 0; }
            .footer-bottom { flex-direction: column; gap: 1.5rem; text-align: center; }
            .steps-grid { gap: 2rem; }
            .step-card { padding: 1.5rem; }
            .hero-title { font-size: 2.25rem; line-height: 1.08; margin-bottom: 1rem; }
            .hero-description { font-size: 1rem; margin-bottom: 1.75rem; }
        }

        @media (max-width: 640px) {
            .header .container { flex-direction: row; gap: 0.75rem; }
            .logo { min-width: 0; }
            .logo-text { font-size: 1.1rem; max-width: 12rem; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .header-actions { width: auto; justify-content: flex-end; gap: 0.65rem; }
            .nav .btn { white-space: nowrap; }
            .hero-title { font-size: 2rem; }
            .hero-actions { flex-direction: column; width: 100%; }
            .hero-actions .btn { width: 100%; text-align: center; }
            .container { padding: 0 1.25rem; }
            .badge {
                max-width: 100%;
                overflow-wrap: anywhere;
                margin-bottom: 1rem;
            }
            .glass-card { padding: 1.5rem; }
            .expert-stats { flex-direction: column; gap: 1.5rem; align-items: center; }
            .step-number { font-size: 3rem; }
            .service-card, .testimonial-card { padding: 1.5rem; }
        }

        @media (max-width: 480px) {
            .hero { padding: 5.75rem 0 3rem; }
            .hero-title { font-size: 1.65rem; line-height: 1.12; }
            .hero-description { font-size: 0.95rem; line-height: 1.55; }
            .section-title { font-size: 1.75rem; }
            .badge { font-size: 0.62rem; padding: 0.35rem 0.65rem; letter-spacing: 0.04em; }
            .btn { padding: 0.85rem 1rem; border-radius: 10px; }
            .hero-card { display: none; }
        }

        @media (max-width: 360px) {
            .container { padding: 0 1rem; }
            .logo-text { max-width: 9rem; }
            .hero-title { font-size: 1.45rem; }
            .hero-description { font-size: 0.9rem; }
            .badge { font-size: 0.58rem; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="logo">
                <span class="logo-text">SEU LOGO</span>
            </div>
            <div class="header-actions">
                <nav class="nav">
                    <a href="#" class="btn btn-outline btn-sm">Entrar</a>
                </nav>
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
                </div>
                <div class="hero-card">
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

        <section class="testimonials">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Quem contrata recomenda</h2>
                    <p class="section-subtitle">Success stories from clients who trusted our strategic advisory.</p>
                </div>
                <div class="testimonials-grid">
                    <div class="testimonial-card glass-card">
                        <p class="testimonial-text">"Carolina's strategy was essential for my F1 visa approval after a previous denial. Highly recommended!"</p>
                        <div class="testimonial-author">
                            <div class="author-info">
                                <span class="author-name">Ricardo Silva</span>
                                <span class="author-role">Estudante em Boston</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card glass-card">
                        <p class="testimonial-text">"Impeccable professionalism. My status extension was handled with total confidence and clarity. Outstanding team."</p>
                        <div class="testimonial-author">
                            <div class="author-info">
                                <span class="author-name">Mariana Costa</span>
                                <span class="author-role">Tourism and Business</span>
                            </div>
                        </div>
                    </div>
                    <div class="testimonial-card glass-card">
                        <p class="testimonial-text">"Human support is the key difference. I felt confident at every step. Fast approval!"</p>
                        <div class="testimonial-author">
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
            </div>
            <div class="footer-bottom">
                <p>Powered by Aplikei</p>
                <div class="social-links">
                    <a href="#">Instagram</a>
                    <a href="#">LinkedIn</a>
                    <a href="#">WhatsApp</a>
                </div>
            </div>
        </div>
    </footer>

</body>
</html>

`;

export function getLandingTemplateHtml() {
  return landingTemplateHtml;
}
