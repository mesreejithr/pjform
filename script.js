document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const submitBtn = form.querySelector('.submit-btn');
    const fileInput = document.getElementById('resume');
    const fileLabel = form.querySelector('.file-label');

    // Update file label when a file is selected
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            fileLabel.textContent = this.files[0].name;
        } else {
            fileLabel.textContent = 'Choose file';
        }
    });

    // Phone number validation
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        // Remove non-numeric characters
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // Format phone number
        if (this.value.length > 0) {
            this.value = this.value.match(new RegExp('.{1,10}', 'g')).join('-');
        }
    });

    // CTC validation
    const ctcInputs = document.querySelectorAll('input[name$="CTC"]');
    ctcInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove non-numeric characters except decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Format with commas for thousands
            if (this.value) {
                const parts = this.value.split('.');
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                this.value = parts.join('.');
            }
        });
    });

    // LinkedIn URL validation
    const linkedinInput = document.getElementById('linkedin');
    linkedinInput.addEventListener('input', function(e) {
        if (this.value && !this.value.includes('linkedin.com')) {
            this.setCustomValidity('Please enter a valid LinkedIn URL');
        } else {
            this.setCustomValidity('');
        }
    });

    // Experience validation
    const totalExpInput = document.getElementById('totalExperience');
    const relevantExpInput = document.getElementById('relevantExperience');
    
    function validateExperience() {
        if (totalExpInput.value && relevantExpInput.value) {
            if (parseFloat(relevantExpInput.value) > parseFloat(totalExpInput.value)) {
                relevantExpInput.setCustomValidity('Relevant experience cannot be greater than total experience');
            } else {
                relevantExpInput.setCustomValidity('');
            }
        }
    }

    totalExpInput.addEventListener('input', validateExperience);
    relevantExpInput.addEventListener('input', validateExperience);

    // Audio Recording Setup
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    // Recording buttons
    const recordIntroBtn = document.getElementById('recordIntro');
    const recordSalesBtn = document.getElementById('recordSales');
    const introStatus = document.getElementById('introRecordingStatus');
    const salesStatus = document.getElementById('salesRecordingStatus');
    const introAudioPreview = document.getElementById('introAudioPreview');
    const salesAudioPreview = document.getElementById('salesAudioPreview');

    // Function to handle recording
    async function startRecording(button, statusElement, previewElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Create audio element
                const audio = document.createElement('audio');
                audio.controls = true;
                audio.src = audioUrl;
                
                // Clear previous preview
                previewElement.innerHTML = '';
                previewElement.appendChild(audio);
                previewElement.classList.add('show');

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                isRecording = false;
                button.classList.remove('recording');
                statusElement.textContent = '';
                button.innerHTML = '<i class="fas fa-microphone"></i><span>Record Answer</span>';
            };

            mediaRecorder.start();
            isRecording = true;
            button.classList.add('recording');
            statusElement.textContent = 'Recording...';
            statusElement.classList.add('recording');
            button.innerHTML = '<i class="fas fa-stop"></i><span>Stop Recording</span>';
        } catch (error) {
            console.error('Error accessing microphone:', error);
            showNotification('Error accessing microphone. Please ensure you have granted microphone permissions.', 'error');
        }
    }

    // Function to stop recording
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }
    }

    // Event listeners for recording buttons
    recordIntroBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording(recordIntroBtn, introStatus, introAudioPreview);
        } else {
            stopRecording();
        }
    });

    recordSalesBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording(recordSalesBtn, salesStatus, salesAudioPreview);
        } else {
            stopRecording();
        }
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Basic form validation
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span>Submitting...</span><i class="fas fa-spinner"></i>';

        try {
            // Here you would typically:
            // 1. Get the audio blobs from the preview elements
            // 2. Convert them to base64 or FormData
            // 3. Include them in your form submission

            await new Promise(resolve => setTimeout(resolve, 1500));
            showNotification('Application submitted successfully!', 'success');
            form.reset();
            fileLabel.textContent = 'Choose file';
            
            // Clear audio previews
            introAudioPreview.innerHTML = '';
            salesAudioPreview.innerHTML = '';
            introAudioPreview.classList.remove('show');
            salesAudioPreview.classList.remove('show');
        } catch (error) {
            showNotification('Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '<span>Submit Application</span><i class="fas fa-arrow-right"></i>';
        }
    });

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                transform: translateY(100px);
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 1000;
            }
            .notification.success {
                background: #48bb78;
            }
            .notification.error {
                background: #f56565;
            }
            .notification.show {
                transform: translateY(0);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add smooth scrolling to form elements
    const formElements = form.querySelectorAll('input, select, textarea');
    formElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}); 