const FeedbackManager = {
    // Endpoint is loaded from js/core/secrets.js (gitignored).
    // If secrets.js is missing (e.g. fresh clone), the form
    // gracefully shows a "not configured" message instead of crashing.
    endpoint: (typeof GAME_SECRETS !== 'undefined' && GAME_SECRETS.formspreeEndpoint)
        ? GAME_SECRETS.formspreeEndpoint
        : null,

    init() {
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
                if (!this.endpoint) {
                    statusMsg.textContent = 'Feedback form not configured. See js/core/secrets.example.js to set up.';
                    statusMsg.className = 'fb-status-msg error';
                    statusMsg.classList.remove('hidden');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'SEND FEEDBACK TO DEVELOPER →';
                    return;
                }
                const res = await fetch(this.endpoint, {
                    method: 'POST',
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    form.reset();
                    statusMsg.textContent = 'Thank you! Your feedback was sent directly to the developer Gmail.';
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
