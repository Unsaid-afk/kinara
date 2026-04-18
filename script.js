// Music player — requires one user tap (browser autoplay policy)
function startSong(btn) {
    const iframe = document.getElementById('yt-music');
    const audio = document.getElementById('bg-audio');
    const nowPlaying = document.getElementById('now-playing');
    const playerBtn = document.getElementById('music-player-btn');

    // Try local MP3 first
    if (audio) {
        audio.volume = 1;
        const p = audio.play();
        if (p !== undefined) {
            p.then(() => {
                // Local file works!
                if (btn) btn.style.display = 'none';
                if (nowPlaying) nowPlaying.classList.remove('hidden');
                return;
            }).catch(() => {});
        }
    }

    // Set YouTube iframe src on user tap (this ALWAYS works with user gesture)
    if (iframe) {
        iframe.src = 'https://www.youtube.com/embed/9obfHCkaxD0?autoplay=1&mute=0&loop=1&playlist=9obfHCkaxD0&controls=0&modestbranding=1&rel=0';
    }

    if (btn) btn.style.display = 'none';
    if (nowPlaying) nowPlaying.classList.remove('hidden');
}

function playProposalSong() {
    // Show the ♫ Play Our Song button with a cinematic delay
    setTimeout(() => {
        const btn = document.getElementById('music-player-btn');
        if (btn) btn.style.opacity = '1';
    }, 800);
}

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // Fade out loader
    window.onload = () => {
        gsap.to('#loader', {
            opacity: 0, duration: 1, onComplete: () => {
                document.getElementById('loader').style.display = 'none';
                // Start chapter 1 animations
                gsap.to('.text-reveal', { backgroundPositionX: '0%', duration: 2, ease: 'power2.out' });
            }
        });
    };

    // Memory Typing & Fade Logic
    function typeEffect(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = "";
        const timer = setInterval(() => {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                // After typing, fade in the sibling shayri
                const shayri = element.nextElementSibling;
                if (shayri && shayri.classList.contains('shayri')) {
                    gsap.to(shayri, { opacity: 1, duration: 2 });
                }
            }
        }, speed);
    }

    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        const textElement = card.querySelector('.memory-text');
        if (!textElement) return;
        const text = textElement.getAttribute('data-text');

        ScrollTrigger.create({
            trigger: card,
            start: "top 90%", // Trigger slightly earlier as it enters the frame
            onEnter: () => {
                card.classList.add('in-view');
                if (!card.classList.contains('typed')) {
                    card.classList.add('typed');
                    textElement.style.opacity = "1";
                    typeEffect(textElement, text);
                }
            }
        });
    });

    // Chapter 2: Game A (Choice)
    const steps = document.querySelectorAll('.game-a-step');
    const choiceBtns = document.querySelectorAll('.choice-btn');
    const gameAResult = document.getElementById('game-a-result');
    const gameB = document.getElementById('game-b');

    choiceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.game-a-step');
            const stepNum = parseInt(currentStep.dataset.step);

            gsap.to(currentStep, {
                opacity: 0, y: -20, duration: 0.5, onComplete: () => {
                    currentStep.classList.add('hidden');

                    if (stepNum < steps.length) {
                        const nextStep = document.querySelector(`.game-a-step[data-step="${stepNum + 1}"]`);
                        nextStep.classList.remove('hidden');
                        gsap.to(nextStep, { opacity: 1, y: 0, duration: 0.5 });
                    } else {
                        gameAResult.classList.remove('hidden');
                        gsap.to(gameAResult, { opacity: 1, duration: 1 });

                        // Show Game B after delay
                        setTimeout(() => {
                            gameB.classList.remove('hidden');
                            gsap.fromTo(gameB, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
                            initMaze();
                        }, 2000);
                    }
                }
            });
        });
    });

    // Chapter 2: Game B (Maze)
    function initMaze() {
        const canvas = document.getElementById('maze-canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const container = canvas.parentElement;

        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const pathColor = '#ffffff';
        const startPos = { x: 50, y: canvas.height / 2 };
        const endPos = { x: canvas.width - 70, y: canvas.height / 2 };
        const pathWidth = 40;

        // Draw path (invisible logic layer, visible artistic layer)
        function drawPath() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Main Path
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = pathWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.moveTo(startPos.x, startPos.y);
            ctx.quadraticCurveTo(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
            ctx.quadraticCurveTo(3 * canvas.width / 4, 3 * canvas.height / 4, endPos.x, endPos.y);
            ctx.stroke();

            // Draw Heart at end
            drawHeart(endPos.x, endPos.y, 20);

            // Draw Start Text
            ctx.fillStyle = '#fff';
            ctx.font = '14px Inter';
            ctx.fillText('START', startPos.x - 20, startPos.y - 30);
        }

        function drawHeart(x, y, size) {
            ctx.save();
            ctx.translate(x, y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(0, -size / 2, -size, -size / 2, -size, 0);
            ctx.bezierCurveTo(-size, size / 2, 0, size, 0, size * 1.5);
            ctx.bezierCurveTo(0, size, size, size / 2, size, 0);
            ctx.bezierCurveTo(size, -size / 2, 0, -size / 2, 0, 0);
            ctx.fillStyle = '#ff4d4d';
            ctx.fill();
            ctx.restore();
        }

        drawPath();

        // Game State
        let isMoving = false;
        const msg = document.getElementById('maze-message');

        // Star-Dust Particles
        const particles = [];
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 3 + 1;
                this.alpha = 1;
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = (Math.random() - 0.5) * 1;
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= 0.02;
            }
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Trail particles
            for (let i = 0; i < 2; i++) {
                particles.push(new Particle(x, y));
            }

            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const isAlpha = pixel[3] > 0;

            if (isAlpha) {
                const distToHeart = Math.hypot(x - endPos.x, y - endPos.y);
                if (distToHeart < 25) {
                    transitionToAct3();
                }
            } else {
                msg.style.opacity = '1';
                gsap.fromTo(container, { x: -5 }, { x: 5, duration: 0.1, repeat: 5, yoyo: true });
                setTimeout(() => msg.style.opacity = '0', 1000);
            }
        });

        function animateParticles() {
            // We need to keep the background path visible, so we clear and redraw path + particles
            drawPath();
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // Transition to final chapter
    function transitionToAct3() {
        gsap.to('#chapter-1, #chapter-2', { opacity: 0, duration: 2, display: 'none' });
        document.getElementById('chapter-3').classList.add('active-bg');
        document.body.style.backgroundColor = '#1D2B53';

        startProposal();
    }

    function startProposal() {
        // Audio will play when the proposal appears, not during affirmations

        // Affirmation phrases — cycle these before the proposal
        const phrases = [
            "I love you ✨",
            "I like you so much 💗",
            "You are so great 🌙",
            "You are so awesome 💫",
            "You make me smile every day 🌸",
            "You are my favorite person 💝",
            "I am so in love with you 🌷",
            "You are adorable 🥺",
            "You are my everything 💕",
            "Tum bahut achchi ho 🤍",
            "Main tumse pyaar karta hu 🌟",
        ];

        const introEl = document.getElementById('final-intro');
        introEl.style.fontFamily = "'Cormorant Garamond', serif";
        introEl.style.fontSize = "clamp(2rem, 5vw, 3.5rem)";
        introEl.style.opacity = "1";

        let idx = 0;

        function showPhrase() {
            if (idx >= phrases.length) {
                // Done — fade out and show the pre-proposal
                gsap.to(introEl, {
                    opacity: 0, y: -20, duration: 0.8, onComplete: () => {
                        introEl.style.display = 'none';
                        const preProposal = document.getElementById('pre-proposal');
                        preProposal.classList.remove('hidden');
                        gsap.fromTo(preProposal, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 });
                    }
                });
                return;
            }

            introEl.textContent = phrases[idx];
            gsap.fromTo(introEl,
                { opacity: 0, y: 15, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out",
                    onComplete: () => {
                        setTimeout(() => {
                            gsap.to(introEl, {
                                opacity: 0, y: -15, duration: 0.4, ease: "power2.in",
                                onComplete: () => {
                                    idx++;
                                    showPhrase();
                                }
                            });
                        }, 900);
                    }
                }
            );
        }

        showPhrase();
    }

    // Pre-Proposal Interaction
    const preYes = document.getElementById('pre-yes');
    const preNo = document.getElementById('pre-no');
    const preNoMsg = document.getElementById('pre-no-msg');
    const preProposal = document.getElementById('pre-proposal');
    const proposalStage = document.getElementById('proposal-stage');

    preYes.addEventListener('click', () => {
        gsap.to(preProposal, {
            opacity: 0, duration: 0.5, onComplete: () => {
                preProposal.classList.add('hidden');
                showMainProposal();
            }
        });
    });

    preNo.addEventListener('click', () => {
        preNoMsg.classList.remove('hidden');
        gsap.fromTo(preNoMsg, { opacity: 0 }, { opacity: 1, duration: 0.5 });

        setTimeout(() => {
            gsap.to(preProposal, {
                opacity: 0, duration: 0.5, onComplete: () => {
                    preProposal.classList.add('hidden');
                    showMainProposal();
                }
            });
        }, 2000);
    });

    function showMainProposal() {
        proposalStage.classList.remove('hidden');
        gsap.fromTo(proposalStage, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5 });
        gsap.to('#proposal-shayri', { opacity: 1, duration: 3, delay: 1 });
        initVisualizer();

        // Start the YouTube song with fade-in
        playProposalSong();
    }

    // Act 3: Visualizer
    function initVisualizer() {
        const container = document.querySelector('.visualizer-container');
        for (let i = 0; i < 30; i++) {
            const bar = document.createElement('div');
            bar.className = 'v-bar';
            container.appendChild(bar);
        }
        const bars = document.querySelectorAll('.v-bar');

        function animate() {
            bars.forEach(bar => {
                const h = Math.random() * 80 + 10;
                bar.style.height = `${h}px`;
            });
            requestAnimationFrame(animate);
        }
        animate();
    }

    // Instant Email Notification Logic using FormSubmit.co
    // The first time this is triggered, you will receive an "Activation" email to confirm.
    const TARGET_EMAIL = "aaryanjaiswal2095@gmail.com";

    function notifyUser(answer) {
        console.log(`Sending notification for answer: ${answer}`);
        
        fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: "Proposal Update! 💌",
                answer: answer,
                message: `You got an answer: ${answer}`,
                _template: "table"
            })
        })
        .then(response => response.json())
        .then(data => console.log("Notification success:", data))
        .catch(error => console.error("Notification error:", error));
    }

    // "No" Button Interaction (No longer evasive)
    const btnNo = document.getElementById('btn-no');
    const rejectScreen = document.getElementById('reject-screen');

    btnNo.addEventListener('click', () => {
        notifyUser("NO (Rejected)");
        gsap.to('.proposal-container', {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                document.querySelector('.proposal-container').style.display = 'none';
                rejectScreen.classList.remove('hidden');
                rejectScreen.style.setProperty('display', 'flex', 'important');
                gsap.fromTo(rejectScreen, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1 });
            }
        });
    });

    // "Say it again" Logic
    const btnSayAgain = document.getElementById('btn-say-again');
    const proposalText = document.getElementById('proposal-text');
    btnSayAgain.addEventListener('click', () => {
        notifyUser("Yes, but say it again (Enthusiastic)");
        proposalText.classList.add('glow-boost');
        gsap.fromTo(proposalText, { x: -5 }, { x: 5, duration: 0.05, repeat: 10, yoyo: true });
        btnSayAgain.textContent = "Yes, I'm definitely sure now!";
        setTimeout(() => {
            proposalText.classList.remove('glow-boost');
        }, 2000);
    });

    // Final "Yes"
    const btnYes = document.getElementById('btn-yes');
    const successScreen = document.getElementById('success-screen');

    btnYes.addEventListener('click', () => {
        try {
            notifyUser("YES (Accepted)");
        } catch (e) {
            console.error("Notification failed:", e);
        }
        
        // Ensure success screen has its background ready
        successScreen.classList.add('sunset-bg');

        // Confetti — standard API compatible with this CDN build
        confetti({
            particleCount: 180,
            spread: 120,
            origin: { y: 0.55 },
            colors: ['#ffffff', '#FFC0CB', '#FF69B4', '#FFD700', '#ff8fab']
        });
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.3 },
                colors: ['#ffffff', '#FFC0CB', '#ff8fab']
            });
        }, 400);

        // Hide proposal, show success screen
        gsap.to('.proposal-container', {
            opacity: 0,
            duration: 0.8,
            onComplete: () => {
                const container = document.querySelector('.proposal-container');
                if (container) container.style.display = 'none';
                
                successScreen.classList.remove('hidden');
                successScreen.style.display = 'flex';
                gsap.fromTo(successScreen, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1 });
            }
        });
    });
});
