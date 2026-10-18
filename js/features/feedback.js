const FeedbackManager = {
    init() {
        // Web3Forms access key — loaded from gitignored secrets.js if available,
        // otherwise falls back to the hardcoded key so GitHub Pages deployment works.
        // Web3Forms is designed for frontend use — key is tied to your email only.
        const ACCESS_KEY = (typeof GAME_SECRETS !== 'undefined' && GAME_SECRETS.web3formsKey)
            ? GAME_SECRETS.web3formsKey
            : '6d3b06c1-833f-4cae-9ce5-9802383f23c0';

        const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

        const modal = document.getElementById('modal-feedback');
        const form = document.getElementById('feedback-form');
        const statusMsg = document.getElementById('fb-status-msg');
        const submitBtn = document.getElementById('btn-submit-feedback');
        if (!modal || !form) return;

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
                // Build form data and inject Web3Forms access key
                const formData = new FormData(form);
                formData.append('access_key', ACCESS_KEY);
                formData.append('subject', 'Bumper Crash — New Player Feedback 🏎️');
                formData.append('from_name', 'Bumper Crash Game');

                const res = await fetch(WEB3FORMS_URL, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                const data = await res.json();

                if (data.success) {
                    form.reset();
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
