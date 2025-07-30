document.addEventListener('DOMContentLoaded', () => {
    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // A short delay to ensure animations aren't jarring
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 500);
    }

    // --- Initialize Animate on Scroll ---
    AOS.init({ duration: 800, once: true });

    // --- Mobile menu toggle ---
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- Header Scroll & Active Link Logic ---
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('header nav a[href^="#"]');
    const sections = document.querySelectorAll('main section[id], #experience, #education');

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('header-scrolled', window.scrollY > 50);
        });
    }
    
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.remove('active-link');
                    // Special handling for combined experience/education section
                    const href = link.getAttribute('href').substring(1);
                    if (href === id || (id === 'experience-education' && (href === 'experience' || href === 'education'))) {
                         link.classList.add('active-link');
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => { observer.observe(section); });

    // --- Digital Rain Background ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        let cols = Math.floor(w / 20) + 1;
        let ypos = Array(cols).fill(0);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);
        function matrix() {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(0, 194, 169, 0.3)';
            ctx.font = '15pt monospace';
            ypos.forEach((y, ind) => {
                const text = String.fromCharCode(Math.random() * 128);
                const x = ind * 20;
                ctx.fillText(text, x, y);
                if (y > 100 + Math.random() * 10000) { ypos[ind] = 0; } else { ypos[ind] = y + 20; }
            });
        }
        setInterval(matrix, 60);
        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            cols = Math.floor(w / 20) + 1;
            ypos = Array(cols).fill(0);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, w, h);
        });
    }

    // --- CV Modal Logic ---
    const cvModal = document.getElementById('cv-modal');
    const openCvBtns = document.querySelectorAll('.open-cv-btn');
    const closeCvBtn = document.getElementById('close-cv-modal');
    if(cvModal && openCvBtns.length && closeCvBtn) {
        openCvBtns.forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); cvModal.classList.remove('hidden'); });
        });
        const closeModal = () => { cvModal.classList.add('hidden'); };
        closeCvBtn.addEventListener('click', closeModal);
        cvModal.addEventListener('click', (e) => { if (e.target === cvModal) { closeModal(); } });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !cvModal.classList.contains('hidden')) { closeModal(); } });
    }

    // --- Contact Form Submission Logic ---
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        const formStatus = document.getElementById('form-status');
        const submitBtnText = document.getElementById('submit-btn-text');
        const submitBtnLoader = document.getElementById('submit-btn-loader');
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);
            submitBtnText.classList.add('hidden');
            submitBtnLoader.classList.remove('hidden');
            formStatus.innerHTML = '';
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: json
            })
            .then(async (response) => {
                let jsonResponse = await response.json();
                if (response.status == 200) {
                    formStatus.innerHTML = `<span style="color: #00c2a9;">Submitted successfully!</span>`;
                    contactForm.reset();
                } else {
                    formStatus.innerHTML = `<span style="color: #ef4444;">${jsonResponse.message}</span>`;
                }
            })
            .catch(error => {
                console.error(error);
                formStatus.innerHTML = '<span style="color: #ef4444;">Something went wrong. Please try again.</span>';
            })
            .finally(() => {
                submitBtnText.classList.remove('hidden');
                submitBtnLoader.classList.add('hidden');
                setTimeout(() => { formStatus.innerHTML = ''; }, 5000);
            });
        });
    }
    
    // --- GitHub Repos Fetcher ---
    fetchGithubRepos();
});


// --- All other functions can be defined outside the DOMContentLoaded if they are self-contained ---

async function fetchGithubRepos() {
    const username = 'souravsahapartho';
    const repoGrid = document.getElementById('github-repos-grid');
    if (!repoGrid) return;
    const url = `https://api.github.com/users/${username}/repos?sort=pushed&per_page=6`;

    try {
        const response = await fetch(url);
        if (!response.ok) { throw new Error(`GitHub API error: ${response.status}`); }
        const repos = await response.json();
        repoGrid.innerHTML = '';
        if (repos.length === 0) {
            repoGrid.innerHTML = '<p class="text-brand-secondary col-span-full text-center">No public repositories found.</p>';
            return;
        }
        repos.forEach(repo => {
            const repoCard = `
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-card p-6 rounded-lg flex flex-col h-full">
                    <div class="flex-grow">
                        <h3 class="text-xl font-bold text-white text-glow mb-2">${repo.name}</h3>
                        <p class="text-brand-secondary text-sm mb-4">${repo.description || 'No description provided.'}</p>
                    </div>
                    <div class="flex items-center text-sm text-brand-secondary/80 mt-auto">
                        ${repo.language ? `<span class="flex items-center mr-4"><span class="w-3 h-3 rounded-full mr-2 bg-brand-accent"></span>${repo.language}</span>` : ''}
                        <span class="flex items-center mr-4"><svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/></svg>${repo.stargazers_count}</span>
                        <span class="flex items-center"><svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM11 5.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z"/></svg>${repo.forks_count}</span>
                    </div>
                </a>
            `;
            repoGrid.innerHTML += repoCard;
        });
    } catch (error) {
        repoGrid.innerHTML = `<p class="text-red-400 col-span-full text-center">Failed to load projects from GitHub. Please try again later.</p>`;
        console.error('GitHub API Error:', error);
    }
}

const aiPromptInput = document.getElementById('ai-prompt');
// ... other AI assistant related consts
const souravInfo = `...`;
// ... The rest of the AI assistant logic and other functions