document.addEventListener('DOMContentLoaded', function() {
    // Form submission with loading state
    const form = document.getElementById('feeling-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitLoading = document.getElementById('submit-loading');
    
    if (form) {
        form.addEventListener('submit', function() {
            // Show loading state
            submitText.classList.add('d-none');
            submitLoading.classList.remove('d-none');
            submitBtn.disabled = true;
        });
    }
    
    // Clear textarea functionality
    window.clearTextarea = function() {
        document.getElementById('feeling-textarea').value = '';
    };
    
    // New question button functionality
    const newQuestionBtn = document.querySelector('.new-question-btn');
    if (newQuestionBtn) {
        newQuestionBtn.addEventListener('click', function() {
            const responseCard = document.getElementById('response-card');
            
            // Animate card removal
            responseCard.classList.remove('animate__fadeIn');
            responseCard.classList.add('animate__fadeOut');
            
            // Scroll to form
            document.getElementById('feeling-textarea').scrollIntoView({ behavior: 'smooth' });
            
            // Clear the textarea
            clearTextarea();
            
            // Focus on textarea
            setTimeout(() => {
                document.getElementById('feeling-textarea').focus();
            }, 500);
        });
    }
    
    // Feedback buttons functionality
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            
            // Remove active class from all buttons
            feedbackBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Send feedback to server
            fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    value: value,
                    response_id: getCurrentResponseId()
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Feedback saved:', data);
            })
            .catch(error => {
                console.error('Error saving feedback:', error);
            });
        });
    });
    
    // Helper function to get current response ID
    function getCurrentResponseId() {
        // This would be implemented if we had a proper ID system
        return 'current-response';
    }
    
    // Helper function to extract plain text from HTML
    function extractTextFromHTML(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
    
    // Save response to history
    const saveResponseBtn = document.querySelector('.save-response');
    if (saveResponseBtn) {
        saveResponseBtn.addEventListener('click', function() {
            const responseContent = document.querySelector('.scripture-content').innerHTML;
            const prompt = document.getElementById('feeling-textarea').value || 'Saved Scripture';
            
            fetch('/api/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    response: responseContent,
                    prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
                    full_prompt: prompt
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    alert('Scripture saved to your history!');
                    
                    // Update icon to show saved state
                    saveResponseBtn.innerHTML = '<i class="bi bi-bookmark-fill"></i>';
                    saveResponseBtn.classList.add('btn-primary');
                    saveResponseBtn.classList.remove('btn-outline-secondary');
                }
            })
            .catch(error => {
                console.error('Error saving response:', error);
                alert('Failed to save scripture. Please try again.');
            });
        });
    }
    
    // Share response functionality
    const shareResponseBtn = document.querySelector('.share-response');
    if (shareResponseBtn) {
        shareResponseBtn.addEventListener('click', function() {
            // Get the current response HTML content
            const responseHTML = document.querySelector('.scripture-content').innerHTML;
            
            // Extract plain text from HTML for sharing
            const scriptureText = extractTextFromHTML(responseHTML);
            
            // Set the share text
            const shareText = document.getElementById('share-text');
            shareText.value = scriptureText;
            
            // Set up WhatsApp and Email share links with actual content
            const whatsappShare = document.getElementById('whatsapp-share');
            whatsappShare.href = 'https://wa.me/?text=' + encodeURIComponent(scriptureText);
            
            const emailShare = document.getElementById('email-share');
            emailShare.href = 'mailto:?subject=Scripture for You&body=' + encodeURIComponent(scriptureText);
            
            // Show the share modal
            const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
            shareModal.show();
        });
    }
    
    // Copy text functionality
    const copyTextBtn = document.getElementById('copy-text');
    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', function() {
            const shareText = document.getElementById('share-text');
            shareText.select();
            document.execCommand('copy');
            
            // Show copied confirmation
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="bi bi-check"></i> Copied!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    }
    
    // Load history data
    function loadHistory() {
        const historyItems = document.getElementById('history-items');
        if (!historyItems) return;
        
        fetch('/api/history')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    historyItems.innerHTML = `
                        <div class="text-center py-5 text-muted">
                            <i class="bi bi-clock-history fs-1"></i>
                            <p class="mt-3">Your saved scriptures will appear here</p>
                        </div>
                    `;
                    return;
                }
                
                historyItems.innerHTML = '';
                data.forEach(item => {
                    // Convert timestamp placeholder to actual date if needed
                    let timestamp = item.timestamp;
                    if (timestamp === '__TIME__') {
                        timestamp = new Date().toLocaleString();
                    }
                    
                    const historyItem = document.createElement('div');
                    historyItem.className = 'list-group-item history-item';
                    historyItem.innerHTML = `
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="history-prompt">${item.prompt}</div>
                                <small class="history-timestamp">${timestamp}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline-primary view-history-item" data-id="${item.id}">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-history-item ms-1" data-id="${item.id}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    historyItems.appendChild(historyItem);
                });
                
                // Add event listeners to the view and delete buttons
                document.querySelectorAll('.view-history-item').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        viewHistoryItem(id, data);
                    });
                });
                
                document.querySelectorAll('.delete-history-item').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        deleteHistoryItem(id);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading history:', error);
                historyItems.innerHTML = `
                    <div class="alert alert-danger">
                        Failed to load history. Please try again later.
                    </div>
                `;
            });
    }
    
    // Load history when the modal is shown
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.addEventListener('show.bs.modal', function() {
            loadHistory();
        });
    }
    
    // View history item
    function viewHistoryItem(id, data) {
        const item = data.find(i => i.id === id);
        if (!item) return;
        
        // Hide the history modal
        bootstrap.Modal.getInstance(document.getElementById('historyModal')).hide();
        
        // Create a response card if it doesn't exist
        let responseCard = document.getElementById('response-card');
        if (!responseCard) {
            responseCard = document.createElement('div');
            responseCard.id = 'response-card';
            responseCard.className = 'card shadow-sm animate__animated animate__fadeIn';
            responseCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Scripture for You</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-secondary save-response" title="Save to history">
                            <i class="bi bi-bookmark-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary share-response ms-1" title="Share this verse">
                            <i class="bi bi-share"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="scripture-content"></div>
                    <div class="mt-4 d-flex justify-content-between align-items-center">
                        <div class="feedback-section">
                            <span class="me-2">Was this helpful?</span>
                            <button class="btn btn-sm btn-outline-success feedback-btn" data-value="helpful">
                                <i class="bi bi-hand-thumbs-up"></i> Yes
                            </button>
                            <button class="btn btn-sm btn-outline-danger feedback-btn ms-1" data-value="not-helpful">
                                <i class="bi bi-hand-thumbs-down"></i> No
                            </button>
                        </div>
                        <button class="btn btn-sm btn-primary new-question-btn">New Question</button>
                    </div>
                </div>
            `;
            
            document.querySelector('.col-lg-8').appendChild(responseCard);
        }
        
        // Update the response card content
        responseCard.querySelector('.scripture-content').innerHTML = item.response;
        
        // Populate textarea with the original prompt
        if (item.full_prompt) {
            document.getElementById('feeling-textarea').value = item.full_prompt;
        }
        
        // Show the response card with animation
        responseCard.classList.remove('d-none', 'animate__fadeOut');
        responseCard.classList.add('animate__fadeIn');
        
        // Scroll to the response card
        responseCard.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Delete history item
    function deleteHistoryItem(id) {
        if (!confirm('Are you sure you want to delete this scripture from your history?')) return;
        
        fetch(`/api/history/${id}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload history
                    loadHistory();
                }
            })
            .catch(error => {
                console.error('Error deleting history item:', error);
                alert('Failed to delete scripture. Please try again.');
            });
    }
    
    // Clear all history
    const clearHistoryBtn = document.getElementById('clear-history');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (!confirm('Are you sure you want to clear all your saved scriptures? This cannot be undone.')) return;
            
            fetch('/api/history', {
                method: 'DELETE',
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Reload history
                        loadHistory();
                    }
                })
                .catch(error => {
                    console.error('Error clearing history:', error);
                    alert('Failed to clear history. Please try again.');
                });
        });
    }
});