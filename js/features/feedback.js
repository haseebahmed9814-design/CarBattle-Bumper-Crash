const FeedbackManager = {
    selectedStars: 0,

    init() {
        const ACCESS_KEY = (typeof GAME_SECRETS !== 'undefined' && GAME_SECRETS.web3formsKey)
            ? GAME_SECRETS.web3formsKey
            : '6d3b06c1-833f-4cae-9ce5-9802383f23c0';

        const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

        const modal = document.getElementById('modal-feedback');
        const form = document.getElementById('feedback-form');
        const statusMsg = document.getElementById('fb-status-msg');
        const submitBtn = document.getElementById('btn-submit-feedback');
        const ratingInput = document.getElementById('fb-rating');
        const ratingText = document.getElementById('fb-star-status');
        const starBtns = document.querySelectorAll('#fb-star-widget .fb-star-btn');
        if (!modal || !form) return;

        const updateStarUI = (stars) => {
            this.selectedStars = stars;
            starBtns.forEach(btn => {
                const val = parseInt(btn.dataset.star, 10);
                btn.classList.toggle('active', val <= stars);
            });
            if (stars > 0) {
                ratingInput.value = `${stars} ${stars === 1 ? 'Star' : 'Stars'} (${stars}/5)`;
                if (ratingText) ratingText.textContent = `${stars}/5 Stars Selected (Click same star to clear)`;
            } else {
                ratingInput.value = 'No star given';
                if (ratingText) ratingText.textContent = 'No star given (Optional)';
            }
        };

        starBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                SoundEngine.playUIClick();
                const clickedVal = parseInt(btn.dataset.star, 10);
                // Clicking the already-selected star clears it back to 0 ("No star given")
                if (this.selectedStars === clickedVal) updateStarUI(0);
                else updateStarUI(clickedVal);
            });
        });

        const openModal = () => {
            SoundEngine.playUIClick();
            statusMsg.classList.add('hidden');
            document.getElementById('fb-telemetry').value = TelemetryTracker.getSummaryString();
            modal.classList.remove('hidden');
        };

        document.getElementById('btn-open-feedback').addEventListener('click', openModal);
        document.getElementById('btn-result-feedback').addEventListener('click', openModal);
        document.getElementById('btn-close-feedback').addEventListener('click', () => {
            SoundEngine.playUIClick();
            modal.classList.add('hidden');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'SENDING TO DEVELOPER GMAIL...';
            statusMsg.classList.add('hidden');

            try {
                const formData = new FormData(form);
                formData.append('access_key', ACCESS_KEY);
                formData.append('subject', 'Bumper Crash v3.1.0 — New Player Feedback 🏎️');
                formData.append('from_name', 'Bumper Crash Game');

                const res = await fetch(WEB3FORMS_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                const data = await res.json();

                if (data.success) {
                    form.reset();
                    updateStarUI(0);
                    statusMsg.textContent = '✅ Thank you! Your feedback was sent directly to the developer Gmail.';
                    statusMsg.className = 'fb-status-msg success';
                } else {
                    statusMsg.textContent = 'Could not submit right now. Please check your internet connection.';
                    statusMsg.className = 'fb-status-msg error';
                }
            } catch (err) {
                statusMsg.textContent = 'Network error while sending feedback. Please check your connection.';
                statusMsg.className = 'fb-status-msg error';
            } finally {
                statusMsg.classList.remove('hidden');
                submitBtn.disabled = false;
                submitBtn.textContent = 'SEND FEEDBACK TO DEVELOPER →';
            }
        });
    }
};