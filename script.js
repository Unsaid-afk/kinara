// Music player — requires one user tap (browser autoplay policy)
// Music player — using local audio or direct MP3 links to bypass Tracking Prevention
function startSong(btn) {
    const audio = document.getElementById('bg-audio');
    const nowPlaying = document.getElementById('now-playing');
    
    console.log("Attempting to start music...");
    if (!audio) {
        console.error("Audio element #bg-audio not found!");
        return;
    }

    audio.volume = 0.8;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            if (btn) btn.style.display = 'none';
            if (nowPlaying) nowPlaying.classList.remove('hidden');
            console.log("✅ Music started successfully!");
        }).catch(error => {
            console.error("❌ Audio playback failed:", error);
            console.log("Trying fallback source...");
            audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
            audio.load();
            audio.play().then(() => {
                if (btn) btn.style.display = 'none';
                if (nowPlaying) nowPlaying.classList.remove('hidden');
                console.log("✅ Fallback music started!");
            }).catch(e => {
                console.error("❌ Fallback also failed. Browser might be blocking local media access.", e);
                alert("Please ensure 'meribanogikya.mp3' is in the folder and that you are using a browser that allows local audio playback!");
            });
        });
    }
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

    // BACKUP: If the music button fails, try playing on any user click in Chapter 3
    document.getElementById('chapter-3').addEventListener('click', () => {
        const audio = document.getElementById('bg-audio');
        if (audio && audio.paused) {
            audio.play().catch(e => console.log("Automatic play backup failed:", e));
        }
    }, { once: true });

    // RAHAT Feature Logic
    const rahatData = [
        { 
            date: "5/6/2026", 
            riddle: "as its day 1 as u r not in that great mind to really put sooo much brain into it id keep it thoda sa simple u just answer this question bhot simple hai hume ek dusre ke liye itna khas bane kitne din hue hai (hint its from narmada parikrama) enter just the date just the date and month number .", 
            answer: "804", 
            letter: `hie pippo 
you had a long tough tiring day actually u even cried allot I hate it but its not your fault 
I lied m not working on manav wala project woh kal karunga itna kuch sochkar rakha tha tujhe bolne ke liye kitna kuch kehna tha but vc par hi bol diya its like i started and couldn't stop i feel allot rn tbh i didn't even code Pehle Pehle i just made an implementation txt file when i told uh ki main yeh karne wala hu but if i told ki main ab start karunga toh ud maybe stop me and tumhe mana kaha hi kar pata hu main abhi bhi m writing it while i am on a vc with uh . meri jaan agar koi spelling mistake ho jae toh let it go .
uk i really feel uh when u r sad when your dad did scold uh but this time it was the first time i had no solution to it i had no answer to it u just asked why your freedom is something they own and i had no answer to it but i wanted to be with uh i didn't really stay but trust me jaan i tried my best i hate trying my best and failing ud say i didn't fail but i wasn't there when u needed i disappear when uh want me the most and thats a failure fr m not going tooo hard on myself m totally fine uk i hate the concept when your partner says i cant do anything in this or that like dude u r in love tum chaho toh kuch bhi kar sakte ho love surely gives pain and many problems but it gives some awesome superpower and u r that superpower of mine. abhi main tujhe hi dekh rha hu u r into your phone but i notice your eyes your hair your cheeks your lips your fingers even your eyebrows they r sooo pretty uh r soooo pretty this black colour never felt sooo colourful when u have it on yourself its like being the most colourful colour m unable to explain it but but u know it jaaan u feel it u surely can u have no idea m writing this also u have no idea how much love m feeling rn (yeh padhne ke baad u will look at me with my lovely smile ha ha smile is yours only but u r mine na ) dekha u did see it Pehle u weren't about to but just cuz i told so ab tu dekhegi 
the whole concept of this website is to express myself to uh but in a more creative way so that uh feel more special 
tumne abhi abhi pucha ki kya hua while i was smiling looking at uh i did just wave my head and say kuch nhi but jaana asal me tumse aur pyaar ho raha hai bhot saara ho raha hai beinteha ho raha hai 
tbh id just say all your sorrows r mine too u rnt alone in anything even if u wanna leave everything and just be alone u wont be alone (sounds creepy but its just and just care and love )ud never be alone id always be there id always stay no matter even if u dont want me to . when u sent me your poem abhi it felt better and now ik its working u nd me are working m working for uh m the right one for uh . i still feel there are parts of yours jaha tak main ab tak nhi phoch paya and if anything like that is there ik only i can reach if those parts exist which are even away from me i feel m really close to them i soo confident that m the only one who can really really feel uh and m blessed to be that. 
abhi tu website ke baare me bata rhi hai but trust me u look so pretty sachi tumhara har dukh har dard har aasu jitna tumhara hai utna mera bhi hai and trust me main yeh maan chuka hu so i wont really be ever able to leave uh alone in anything or anytime u say me to go away and just leave uh alone m sorry but m not sorry and id be always there jaldi or late but id be there just be happy jaaan sab theek ho jaega hum sab kar lenge pakka meri jaaan.
i love uh the mosssssssssssssssssssssssstttttttttttttttt and forever my loveeeeee
i always am all yours` 
        },
        { date: "Day 2 (Placeholder)", riddle: "I’m tall when I’m young, and I’m short when I’m old. What am I?", answer: "candle", letter: "This is the second letter. Replace it later." },
        { date: "Day 3 (Placeholder)", riddle: "What month of the year has 28 days?", answer: "all of them", letter: "This is the third letter. Replace it later." },
        { date: "Day 4 (Placeholder)", riddle: "What is full of holes but still holds water?", answer: "sponge", letter: "This is the fourth letter. Replace it later." },
        { date: "Day 5 (Placeholder)", riddle: "What question can you never answer yes to?", answer: "are you asleep", letter: "This is the fifth and final letter. Replace it later." }
    ];

    const rahatBtnContainer = document.getElementById('rahat-btn-container');
    const rahatBtn = document.getElementById('rahat-btn');
    const rahatModal = document.getElementById('rahat-modal');
    const closeRahat = document.getElementById('close-rahat');
    const datesScreen = document.getElementById('dates-screen');
    const datesGrid = document.getElementById('dates-grid');
    
    const riddleScreen = document.getElementById('riddle-screen');
    const riddleDate = document.getElementById('riddle-date');
    const riddleText = document.getElementById('riddle-text');
    const riddleAnswer = document.getElementById('riddle-answer');
    const riddleSubmit = document.getElementById('riddle-submit');
    const riddleError = document.getElementById('riddle-error');
    const backToDates = document.getElementById('back-to-dates');

    const letterScreen = document.getElementById('letter-screen');
    const closeLetter = document.getElementById('close-letter');
    const letterTextContainer = document.getElementById('letter-text-container');

    let currentDayIndex = -1;

    if (rahatBtnContainer) {
        // Show RAHAT button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                rahatBtnContainer.style.opacity = '1';
                rahatBtnContainer.style.pointerEvents = 'auto';
            } else {
                rahatBtnContainer.style.opacity = '0';
                rahatBtnContainer.style.pointerEvents = 'none';
            }
        });

        // Generate Date Buttons
        rahatData.forEach((data, index) => {
            const btn = document.createElement('button');
            btn.className = "glass px-6 py-8 text-xl font-serif text-pink-200 hover:text-white transition-all transform hover:scale-105 flex-1 min-w-[150px]";
            btn.innerHTML = `<span class="block text-3xl mb-2">💌</span>${data.date}`;
            btn.addEventListener('click', () => {
                currentDayIndex = index;
                openRiddle(index);
            });
            datesGrid.appendChild(btn);
        });

        rahatBtn.addEventListener('click', () => {
            rahatModal.classList.remove('hidden');
            gsap.fromTo(rahatModal, { opacity: 0 }, { opacity: 1, duration: 0.5 });
            showDatesScreen();
        });

        closeRahat.addEventListener('click', () => {
            gsap.to(rahatModal, { opacity: 0, duration: 0.5, onComplete: () => rahatModal.classList.add('hidden') });
        });

        backToDates.addEventListener('click', () => {
            showDatesScreen();
        });

        closeLetter.addEventListener('click', () => {
            showDatesScreen();
        });

        function showDatesScreen() {
            riddleScreen.classList.add('hidden');
            letterScreen.classList.add('hidden');
            datesScreen.classList.remove('hidden');
            gsap.fromTo(datesScreen, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.5 });
        }

        function openRiddle(index) {
            const data = rahatData[index];
            datesScreen.classList.add('hidden');
            riddleScreen.classList.remove('hidden');
            
            riddleDate.textContent = data.date;
            riddleText.textContent = `"${data.riddle}"`;
            riddleAnswer.value = "";
            riddleError.style.opacity = '0';
            
            gsap.fromTo(riddleScreen, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
        }

        riddleSubmit.addEventListener('click', () => {
            checkPassword();
        });

        riddleAnswer.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });

        function checkPassword() {
            if (currentDayIndex === -1) return;
            const data = rahatData[currentDayIndex];
            const userAns = riddleAnswer.value.trim().toLowerCase();
            
            if (userAns === data.answer.toLowerCase()) {
                openLetter(data.letter);
            } else {
                riddleError.style.opacity = '1';
                gsap.fromTo(riddleAnswer, { x: -5 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true });
            }
        }

        function openLetter(text) {
            riddleScreen.classList.add('hidden');
            letterScreen.classList.remove('hidden');
            letterTextContainer.innerHTML = "";
            
            gsap.fromTo(letterScreen, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, onComplete: () => {
                // Typing effect
                typeEffect(letterTextContainer, text, 40);
            }});
        }
    }
});
