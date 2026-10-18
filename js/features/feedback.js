const FeedbackManager = {
    init() {
        // Formspree endpoint — secured via Formspree Dashboard domain restriction.
        // Go to formspree.io → Your Form → Settings → Allowed Domains
        // and add only your domain. This stops anyone else from using this endpoint.
        const FORM_ENDPOINT = (typeof GAME_SECRETS !== 'undefined' && GAME_SECRETS.formspreeEndpoint)
            ? GAME_SECRETS.formspreeEndpoint
            : 'https://formspree.io/f/xppqnwol';
        const endpoint = FORM_ENDPOINT;

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
                const res = await fetch(endpoint, {
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
