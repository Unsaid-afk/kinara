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

// ===== CLOUD SCENERY AUDIO — Real Songs =====
let currentCloudAudio = null;

const cloudSongs = [
    "Aaj Se Teri - Lyrical  Padman  Akshay Kumar & Radhika Apte  Arijit Singh  Amit Trivedi - Zee Music Company.mp3",
    "Mere Nishan - Mohammed.mp3",
    "Shirt Da Button Full Song  Kya Super Kool Hain Hum  Neha Sharma, Tusshar Kapoor, Riteish Deshmukh - T-Series.mp3",
    "ZERO Mere Naam Tu Full Song  Shah Rukh Khan, Anushka Sharma, Katrina Kaif  Ajay-Atul T-Series - T-Series.mp3",
    "Arijit Singh - Tera Hoke Rahoon  Rajkummar Rao & Shruti Haasan  Behen Hogi Teri  Lyrical - Soulful Arijit Singh Songs.mp3",
    "Jai Waetford - Shy - jaiwaetfordauVEVO.mp3"
];

function playCloudTrack(index) {
    stopCloudTrack();

    // Pause the main background song if it is playing
    const bgAudio = document.getElementById('bg-audio');
    if (bgAudio && !bgAudio.paused) {
        bgAudio.pause();
        bgAudio.dataset.wasPlaying = 'true';
    }

    const songFile = cloudSongs[index % cloudSongs.length];
    currentCloudAudio = new Audio(songFile);
    currentCloudAudio.volume = 0.8;
    currentCloudAudio.play().catch(e => console.log("Audio play prevented:", e));
}

function stopCloudTrack() {
    if (currentCloudAudio) {
        currentCloudAudio.pause();
        currentCloudAudio.currentTime = 0;
        currentCloudAudio = null;
        
        // Resume background audio if it was playing before
        const bgAudio = document.getElementById('bg-audio');
        if (bgAudio && bgAudio.dataset.wasPlaying === 'true') {
            bgAudio.play().catch(e => console.log("Bg audio play prevented:", e));
            bgAudio.dataset.wasPlaying = 'false';
        }
    }
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
        { date: "6/6/2026", riddle: "what do you call the feeling you give me? (hint: its what this button is named 💕)", answer: "rahat", type: "cloud-scenery" },
        { date: "Unread Letter 💌", type: "arcade-game" },
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
            if (data.type === 'arcade-game') {
                btn.classList.add('animate-pulse', 'border', 'border-red-500/50', 'shadow-[0_0_15px_rgba(255,0,0,0.5)]');
            }
            btn.addEventListener('click', () => {
                currentDayIndex = index;
                if (data.type === 'arcade-game') {
                    openArcadeGame();
                } else {
                    openRiddle(index);
                }
            });
            datesGrid.appendChild(btn);
        });

        rahatBtn.addEventListener('click', () => {
            const badge = document.getElementById('unread-badge');
            if (badge) badge.style.display = 'none'; // Hide badge on first open
            rahatModal.classList.remove('hidden');
            gsap.fromTo(rahatModal, { opacity: 0 }, { opacity: 1, duration: 0.5 });
            showDatesScreen();
        });

        closeRahat.addEventListener('click', () => {
            stopCloudTrack();
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
            const arcadeScreen = document.getElementById('arcade-game-screen');
            if (arcadeScreen) arcadeScreen.classList.add('hidden');
            const csScreen = document.getElementById('cloud-scenery-screen');
            if (csScreen) { csScreen.classList.add('hidden'); stopCloudTrack(); }
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
                if (data.type === 'cloud-scenery') {
                    openCloudScenery();
                } else {
                    openLetter(data.letter);
                }
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

        // ===== 4-MONTH QUEST ARCADE GAME =====
        const questStoryData = [
            {
                chapter: "START",
                title: "PRESS START",
                text: "System initialized...\nLoading memories...\nAre you ready to relive the 4-month journey?",
                effect: "default",
                bgImage: "assets/bg_campus.jpg",
                anim: "none",
                choices: [
                    { text: "[ INITIALIZE QUEST ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 1",
                title: "THE ORIGIN",
                text: "Setting: College campus. You are a 3rd-year senior; she is a 1st-year student who just texted you with a random question.\n\nSparks fly through casual text messages ✨. Peers and classmates immediately start shipping you two, but you both brush it off as campus gossip.",
                effect: "default",
                bgImage: "assets/bg_campus.jpg",
                anim: "slideIn",
                choices: [
                    { text: "[ \"Who gave you my number?\" ]", isCorrect: false, response: "Ouch. Too cold! She leaves you on read. Try again. 🥶" },
                    { text: "[ REPLY CASUALLY & SPARKS FLY ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 2",
                title: "9 MONTHS OF FRIENDSHIP",
                text: "Setting: Campus life.\n\nDespite the gossip, you both became incredibly close friends. You spent countless hours talking, laughing, and constantly joking about how you managed to survive 9 whole months of friendship together without driving each other completely crazy.",
                effect: "default",
                bgImage: "assets/bg_campus.jpg",
                anim: "slideIn",
                choices: [
                    { text: "[ RUIN THE FRIENDSHIP IMMEDIATELY ]", isCorrect: false, response: "Too soon! You have to build the foundation first. Try again. 🧱" },
                    { text: "[ JOKE & BECOME BEST FRIENDS ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 3",
                title: "THE 22KM NIGHT TREK",
                text: "Setting: A grueling 22-kilometer night trek. An extra spot opened up, and she agreed to join the group 🥾.\n\nYou make sure she doesn't feel lonely by sticking close. On the bus ride there, the friend group breaks into a hype dance in the aisle 🚌. You step away briefly for the dancing, but your focus is entirely on her.",
                effect: "night",
                bgImage: "assets/bg_trek.jpg",
                anim: "walk",
                choices: [
                    { text: "[ IGNORE HER & DANCE CRAZY ]", isCorrect: false, response: "She gets bored and falls asleep. You missed your chance! 😂" },
                    { text: "[ WALK BY HER SIDE ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 4",
                title: "THE WATER BOTTLE CONFESSION",
                text: "Setting: Deep into the 22km night trek under the stars 🌙.\n\nShe hands you her water bottle to carry. You play it cool, look at her with a mischievous smile, and drop the line:\n\n\"It's my responsibility to take care of the bottle, I can't let it get harmed.\"\n\nRight as she processes it, you look straight into her eyes and say: \"I'm not talking about the bottle.\" Her jaw drops in shock.",
                effect: "night",
                bgImage: "assets/bg_trek.jpg",
                anim: "shock",
                choices: [
                    { text: "[ DROP THE BOTTLE ]", isCorrect: false, response: "Clumsy! She laughs, but the moment is ruined. Pick it up! 🍼" },
                    { text: "[ DROP THE CONFESSION ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 5",
                title: "THE SHOULDER LEAN",
                text: "Setting: The exhausting bus ride home after completing the 22km trek.\n\nExhaustion takes over. You gather all your courage and gently guide her head onto your shoulder. She is too tired to protest and falls asleep instantly. Being a tall guy, you freeze completely so as not to wake her up, gently patting her head and brushing stray hair away from her face.",
                effect: "bus",
                bgImage: "assets/bg_bus.jpg",
                anim: "lean",
                choices: [
                    { text: "[ WAKE HER UP FOR SNACKS ]", isCorrect: false, response: "How could you wake the sleeping princess?! Try again. 😠" },
                    { text: "[ FREEZE & PROTECT HER SLEEP ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 6",
                title: "LATE-NIGHT VCs & DANCING CLOSER",
                text: "Setting: Post-trek reality.\n\nYou text her everything you're feeling. She respects your honesty and wants to get to know you deeper. Soon, you are spending entire days and nights talking on video calls (VC). You even pair up for a college dance, growing inseparable through every rehearsal.",
                effect: "default",
                bgImage: "assets/bg_vc.jpg",
                anim: "dance",
                choices: [
                    { text: "[ GHOST HER ]", isCorrect: false, response: "Really? After all that? Absolute zero game. Try again. 💀" },
                    { text: "[ HOLD HER CLOSE ON THE DANCE FLOOR ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 7",
                title: "THE MISUNDERSTANDING",
                text: "Setting: A gloomy evening 🌧️.\n\nRight before everything fell into place, accidental problems and misunderstandings occurred between you two. But true love always finds a way, and despite the arguments, neither of you were willing to give up on what you had built.",
                effect: "default",
                bgImage: "assets/bg_rain.jpg",
                anim: "rain_anim",
                choices: [
                    { text: "[ GIVE UP AND WALK AWAY ]", isCorrect: false, response: "True love doesn't quit when things get tough. Try again. 💔" },
                    { text: "[ HOLD ON TIGHTER ]", isCorrect: true }
                ]
            },
            {
                chapter: "Chapter 8",
                title: "THE KINARA PROPOSAL",
                text: "Setting: Her house.\n\nYou show up at her house with tears in your eyes, using a custom website you built called Kinara to propose to her. Through the tears and overwhelming emotion, without a second thought, she says yes ❤️.\n\n(Date: 19th April 2026)",
                effect: "proposal",
                bgImage: "assets/bg_proposal.jpg",
                anim: "propose",
                choices: [
                    { text: "[ UNLOCK 4-MONTH ANNIVERSARY ]", isCorrect: true }
                ]
            }
        ];

        let questLevel = 0;
        let questTyping = false;
        let questInterval;

        function applyQuestEffect(effect) {
            const container = document.getElementById("game-container");
            container.className = "w-full border-4 border-[#00ffcc] rounded-xl p-6 bg-black shadow-[0_0_20px_#00ffcc,inset_0_0_20px_#00ffcc] relative z-20 quest-bg-default";
            
            if (effect === "night") container.classList.add("quest-bg-night");
            if (effect === "bus") container.classList.add("quest-bg-bus");
            if (effect === "proposal") container.classList.add("quest-bg-proposal");
        }

        function updateSceneView(data) {
            const sceneBg = document.getElementById("scene-bg");
            const charContainer = document.getElementById("scene-characters");
            
            // Set Background
            if (data.bgImage) {
                sceneBg.style.backgroundImage = `url('${data.bgImage}')`;
                sceneBg.style.opacity = '1';
                gsap.fromTo(sceneBg, { scale: 1.05 }, { scale: 1, duration: 2, ease: "power2.out" });
            } else {
                sceneBg.style.opacity = '0';
            }

            // Setup Characters if not START
            if (data.chapter === "START") {
                charContainer.innerHTML = '';
                return;
            }

            // If characters don't exist yet, create them
            if (!document.getElementById("char-boy")) {
                charContainer.innerHTML = `
                    <div id="char-boy" class="character-sprite char-boy" style="transform: translateX(-100px); opacity: 0;">
                        <div class="emotion-bubble" id="bubble-boy"></div>
                        👦🏻
                    </div>
                    <div id="char-girl" class="character-sprite char-girl" style="transform: translateX(100px); opacity: 0;">
                        <div class="emotion-bubble" id="bubble-girl"></div>
                        👧🏻
                    </div>
                `;
            }

            const boy = document.getElementById("char-boy");
            const girl = document.getElementById("char-girl");
            const bubbleBoy = document.getElementById("bubble-boy");
            const bubbleGirl = document.getElementById("bubble-girl");

            // Reset emotions
            bubbleBoy.classList.remove("active");
            bubbleGirl.classList.remove("active");
            gsap.killTweensOf([boy, girl]);

            // Animations based on scene
            switch (data.anim) {
                case "slideIn":
                    gsap.to(boy, { x: 40, opacity: 1, duration: 1, ease: "back.out(1.2)" });
                    gsap.to(girl, { x: -40, opacity: 1, duration: 1, ease: "back.out(1.2)" });
                    setTimeout(() => {
                        bubbleBoy.textContent = "💬";
                        bubbleBoy.classList.add("active");
                    }, 1500);
                    break;
                case "walk":
                    gsap.to(boy, { x: 50, y: -5, opacity: 1, yoyo: true, repeat: -1, duration: 0.5 });
                    gsap.to(girl, { x: -30, y: -5, opacity: 1, yoyo: true, repeat: -1, duration: 0.5, delay: 0.2 });
                    break;
                case "shock":
                    // Stop walking
                    gsap.to([boy, girl], { y: 0, duration: 0.1 });
                    gsap.to(boy, { x: 60, opacity: 1, duration: 0.5 });
                    gsap.to(girl, { x: -40, opacity: 1, duration: 0.5 });
                    
                    setTimeout(() => {
                        bubbleBoy.textContent = "😏";
                        bubbleBoy.classList.add("active");
                    }, 500);
                    
                    setTimeout(() => {
                        bubbleGirl.textContent = "❗";
                        bubbleGirl.classList.add("active");
                        gsap.fromTo(girl, { y: 0 }, { y: -20, yoyo: true, repeat: 1, duration: 0.2 }); // jump in shock
                    }, 2000);
                    break;
                case "lean":
                    gsap.to(boy, { x: 80, y: 0, rotation: 0, opacity: 1, duration: 0.5 });
                    gsap.to(girl, { x: -70, y: 0, opacity: 1, duration: 0.5, onComplete: () => {
                        // Girl leans on shoulder
                        gsap.to(girl, { rotation: -25, x: -60, duration: 1, ease: "power2.inOut" });
                        setTimeout(() => {
                            bubbleBoy.textContent = "❤️";
                            bubbleBoy.classList.add("active");
                            bubbleGirl.textContent = "💤";
                            bubbleGirl.classList.add("active");
                        }, 1000);
                    }});
                    break;
                case "dance":
                    gsap.to(boy, { rotation: 0, x: 50, opacity: 1, duration: 0.5 });
                    gsap.to(girl, { rotation: 0, x: -50, opacity: 1, duration: 0.5 });
                    gsap.to(boy, { y: -30, rotation: 10, yoyo: true, repeat: -1, duration: 0.4 });
                    gsap.to(girl, { y: -30, rotation: -10, yoyo: true, repeat: -1, duration: 0.4, delay: 0.2 });
                    break;
                case "rain_anim":
                    gsap.to(boy, { x: 30, y: 0, rotation: 0, opacity: 1, duration: 1 });
                    gsap.to(girl, { x: -30, y: 0, rotation: 0, opacity: 1, duration: 1 });
                    setTimeout(() => {
                        bubbleBoy.textContent = "🥺";
                        bubbleBoy.classList.add("active");
                        bubbleGirl.textContent = "🌧️";
                        bubbleGirl.classList.add("active");
                    }, 1000);
                    break;
                case "propose":
                    gsap.killTweensOf([boy, girl]);
                    gsap.to(boy, { x: 90, y: 0, rotation: 0, opacity: 1, duration: 1 });
                    gsap.to(girl, { x: -90, y: 0, rotation: 0, opacity: 1, duration: 1 });
                    setTimeout(() => {
                        bubbleBoy.textContent = "💍";
                        bubbleBoy.classList.add("active");
                    }, 1000);
                    setTimeout(() => {
                        bubbleGirl.textContent = "❤️";
                        bubbleGirl.classList.add("active");
                        gsap.fromTo(girl, { y: 0 }, { y: -30, yoyo: true, repeat: 3, duration: 0.3 }); // Jump for joy
                    }, 2500);
                    break;
            }
        }

        function typeQuestText(text, callback) {
            questTyping = true;
            const textEl = document.getElementById("story-text");
            const choicesEl = document.getElementById("choices-box");
            textEl.innerHTML = "";
            choicesEl.classList.remove("opacity-100", "pointer-events-auto");
            choicesEl.classList.add("opacity-0", "pointer-events-none");
            
            let i = 0;
            const chars = text.split('');
            
            clearInterval(questInterval);
            questInterval = setInterval(() => {
                if (i < chars.length) {
                    if (chars[i] === '\n') {
                        textEl.innerHTML += "<br>";
                    } else {
                        textEl.innerHTML += chars[i];
                    }
                    i++;
                } else {
                    clearInterval(questInterval);
                    questTyping = false;
                    if (callback) callback();
                }
            }, 30);
        }

        function handleChoiceClick(choice, data) {
            if (questTyping) {
                // Instantly finish typing
                clearInterval(questInterval);
                document.getElementById("story-text").innerHTML = data.text.replace(/\n/g, "<br>");
                questTyping = false;
                const choicesEl = document.getElementById("choices-box");
                choicesEl.classList.remove("opacity-0", "pointer-events-none");
                choicesEl.classList.add("opacity-100", "pointer-events-auto");
                return;
            }

            if (!choice.isCorrect) {
                // Wrong choice logic
                const container = document.getElementById("game-container");
                container.classList.remove("shake-error");
                void container.offsetWidth; // trigger reflow
                container.classList.add("shake-error");
                
                document.getElementById("story-text").innerHTML = `<span class="text-red-500">${choice.response}</span><br><br>${data.text.replace(/\n/g, "<br>")}`;
            } else {
                // Correct choice logic
                questLevel++;
                loadQuestLevel(questLevel);
            }
        }

        function renderChoices(data) {
            const choicesEl = document.getElementById("choices-box");
            choicesEl.innerHTML = ""; // Clear existing choices
            
            data.choices.forEach(choice => {
                const btn = document.createElement("button");
                btn.className = "arcade-btn bg-transparent text-[#00ffcc] border-2 border-[#00ffcc] py-4 px-5 text-xs uppercase w-[80%] text-center cursor-pointer hover:bg-[#00ffcc] hover:text-black hover:shadow-[0_0_15px_#00ffcc] transition-all";
                btn.textContent = choice.text;
                
                btn.addEventListener("click", () => handleChoiceClick(choice, data));
                choicesEl.appendChild(btn);
            });
        }

        function loadQuestLevel(levelIndex) {
            if (levelIndex >= questStoryData.length) {
                document.getElementById("celebration-screen").classList.remove("hidden");
                // Confetti explosion
                if(typeof confetti !== 'undefined') {
                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors: ['#ff00ff', '#00ffcc', '#ffffff'] });
                }
                return;
            }
            
            const data = questStoryData[levelIndex];
            document.getElementById("chapter-title").textContent = data.title;
            
            applyQuestEffect(data.effect);
            updateSceneView(data);
            renderChoices(data);
            
            // GSAP fade in text box
            gsap.fromTo("#text-box", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });

            typeQuestText(data.text, () => {
                const choicesEl = document.getElementById("choices-box");
                choicesEl.classList.remove("opacity-0", "pointer-events-none");
                choicesEl.classList.add("opacity-100", "pointer-events-auto");
            });
        }

        function openArcadeGame() {
            datesScreen.classList.add('hidden');
            const arcadeScreen = document.getElementById('arcade-game-screen');
            arcadeScreen.classList.remove('hidden');
            gsap.fromTo(arcadeScreen, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.2)" });
            
            questLevel = 0;
            document.getElementById("celebration-screen").classList.add("hidden");
            loadQuestLevel(questLevel);
        }

        const closeArcadeBtn = document.getElementById("close-arcade-game");
        if(closeArcadeBtn) {
            closeArcadeBtn.addEventListener("click", () => {
                showDatesScreen();
            });
        }

        const replayBtn = document.getElementById("replay-btn");
        if (replayBtn) {
            replayBtn.addEventListener("click", () => {
                document.getElementById("celebration-screen").classList.add("hidden");
                questLevel = 0;
                loadQuestLevel(questLevel);
            });
        }
        // =====================================

        // ===== CLOUD SCENERY FEATURE =====
        const cloudMessages = [
            "everytime I talk to uh in nights or evening jab hum vc par baat kr rhe ho ya m under the blanket while talking to uh this song plays on loops in my head",
            "uk na m in love with giving uh hickeys hehe u already know this track always reminds me of giving uh more hickeys and your expressions while I give em to uh your expressions when uh see all of em together also the stuggle to hide them your craving to get em more your excitement to see em and the sadness of em healing I just love everything about it and uh and I hope abse this track reminds uh all of it too",
            "uk this one just tells if I had a power to be anything for uh basically shape shifting id be all of these for uh and just express my love being all of em",
            "yeh gana we both love it and itne hi time tak I wanna be with uh and jitna yeh gana bata raha haina use kahi jyada main tumhara hoke rehna chahta hu",
            "hehe I told na I wanna be all yours isiliye ek gana dedicated to how badly I wanna be yours and how I wanna stay yours",
            "no matter wht I could never stop crushing on uh and its the feeling which never left me and it wont leave me no matter how close we get how comfortable we get I always have this feeling of crushing on uh id surely love uh deeper more but wont stop loving the way I did in starting ud always be that special to me sweetie I really really love uh the mosttttt pippooooooo I love uh forever my babyyy my jaaan my nubbu my sweetie my honey my wifey my everything"
        ];

        function openCloudScenery() {
            riddleScreen.classList.add('hidden');
            datesScreen.classList.add('hidden');

            const cloudScreen = document.getElementById('cloud-scenery-screen');
            cloudScreen.classList.remove('hidden');
            gsap.fromTo(cloudScreen, { opacity: 0 }, { opacity: 1, duration: 1.2 });

            // Generate stars once
            const starsContainer = document.getElementById('cloud-stars-container');
            if (starsContainer && starsContainer.children.length === 0) {
                generateStars(starsContainer, 90);
            }

            // Initialize cloud interactions once
            if (!cloudScreen.dataset.initialized) {
                cloudScreen.dataset.initialized = 'true';
                initCloudInteractions();
                startShootingStars(cloudScreen);
            }
        }

        function generateStars(container, count) {
            for (let i = 0; i < count; i++) {
                const star = document.createElement('div');
                star.className = 'sky-star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 75 + '%';
                star.style.setProperty('--twinkle-duration', (Math.random() * 3 + 2) + 's');
                star.style.animationDelay = Math.random() * 5 + 's';
                const size = Math.random() * 2.5 + 0.5;
                star.style.width = size + 'px';
                star.style.height = size + 'px';
                container.appendChild(star);
            }
        }

        function startShootingStars(container) {
            function spawnStar() {
                const star = document.createElement('div');
                star.className = 'shooting-star';
                star.style.top = Math.random() * 40 + '%';
                star.style.left = (Math.random() * 50 + 40) + '%';
                container.appendChild(star);
                setTimeout(() => star.remove(), 1600);
            }
            setInterval(() => {
                if (!container.classList.contains('hidden')) {
                    spawnStar();
                }
            }, 4000 + Math.random() * 6000);
        }

        function initCloudInteractions() {
            const clouds = document.querySelectorAll('.floating-cloud');
            const overlay = document.getElementById('cloud-msg-overlay');
            const msgText = document.getElementById('cloud-msg-text');
            const closeMsg = document.getElementById('close-cloud-msg');
            const closeScenery = document.getElementById('close-cloud-scenery');

            clouds.forEach(cloud => {
                cloud.addEventListener('click', () => {
                    const idx = parseInt(cloud.dataset.cloudIdx);
                    msgText.textContent = cloudMessages[idx];
                    overlay.classList.add('active');
                    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5 });
                    gsap.fromTo('#cloud-msg-box', { scale: 0.8, y: 20 }, { scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.7)' });
                    playCloudTrack(idx);
                });
            });

            function closeCloudMessage() {
                stopCloudTrack();
                gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: () => {
                    overlay.classList.remove('active');
                }});
            }

            closeMsg.addEventListener('click', closeCloudMessage);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeCloudMessage();
            });

            closeScenery.addEventListener('click', () => {
                stopCloudTrack();
                const cloudScreen = document.getElementById('cloud-scenery-screen');
                gsap.to(cloudScreen, { opacity: 0, duration: 0.5, onComplete: () => {
                    cloudScreen.classList.add('hidden');
                    showDatesScreen();
                }});
            });
        }
    }
});
