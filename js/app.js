// App-specific JavaScript functionality for ExamSage

document.addEventListener('DOMContentLoaded', function() {
    // Initialize app components
    initCharacterCounter();
    initAnswerLengthSlider();
    initGenerateButton();
    initQuickActions();
    initLocalStorage();
    
    // Load saved data if available
    loadSavedData();
});

// Character counter for textarea
function initCharacterCounter() {
    const notesInput = document.getElementById('notes-input');
    const charCount = document.getElementById('char-count');
    
    if (notesInput && charCount) {
        notesInput.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count.toLocaleString();
            
            // Change color based on length
            if (count > 5000) {
                charCount.classList.add('text-red-500');
                charCount.classList.remove('text-gray-500');
            } else if (count > 3000) {
                charCount.classList.add('text-yellow-500');
                charCount.classList.remove('text-gray-500', 'text-red-500');
            } else {
                charCount.classList.remove('text-red-500', 'text-yellow-500');
                charCount.classList.add('text-gray-500');
            }
        });
    }
}

// Answer length slider functionality
function initAnswerLengthSlider() {
    const slider = document.getElementById('length-slider');
    const labels = document.querySelectorAll('.slider-label');
    
    if (slider && labels.length > 0) {
        slider.addEventListener('input', function() {
            const value = parseInt(this.value);
            
            // Update label states
            labels.forEach((label, index) => {
                if (index < value) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        });
        
        // Initialize
        const initialValue = parseInt(slider.value);
        labels.forEach((label, index) => {
            if (index < initialValue) {
                label.classList.add('active');
            }
        });
    }
}

// Generate button functionality
function initGenerateButton() {
    const generateBtn = document.getElementById('generate-btn');
    const notesInput = document.getElementById('notes-input');
    const subjectSelect = document.getElementById('subject-select');
    const lengthSlider = document.getElementById('length-slider');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            const notes = notesInput ? notesInput.value.trim() : '';
            const subject = subjectSelect ? subjectSelect.value : '';
            const length = lengthSlider ? parseInt(lengthSlider.value) : 2;
            
            // Validate input
            if (!notes) {
                showNotification('Please enter some notes to convert', 'warning');
                notesInput?.focus();
                return;
            }
            
            if (notes.length < 50) {
                showNotification('Please enter at least 50 characters for better results', 'warning');
                return;
            }
            
            // Track usage
            trackEvent('generate_answers', {
                notesLength: notes.length,
                subject: subject,
                answerLength: length
            });
            
            // Generate answers
            generateAnswers(notes, subject, length);
        });
    }
}

// Mock AI answer generation
function generateAnswers(notes, subject, length) {
    const outputContent = document.getElementById('output-content');
    const loadingState = document.getElementById('loading-state');
    const copyAllBtn = document.getElementById('copy-all-btn');
    
    if (!outputContent || !loadingState) return;
    
    // Show loading state
    outputContent.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Disable generate button
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    
    generateBtn.disabled = true;
    btnText.textContent = 'Processing...';
    btnSpinner.classList.remove('hidden');
    
    // Simulate AI processing steps
    const processingSteps = [
        'Analyzing content structure...',
        'Identifying key concepts...',
        'Extracting important information...',
        'Formatting exam answers...',
        'Finalizing results...'
    ];
    
    let currentStep = 0;
    const progressFill = document.getElementById('progress-fill');
    const processingStepEl = document.getElementById('processing-step');
    
    const stepInterval = setInterval(() => {
        if (currentStep < processingSteps.length) {
            processingStepEl.textContent = processingSteps[currentStep];
            const progress = ((currentStep + 1) / processingSteps.length) * 100;
            progressFill.style.width = `${progress}%`;
            currentStep++;
        } else {
            clearInterval(stepInterval);
        }
    }, 800);
    
    // Generate mock answers after delay
    setTimeout(() => {
        const answers = generateMockAnswers(notes, subject, length);
        displayAnswers(answers);
        
        // Hide loading state
        loadingState.classList.add('hidden');
        outputContent.classList.remove('hidden');
        
        // Reset generate button
        generateBtn.disabled = false;
        btnText.textContent = 'Generate Answers';
        btnSpinner.classList.add('hidden');
        
        // Show copy all button
        copyAllBtn.classList.remove('hidden');
        
        // Auto-save to localStorage
        saveToStorage();
        
    }, 4000);
}

// Generate mock AI answers based on input
function generateMockAnswers(notes, subject, length) {
    const answers = [];
    
    // Extract key topics from notes (simple keyword extraction)
    const topics = extractTopics(notes, subject);
    
    // Generate answers based on length preference
    const answerLengths = {
        1: 'short',     // Short
        2: 'medium',    // Medium  
        3: 'long'       // Long
    };
    
    const answerLength = answerLengths[length] || 'medium';
    
    topics.forEach((topic, index) => {
        const answer = generateAnswerForTopic(topic, subject, answerLength);
        answers.push({
            id: index + 1,
            topic: topic,
            content: answer
        });
    });
    
    return answers;
}

// Extract topics from notes (mock implementation)
function extractTopics(notes, subject) {
    // Simple topic extraction based on common patterns
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const topics = [];
    
    // Extract 3-5 main topics
    const numTopics = Math.min(Math.max(3, Math.floor(sentences.length / 5)), 5);
    
    for (let i = 0; i < numTopics && i < sentences.length; i++) {
        const sentence = sentences[i * Math.floor(sentences.length / numTopics)].trim();
        if (sentence) {
            // Extract the main concept (first few words)
            const words = sentence.split(' ').slice(0, 5).join(' ');
            if (words.length > 10) {
                topics.push(words + (words.endsWith('...') ? '' : '...'));
            }
        }
    }
    
    // Fallback topics if extraction fails
    if (topics.length === 0) {
        const fallbackTopics = getFallbackTopics(subject);
        return fallbackTopics.slice(0, 3);
    }
    
    return topics;
}

// Generate answer for a specific topic
function generateAnswerForTopic(topic, subject, length) {
    const templates = {
        short: [
            `**${topic}** is a fundamental concept that involves [key principle]. The main points to remember are: 1) [Point 1], 2) [Point 2], and 3) [Point 3].`,
            `Regarding **${topic}**: This concept is characterized by [main feature]. Important aspects include [aspect 1] and [aspect 2].`,
            `**${topic}** can be defined as [definition]. Key characteristics: [characteristic 1], [characteristic 2].`
        ],
        medium: [
            `**${topic}** is an important concept in ${subject || 'this subject'}. \n\nThe main definition involves [detailed explanation of the concept]. This is significant because [reason for importance].\n\nKey points to remember:\n• [Point 1 with explanation]\n• [Point 2 with explanation]\n• [Point 3 with explanation]\n\nFor exam purposes, focus on [specific exam tip].`,
            `Understanding **${topic}** requires knowledge of [prerequisite concepts]. \n\nThe concept works through [process explanation]. This is demonstrated by [example or application].\n\nCritical aspects include:\n• [Aspect 1]: [Explanation]\n• [Aspect 2]: [Explanation]\n• [Aspect 3]: [Explanation]\n\nCommon exam questions focus on [typical question types].`,
            `**${topic}** represents [core meaning]. \n\nHistorically, this concept emerged from [background context]. The practical applications include [real-world usage].\n\nStudents should understand:\n• The relationship between [relationship 1]\n• How this affects [impact or consequence]\n• Why this matters for [broader significance]\n\nExam strategy: [specific preparation advice].`
        ],
        long: [
            `**${topic}** is a comprehensive concept that plays a crucial role in ${subject || 'this field of study'}.\n\n**Definition and Background:**\n[Detailed definition with context]. This concept has evolved from [historical development] and continues to be relevant because [current importance].\n\n**Core Components:**\n• **Component 1**: [Detailed explanation with examples]\n• **Component 2**: [Detailed explanation with examples]\n• **Component 3**: [Detailed explanation with examples]\n\n**Practical Applications:**\nThis concept is applied in [real-world scenarios]. Students often encounter this in [common situations].\n\n**Relationships to Other Concepts:**\n${topic} is closely related to [related concept 1] and [related concept 2]. Understanding these connections is crucial for [explanation of importance].\n\n**Exam Preparation Tips:**\n• Focus on [specific areas]\n• Practice [recommended exercises]\n• Remember the connection between [key relationships]\n• Common mistakes to avoid: [typical errors]\n\n**Sample Exam Questions:**\n1. [Question type 1 example]\n2. [Question type 2 example]\n3. [Question type 3 example]`
        ]
    };
    
    const templateArray = templates[length] || templates.medium;
    const template = templateArray[Math.floor(Math.random() * templateArray.length)];
    
    // Replace placeholders with more specific content
    return template
        .replace(/\[key principle\]/g, getContextualContent('principle', subject))
        .replace(/\[Point \d+\]/g, () => getContextualContent('point', subject))
        .replace(/\[main feature\]/g, getContextualContent('feature', subject))
        .replace(/\[aspect \d+\]/g, () => getContextualContent('aspect', subject))
        .replace(/\[characteristic \d+\]/g, () => getContextualContent('characteristic', subject))
        .replace(/\[detailed explanation.*?\]/g, () => getContextualContent('explanation', subject))
        .replace(/\[reason for importance\]/g, getContextualContent('importance', subject))
        .replace(/\[.*?\]/g, () => getContextualContent('generic', subject));
}

// Get contextual content based on subject
function getContextualContent(type, subject) {
    const contentMap = {
        mathematics: {
            principle: 'mathematical relationships and formulas',
            point: 'solve step by step',
            feature: 'numerical precision and logical reasoning',
            aspect: 'formula application',
            characteristic: 'quantitative analysis',
            explanation: 'the mathematical process involving calculations and proofs',
            importance: 'it forms the foundation for advanced mathematical concepts',
            generic: 'mathematical concepts and problem-solving methods'
        },
        physics: {
            principle: 'physical laws and natural phenomena',
            point: 'understand the underlying physics',
            feature: 'measurable physical properties',
            aspect: 'experimental verification',
            characteristic: 'empirical observation',
            explanation: 'the physical mechanism and scientific principles',
            importance: 'it explains how the natural world operates',
            generic: 'scientific principles and experimental evidence'
        },
        chemistry: {
            principle: 'chemical reactions and molecular interactions',
            point: 'balance equations correctly',
            feature: 'molecular structure and bonding',
            aspect: 'reaction mechanisms',
            characteristic: 'chemical properties',
            explanation: 'the chemical process and molecular behavior',
            importance: 'it governs chemical transformations',
            generic: 'chemical processes and molecular interactions'
        },
        biology: {
            principle: 'biological processes and life systems',
            point: 'understand the biological function',
            feature: 'living organism characteristics',
            aspect: 'evolutionary adaptation',
            characteristic: 'biological diversity',
            explanation: 'the biological mechanism and life processes',
            importance: 'it explains how living systems function',
            generic: 'biological systems and life processes'
        },
        history: {
            principle: 'historical events and their consequences',
            point: 'analyze cause and effect',
            feature: 'historical significance',
            aspect: 'social and political context',
            characteristic: 'historical patterns',
            explanation: 'the historical context and cultural significance',
            importance: 'it helps us understand current events',
            generic: 'historical context and cultural developments'
        },
        default: {
            principle: 'fundamental concepts and principles',
            point: 'remember the key details',
            feature: 'important characteristics',
            aspect: 'relevant factors',
            characteristic: 'defining features',
            explanation: 'the underlying concepts and mechanisms',
            importance: 'it provides essential knowledge',
            generic: 'relevant information and concepts'
        }
    };
    
    const content = contentMap[subject] || contentMap.default;
    return content[type] || content.generic;
}

// Get fallback topics based on subject
function getFallbackTopics(subject) {
    const fallbackMap = {
        mathematics: ['Algebraic equations', 'Geometric principles', 'Statistical analysis'],
        physics: ['Force and motion', 'Energy conservation', 'Wave properties'],
        chemistry: ['Chemical bonding', 'Reaction kinetics', 'Molecular structure'],
        biology: ['Cell structure', 'Genetic inheritance', 'Ecosystem interactions'],
        history: ['Historical timeline', 'Cultural developments', 'Political changes'],
        english: ['Literary themes', 'Character analysis', 'Narrative structure'],
        psychology: ['Cognitive processes', 'Behavioral patterns', 'Social influences'],
        economics: ['Market dynamics', 'Economic indicators', 'Supply and demand'],
        'computer-science': ['Algorithm design', 'Data structures', 'Programming concepts'],
        business: ['Strategic planning', 'Market analysis', 'Organizational behavior']
    };
    
    return fallbackMap[subject] || ['Key concept 1', 'Important principle', 'Main topic'];
}

// Display generated answers
function displayAnswers(answers) {
    const outputContent = document.getElementById('output-content');
    
    if (!outputContent || answers.length === 0) return;
    
    let html = '<div class="space-y-4">';
    
    answers.forEach(answer => {
        html += `
            <div class="answer-item" data-answer-id="${answer.id}">
                <div class="answer-header">
                    <h3 class="answer-title">Question ${answer.id}: ${answer.topic}</h3>
                    <button class="copy-btn" onclick="copyAnswer(${answer.id})">
                        <i class="fas fa-copy mr-2"></i>
                        Copy
                    </button>
                </div>
                <div class="answer-content">
                    ${formatText(answer.content)}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    outputContent.innerHTML = html;
    
    // Animate answers appearing
    const answerItems = outputContent.querySelectorAll('.answer-item');
    answerItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease-out';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Copy individual answer
function copyAnswer(answerId) {
    const answerElement = document.querySelector(`[data-answer-id="${answerId}"] .answer-content`);
    if (answerElement) {
        const text = answerElement.textContent || answerElement.innerText;
        copyToClipboard(text);
        
        // Track copy action
        trackEvent('copy_answer', { answerId: answerId });
    }
}

// Quick Actions
function initQuickActions() {
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAll);
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', saveToStorage);
    }
    
    if (loadBtn) {
        loadBtn.addEventListener('click', loadFromStorage);
    }
    
    if (copyAllBtn) {
        copyAllBtn.addEventListener('click', copyAllAnswers);
    }
}

// Clear all inputs and outputs
function clearAll() {
    if (confirm('Are you sure you want to clear all content?')) {
        const notesInput = document.getElementById('notes-input');
        const subjectSelect = document.getElementById('subject-select');
        const lengthSlider = document.getElementById('length-slider');
        const outputContent = document.getElementById('output-content');
        const copyAllBtn = document.getElementById('copy-all-btn');
        
        if (notesInput) notesInput.value = '';
        if (subjectSelect) subjectSelect.value = '';
        if (lengthSlider) {
            lengthSlider.value = '2';
            // Reset slider labels
            const labels = document.querySelectorAll('.slider-label');
            labels.forEach((label, index) => {
                if (index < 2) {
                    label.classList.add('active');
                } else {
                    label.classList.remove('active');
                }
            });
        }
        
        if (outputContent) {
            outputContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-magic text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500 text-lg">Your AI-generated answers will appear here</p>
                    <p class="text-gray-400 text-sm mt-2">Enter your notes above and click "Generate Answers" to get started</p>
                </div>
            `;
        }
        
        if (copyAllBtn) copyAllBtn.classList.add('hidden');
        
        // Update character counter
        const charCount = document.getElementById('char-count');
        if (charCount) charCount.textContent = '0';
        
        showNotification('All content cleared', 'info');
        trackEvent('clear_all');
    }
}

// Save to localStorage
function saveToStorage() {
    const notesInput = document.getElementById('notes-input');
    const subjectSelect = document.getElementById('subject-select');
    const lengthSlider = document.getElementById('length-slider');
    const outputContent = document.getElementById('output-content');
    
    const data = {
        notes: notesInput ? notesInput.value : '',
        subject: subjectSelect ? subjectSelect.value : '',
        length: lengthSlider ? lengthSlider.value : '2',
        hasAnswers: outputContent ? !outputContent.querySelector('.empty-state') : false,
        timestamp: Date.now()
    };
    
    if (Storage.set('examsage_data', data)) {
        showNotification('Data saved successfully', 'success');
        trackEvent('save_data');
    } else {
        showNotification('Failed to save data', 'error');
    }
}

// Load from localStorage  
function loadFromStorage() {
    const data = Storage.get('examsage_data');
    
    if (!data) {
        showNotification('No saved data found', 'warning');
        return;
    }
    
    const notesInput = document.getElementById('notes-input');
    const subjectSelect = document.getElementById('subject-select');
    const lengthSlider = document.getElementById('length-slider');
    
    if (notesInput && data.notes) {
        notesInput.value = data.notes;
        // Trigger character counter update
        notesInput.dispatchEvent(new Event('input'));
    }
    
    if (subjectSelect && data.subject) {
        subjectSelect.value = data.subject;
    }
    
    if (lengthSlider && data.length) {
        lengthSlider.value = data.length;
        // Update slider labels
        const labels = document.querySelectorAll('.slider-label');
        const value = parseInt(data.length);
        labels.forEach((label, index) => {
            if (index < value) {
                label.classList.add('active');
            } else {
                label.classList.remove('active');
            }
        });
    }
    
    const timeDiff = Date.now() - data.timestamp;
    const timeAgo = Math.floor(timeDiff / (1000 * 60)); // minutes ago
    
    showNotification(`Data loaded (saved ${timeAgo} minutes ago)`, 'success');
    trackEvent('load_data', { timeAgo: timeAgo });
}

// Copy all answers
function copyAllAnswers() {
    const answerItems = document.querySelectorAll('.answer-item');
    
    if (answerItems.length === 0) {
        showNotification('No answers to copy', 'warning');
        return;
    }
    
    let allText = 'ExamSage - Generated Answers\n';
    allText += '=' .repeat(30) + '\n\n';
    
    answerItems.forEach((item, index) => {
        const title = item.querySelector('.answer-title')?.textContent || `Answer ${index + 1}`;
        const content = item.querySelector('.answer-content')?.textContent || '';
        
        allText += `${title}\n`;
        allText += '-'.repeat(title.length) + '\n';
        allText += content + '\n\n';
    });
    
    allText += `Generated by ExamSage - ${new Date().toLocaleString()}`;
    
    copyToClipboard(allText);
    trackEvent('copy_all_answers', { answerCount: answerItems.length });
}

// Local Storage initialization
function initLocalStorage() {
    // Check if localStorage is available
    if (typeof(Storage) === "undefined") {
        console.warn('localStorage is not supported');
        // Hide save/load buttons
        const saveBtn = document.getElementById('save-btn');
        const loadBtn = document.getElementById('load-btn');
        if (saveBtn) saveBtn.style.display = 'none';
        if (loadBtn) loadBtn.style.display = 'none';
    }
}

// Load saved data on page load
function loadSavedData() {
    // Auto-load data if it exists and is recent (less than 1 hour old)
    const data = Storage.get('examsage_data');
    
    if (data && data.timestamp) {
        const timeDiff = Date.now() - data.timestamp;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (timeDiff < oneHour && data.notes && data.notes.length > 50) {
            // Show option to restore previous session
            setTimeout(() => {
                if (confirm('Would you like to restore your previous session?')) {
                    loadFromStorage();
                }
            }, 1000);
        }
    }
}

// Auto-save functionality
let autoSaveTimeout;
function setupAutoSave() {
    const notesInput = document.getElementById('notes-input');
    
    if (notesInput) {
        notesInput.addEventListener('input', function() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                if (this.value.length > 100) {
                    saveToStorage();
                }
            }, 5000); // Auto-save after 5 seconds of no typing
        });
    }
}

// Initialize auto-save
setupAutoSave();
