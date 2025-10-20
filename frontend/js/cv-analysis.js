/**
 * CV Analysis & Job Matching - Frontend Logic
 * Connects to TalentBridge Backend API
 */

// API Configuration
const API_BASE_URL = 'http://localhost:9990';
let currentCVId = null;
let currentCVInfo = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeUpload();
    initializeTabs();
    loadExistingCVs();

    // Check if cv_id in URL (from dashboard)
    const urlParams = new URLSearchParams(window.location.search);
    const cvId = urlParams.get('cv_id');
    if (cvId) {
        loadCVFromId(parseInt(cvId));
    }
});

// ===== LOAD CV FROM ID (FROM DASHBOARD) =====

async function loadCVFromId(cvId) {
    try {
        console.log('Loading CV from ID:', cvId);

        // Fetch CV data
        const response = await fetch(`${API_BASE_URL}/cvs`);
        if (!response.ok) {
            throw new Error('Failed to load CVs');
        }

        const cvs = await response.json();
        console.log('Fetched CVs:', cvs.length);

        const cv = cvs.find(c => c.id === cvId);

        if (!cv) {
            alert('CV không tồn tại');
            return;
        }

        console.log('Found CV:', cv.id, cv.filename);

        // Set current CV
        currentCVId = cv.id;
        currentCVInfo = cv.cv_info;

        // Hide upload section, show results
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        // Load PDF viewer
        try {
            loadPDFViewer(cv.id, cv.filename);
            console.log('✅ PDF viewer loaded');
        } catch (pdfError) {
            console.error('❌ PDF viewer error:', pdfError);
            // Fallback: Display error message in viewer
            document.getElementById('pdfViewer').innerHTML = '<p class="text-danger text-center p-5">Lỗi tải PDF. Vui lòng mở tab mới để xem.</p>';
        }

        // Display CV info
        try {
            if (!cv.cv_info) {
                console.warn('⚠️ cv_info is null or undefined');
                document.getElementById('cvInfoContent').innerHTML = '<p class="text-danger">Không có thông tin CV</p>';
            } else {
                displayCVInfo(cv.cv_info);
                console.log('✅ CV info displayed');
            }
        } catch (infoError) {
            console.error('❌ Display CV info error:', infoError);
            document.getElementById('cvInfoContent').innerHTML = '<p class="text-danger">Lỗi hiển thị thông tin CV</p>';
        }

        // Load insights
        try {
            await loadCVInsights();
            console.log('✅ Insights loaded');
        } catch (insightsError) {
            console.error('❌ Insights error:', insightsError);
        }

        // Load improvements (only call once here)
        try {
            await loadImprovements();
            console.log('✅ Improvements loaded');
        } catch (improvementsError) {
            console.error('❌ Improvements error:', improvementsError);
        }

        console.log('✅ CV loaded successfully');

    } catch (error) {
        console.error('❌ Error loading CV:', error);
        console.error('Error stack:', error.stack);
        // Don't show alert - errors are already handled in individual sections
        // Only show alert if it's a critical error (e.g., CV not found)
        if (error.message.includes('CV không tồn tại') || error.message.includes('Failed to load CVs')) {
            alert(`Không thể tải CV. Lỗi: ${error.message}`);
        }
    }
}

// ===== UPLOAD FUNCTIONALITY =====

function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('cvFileInput');
    
    // Click to upload
    uploadArea.addEventListener('click', function(e) {
        if (e.target.id !== 'cvFileInput') {
            fileInput.click();
        }
    });
    
    // File selected
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            uploadCV(e.target.files[0]);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                uploadCV(file);
            } else {
                alert('Vui lòng chỉ upload file PDF');
            }
        }
    });
}

async function uploadCV(file) {
    const uploadPrompt = document.getElementById('uploadPrompt');
    const uploadProgress = document.getElementById('uploadProgress');
    
    uploadPrompt.style.display = 'none';
    uploadProgress.style.display = 'block';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API_BASE_URL}/upload-cv`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Upload successful:', data);
        
        currentCVId = data.cv_id;
        currentCVInfo = data.cv_info;

        // Show results section
        document.getElementById('uploadSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        // Load PDF viewer
        loadPDFViewer(data.cv_id, data.filename);

        // Display CV info
        displayCVInfo(data.cv_info);
        
        // Load insights
        loadCVInsights();
        
        // Load improvements (only call once after upload)
        loadImprovements();
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Lỗi khi upload CV. Vui lòng thử lại.');
        uploadPrompt.style.display = 'block';
        uploadProgress.style.display = 'none';
    }
}

// ===== TAB NAVIGATION =====

function initializeTabs() {
    const tabLinks = document.querySelectorAll('.nav-link[data-tab]');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content-custom').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Find jobs button
    const findJobsBtn = document.getElementById('findJobsBtn');
    if (findJobsBtn) {
        findJobsBtn.addEventListener('click', findMatchingJobs);
    }
}

// ===== DISPLAY CV INFO =====

function loadPDFViewer(cvId, filename) {
    const pdfViewer = document.getElementById('pdfViewer');

    // Tạo iframe để hiển thị PDF
    pdfViewer.innerHTML = `
        <div class="pdf-viewer-container">
            <iframe
                src="${API_BASE_URL}/preview-doc/${cvId}#toolbar=0"
                width="100%"
                height="700px"
                style="border: 1px solid #ddd; border-radius: 4px;"
                title="${filename}"
                type="application/pdf">
            </iframe>
            <p class="text-center mt-3">
                <a href="${API_BASE_URL}/preview-doc/${cvId}" target="_blank" class="btn btn-sm btn-primary">
                    <i class="fa fa-external-link"></i> Mở PDF trong tab mới
                </a>
            </p>
        </div>
    `;
}

function displayCVInfo(cvInfo) {
    const container = document.getElementById('cvInfoContent');

    if (!container) {
        console.error('❌ cvInfoContent element not found');
        return;
    }

    if (!cvInfo) {
        container.innerHTML = '<p class="text-danger">Không có thông tin CV</p>';
        return;
    }

    try {
        let html = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Thông Tin Cá Nhân</h6>
                    <p><strong>Họ tên:</strong> ${cvInfo.name || 'N/A'}</p>
                    <p><strong>Email:</strong> ${cvInfo.email || 'N/A'}</p>
                    <p><strong>Điện thoại:</strong> ${cvInfo.phone || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Mục Tiêu Nghề Nghiệp</h6>
                    <p>${cvInfo.career_objective || 'Không có thông tin'}</p>
                </div>
            </div>

            <div class="mt-4">
                <h6>Kỹ Năng</h6>
                <div>
        `;

        if (cvInfo.skills && Array.isArray(cvInfo.skills) && cvInfo.skills.length > 0) {
            cvInfo.skills.forEach(skill => {
                html += `<span class="badge-custom badge-skill">${skill}</span>`;
            });
        } else {
            html += '<p class="text-muted">Không có thông tin</p>';
        }

        html += `
                </div>
            </div>

            <div class="mt-4">
                <h6>Kinh Nghiệm Làm Việc</h6>
        `;

        if (cvInfo.experience && Array.isArray(cvInfo.experience) && cvInfo.experience.length > 0) {
            cvInfo.experience.forEach(exp => {
                // Format thời gian từ start_date và end_date
                let duration = 'Thời gian';
                if (exp.start_date || exp.end_date) {
                    const start = exp.start_date || 'N/A';
                    const end = exp.end_date || 'Present';
                    duration = `${start} - ${end}`;
                } else if (exp.duration || exp.period) {
                    duration = exp.duration || exp.period;
                }

                html += `
                    <div class="mb-3">
                        <p><strong>${exp.position || exp.title || 'Vị trí'}</strong></p>
                        <p class="text-muted">${exp.company || 'Công ty'} | ${duration}</p>
                        <p>${exp.description || exp.responsibilities || ''}</p>
                    </div>
                `;
            });
        } else {
            html += '<p class="text-muted">Không có thông tin</p>';
        }

        html += `
            </div>

            <div class="mt-4">
                <h6>Học Vấn</h6>
        `;

        if (cvInfo.education && Array.isArray(cvInfo.education) && cvInfo.education.length > 0) {
            cvInfo.education.forEach(edu => {
                // Format năm từ start_date và end_date
                let year = 'Năm';
                if (edu.start_date || edu.end_date) {
                    const start = edu.start_date || 'N/A';
                    const end = edu.end_date || 'Present';
                    year = `${start} - ${end}`;
                } else if (edu.year || edu.period) {
                    year = edu.year || edu.period;
                }

                html += `
                    <div class="mb-3">
                        <p><strong>${edu.degree || edu.major || 'Bằng cấp'}</strong></p>
                        <p class="text-muted">${edu.school || edu.university || 'Trường'} | ${year}</p>
                        ${edu.major ? `<p class="text-muted">Chuyên ngành: ${edu.major}</p>` : ''}
                    </div>
                `;
            });
        } else {
            html += '<p class="text-muted">Không có thông tin</p>';
        }

        html += '</div>';

        container.innerHTML = html;
    } catch (error) {
        console.error('❌ Error rendering CV info:', error);
        container.innerHTML = '<p class="text-danger">Lỗi hiển thị thông tin CV</p>';
    }
}

// ===== LOAD CV INSIGHTS =====

async function loadCVInsights() {
    if (!currentCVId) return;
    
    const container = document.getElementById('insightsContent');
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p class="mt-3">Đang phân tích CV...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/cv/${currentCVId}/insights`);
        
        if (!response.ok) {
            throw new Error(`Failed to load insights: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Insights loaded:', data);
        
        displayInsights(data);
        
        // Removed duplicate call to loadImprovements() - now only in loadCVFromId/uploadCV
        
    } catch (error) {
        console.error('Error loading insights:', error);
        container.innerHTML = '<div class="alert alert-danger">Không thể tải phân tích. Vui lòng thử lại.</div>';
    }
}

// ===== DISPLAY INSIGHTS =====

function displayInsights(insights) {
    const container = document.getElementById('insightsContent');

    if (!container) {
        console.error('❌ insightsContent element not found');
        return;
    }

    if (!insights) {
        container.innerHTML = '<p class="text-danger">Không có dữ liệu phân tích</p>';
        return;
    }

    const qualityScore = insights.quality_score || 0;

    // Parse market_fit và completeness từ object
    const marketFit = insights.market_fit || {};
    const completeness = insights.completeness || {};

    // Market fit score (skill_match_rate là 0-1, nhân 10 để ra 0-10)
    const marketFitScore = (marketFit.skill_match_rate || 0) * 10;

    // Improved Completeness score - Tính động dựa trên currentCVInfo (nếu có)
    // Các phần bắt buộc (max 7): name, email, phone, career_objective, skills, experience, education
    // Các phần bổ sung (max 3): portfolio, certifications, projects
    let completenessScore = 0;
    if (currentCVInfo) {
        if (currentCVInfo.name) completenessScore += 1;
        if (currentCVInfo.email) completenessScore += 1;
        if (currentCVInfo.phone) completenessScore += 1;
        if (currentCVInfo.career_objective) completenessScore += 1;
        if (currentCVInfo.skills && currentCVInfo.skills.length > 0) completenessScore += 1;
        if (currentCVInfo.experience && currentCVInfo.experience.length > 0) completenessScore += 1;
        if (currentCVInfo.education && currentCVInfo.education.length > 0) completenessScore += 1;
        // Bổ sung (từ insights.completeness nếu có, hoặc assume từ cvInfo nếu thêm fields)
        if (completeness.has_portfolio || currentCVInfo.portfolio) completenessScore += 1;
        if (completeness.has_certifications || currentCVInfo.certifications) completenessScore += 1;
        if (completeness.has_projects || currentCVInfo.projects) completenessScore += 1;
    } else {
        completenessScore = 0; // Fallback nếu không có info
    }
    completenessScore = Math.max(0, Math.min(10, completenessScore)); // Giới hạn 0-10
    
    function getScoreClass(score) {
        if (score >= 7) return 'score-green';
        if (score >= 5) return 'score-yellow';
        return 'score-red';
    }

    function getScoreRating(score) {
        if (score >= 9) return { rating: 'Xuất Sắc', icon: '🌟', color: '#10b981' };
        if (score >= 7) return { rating: 'Tốt', icon: '✅', color: '#10b981' };
        if (score >= 5) return { rating: 'Trung Bình', icon: '⚠️', color: '#f59e0b' };
        if (score >= 3) return { rating: 'Cần Cải Thiện', icon: '⚡', color: '#ef4444' };
        return { rating: 'Yếu', icon: '❌', color: '#ef4444' };
    }

    function getScoreExplanation(type, score) {
        const rating = getScoreRating(score);
        let explanation = '';

        if (type === 'quality') {
            if (score >= 7) {
                explanation = 'CV của bạn có chất lượng tốt với cấu trúc rõ ràng, nội dung chuyên nghiệp và trình bày đẹp mắt.';
            } else if (score >= 5) {
                explanation = 'CV của bạn ở mức trung bình. Cần cải thiện cấu trúc, nội dung và cách trình bày để tăng cơ hội được tuyển dụng.';
            } else {
                explanation = 'CV của bạn cần cải thiện đáng kể về cấu trúc, nội dung và trình bày để thu hút nhà tuyển dụng.';
            }
        } else if (type === 'market') {
            if (score >= 7) {
                explanation = 'Kỹ năng và kinh nghiệm của bạn rất phù hợp với nhu cầu thị trường hiện tại. Bạn có nhiều cơ hội việc làm.';
            } else if (score >= 5) {
                explanation = 'Kỹ năng của bạn khá phù hợp với thị trường. Nên bổ sung thêm kỹ năng hot để tăng cơ hội.';
            } else {
                explanation = 'Kỹ năng của bạn chưa thực sự phù hợp với nhu cầu thị trường. Nên học thêm các kỹ năng đang được tìm kiếm nhiều.';
            }
        } else if (type === 'completeness') {
            if (score >= 7) {
                explanation = 'CV của bạn rất đầy đủ với tất cả thông tin cần thiết. Nhà tuyển dụng có thể đánh giá toàn diện năng lực của bạn.';
            } else if (score >= 5) {
                explanation = 'CV của bạn có đủ thông tin cơ bản nhưng còn thiếu một số phần quan trọng. Nên bổ sung để hoàn thiện hơn.';
            } else {
                explanation = 'CV của bạn thiếu nhiều thông tin quan trọng. Cần bổ sung đầy đủ để tăng cơ hội được xem xét.';
            }
        }

        return { ...rating, explanation };
    }

    const qualityRating = getScoreExplanation('quality', qualityScore);
    const marketRating = getScoreExplanation('market', marketFitScore);
    const completenessRating = getScoreExplanation('completeness', completenessScore);

    let html = `
        <!-- Score Cards - Each in its own row with explanation -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="score-card ${getScoreClass(qualityScore)}">
                    <div class="score-card-content">
                        <div class="score-circle-inline ${getScoreClass(qualityScore)}">
                            ${qualityScore.toFixed(1)}
                        </div>
                        <div class="score-info flex-grow-1">
                            <h6 class="mb-1">Chất Lượng CV</h6>
                            <p class="text-muted mb-2">Quality Score</p>
                            <div class="score-rating mb-2">
                                <span style="color: ${qualityRating.color}; font-weight: bold;">
                                    ${qualityRating.icon} ${qualityRating.rating}
                                </span>
                            </div>
                            <p class="small mb-0" style="color: #666;">
                                ${qualityRating.explanation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-4">
            <div class="col-12">
                <div class="score-card ${getScoreClass(marketFitScore)}">
                    <div class="score-card-content">
                        <div class="score-circle-inline ${getScoreClass(marketFitScore)}">
                            ${marketFitScore.toFixed(1)}
                        </div>
                        <div class="score-info flex-grow-1">
                            <h6 class="mb-1">Phù Hợp Thị Trường</h6>
                            <p class="text-muted mb-2">Market Fit</p>
                            <div class="score-rating mb-2">
                                <span style="color: ${marketRating.color}; font-weight: bold;">
                                    ${marketRating.icon} ${marketRating.rating}
                                </span>
                            </div>
                            <p class="small mb-0" style="color: #666;">
                                ${marketRating.explanation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row mb-5">
            <div class="col-12">
                <div class="score-card ${getScoreClass(completenessScore)}">
                    <div class="score-card-content">
                        <div class="score-circle-inline ${getScoreClass(completenessScore)}">
                            ${completenessScore.toFixed(1)}
                        </div>
                        <div class="score-info flex-grow-1">
                            <h6 class="mb-1">Độ Đầy Đủ</h6>
                            <p class="text-muted mb-2">Completeness</p>
                            <div class="score-rating mb-2">
                                <span style="color: ${completenessRating.color}; font-weight: bold;">
                                    ${completenessRating.icon} ${completenessRating.rating}
                                </span>
                            </div>
                            <p class="small mb-0" style="color: #666;">
                                ${completenessRating.explanation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <h6>Điểm Mạnh</h6>
                <div>
    `;
    
    if (insights.strengths && insights.strengths.length > 0) {
        insights.strengths.forEach(strength => {
            html += `<span class="badge-custom badge-strength">✓ ${strength}</span>`;
        });
    } else {
        html += '<p class="text-muted">Không có dữ liệu</p>';
    }
    
    html += `
                </div>
            </div>
            <div class="col-md-6">
                <h6>Điểm Cần Cải Thiện</h6>
                <div>
    `;
    
    if (insights.weaknesses && insights.weaknesses.length > 0) {
        insights.weaknesses.forEach(weakness => {
            html += `<span class="badge-custom badge-weakness">⚠ ${weakness}</span>`;
        });
    } else {
        html += '<p class="text-muted">Không có dữ liệu</p>';
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ===== LOAD IMPROVEMENTS =====

async function loadImprovements() {
    if (!currentCVId) return;
    
    const container = document.getElementById('improvementsContent');
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p class="mt-3">Đang tạo gợi ý...</p></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/cv/improve?cv_id=${currentCVId}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load improvements: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Improvements loaded:', data);
        
        displayImprovements(data.improvements || []);
        
    } catch (error) {
        console.error('Error loading improvements:', error);
        container.innerHTML = '<div class="alert alert-danger">Không thể tải gợi ý. Vui lòng thử lại.</div>';
    }
}

// ===== DISPLAY IMPROVEMENTS =====

function displayImprovements(improvements) {
    const container = document.getElementById('improvementsContent');

    if (!container) {
        console.error('❌ improvementsContent element not found');
        return;
    }

    if (!improvements || improvements.length === 0) {
        container.innerHTML = '<p class="text-muted">Không có gợi ý cải thiện</p>';
        return;
    }
    
    let html = '';
    
    improvements.forEach((imp, index) => {
        html += `
            <div class="improvement-card">
                <h6>${index + 1}. ${imp.section || 'Cải thiện'}</h6>
                <p><strong>Ưu tiên:</strong> <span class="badge bg-${imp.priority === 'high' ? 'danger' : imp.priority === 'medium' ? 'warning' : 'info'}">${imp.priority || 'medium'}</span></p>
                <p><strong>Gợi ý:</strong> ${imp.suggestion || imp.improvement || 'N/A'}</p>
                ${imp.reason ? `<p><strong>Lý do:</strong> ${imp.reason}</p>` : ''}
                ${imp.impact ? `<p><strong>Tác động:</strong> ${imp.impact}</p>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ===== FIND MATCHING JOBS =====

async function findMatchingJobs() {
    if (!currentCVId) {
        alert('Vui lòng upload CV trước');
        return;
    }

    const container = document.getElementById('jobMatchesContent');
    const btn = document.getElementById('findJobsBtn');

    btn.disabled = true;
    btn.textContent = 'Đang phân tích...';
    container.innerHTML = '<div class="text-center"><div class="spinner-border text-primary"></div><p class="mt-3">Đang phân tích CV và tìm việc làm phù hợp với AI...</p></div>';

    try {
        // Sử dụng /match endpoint với semantic search + AI ranking
        const response = await fetch(`${API_BASE_URL}/match`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cv_id: currentCVId,
                filters: {},
                model: 'gemini-2.0-flash-exp'
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to match jobs: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Matched jobs:', data);

        // /match endpoint trả về data.matched_jobs
        displayJobMatches(data.matched_jobs || []);
        
    } catch (error) {
        console.error('Error finding jobs:', error);
        container.innerHTML = '<div class="alert alert-danger">Không thể tìm việc làm. Vui lòng thử lại.</div>';
    } finally {
        btn.disabled = false;
        btn.textContent = '🔍 Tìm Việc Làm Phù Hợp';
    }
}

// ===== DISPLAY JOB MATCHES =====

function displayJobMatches(jobs) {
    const container = document.getElementById('jobMatchesContent');

    if (!jobs || jobs.length === 0) {
        container.innerHTML = '<p class="text-muted">Không tìm thấy việc làm phù hợp</p>';
        return;
    }

    // Separate top 5 and remaining jobs
    const top5Jobs = jobs.slice(0, 5);
    const remainingJobs = jobs.slice(5);

    let html = '';

    // Display top 5 jobs
    html += '<div class="top-jobs-section">';
    html += '<h5 class="mb-3">🏆 Top 5 Việc Làm Phù Hợp Nhất</h5>';

    top5Jobs.forEach((job, index) => {
        html += renderJobCard(job, index, true);
    });

    html += '</div>';

    // Display remaining jobs (hidden by default)
    if (remainingJobs.length > 0) {
        html += '<div class="remaining-jobs-section mt-4">';
        html += `
            <div class="text-center mb-3">
                <button class="btn btn-outline-primary" id="showMoreJobsBtn" onclick="toggleRemainingJobs()">
                    <i class="fi-rr-angle-small-down"></i> Xem Thêm ${remainingJobs.length} Việc Làm
                </button>
            </div>
        `;

        html += '<div id="remainingJobsContainer" style="display: none;">';
        html += '<h5 class="mb-3 mt-4">📋 Các Việc Làm Khác</h5>';

        remainingJobs.forEach((job, index) => {
            html += renderJobCard(job, index + 5, false);
        });

        html += '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
}

// ===== RENDER JOB CARD =====

function renderJobCard(job, index, isTop5) {
    const matchPercentage = (job.match_score * 100).toFixed(0);

    // Format matched skills
    const matchedSkills = job.matched_skills && job.matched_skills.length > 0
        ? job.matched_skills.slice(0, 5).join(', ')
        : '';

    const whyMatchId = `why-match-${index}`;

    // Badge for top 5
    const topBadge = isTop5 ? `<span class="badge bg-warning text-dark ms-2">Top ${index + 1}</span>` : '';

    return `
        <div class="job-match-card ${isTop5 ? 'top-job-card' : ''}">
            <div class="row">
                <div class="col-md-9">
                    <div class="d-flex align-items-center mb-2">
                        <h5 class="mb-0">${job.job_title || 'Không có tiêu đề'}</h5>
                        ${topBadge}
                        ${job.why_match && isTop5 ? `
                            <button class="btn btn-link btn-sm ms-2 p-0 why-match-btn" onclick="toggleWhyMatch('${whyMatchId}')" title="Tại sao phù hợp?">
                                💡
                            </button>
                        ` : ''}
                    </div>
                    <p class="text-muted mb-2">
                        <strong>${job.company_name || 'Công ty'}</strong>
                    </p>
                    <p class="mb-2">
                        📍 ${job.work_location || 'Không xác định'} |
                        💰 ${job.salary || 'Thỏa thuận'} |
                        ⏰ ${job.deadline || 'N/A'}
                    </p>
                    ${job.job_description ? `<p class="text-muted small">${job.job_description.substring(0, 150)}...</p>` : ''}

                    ${matchedSkills ? `
                        <p class="mb-2">
                            <strong>Kỹ năng khớp:</strong>
                            <span class="badge-custom badge-skill ms-1">${matchedSkills}</span>
                        </p>
                    ` : ''}

                    ${job.why_match && isTop5 ? `
                        <div id="${whyMatchId}" class="why-match-box mt-3" style="display: none;">
                            <div class="alert alert-light border-start border-warning border-4">
                                <h6 class="mb-2">💡 Tại sao phù hợp:</h6>
                                <p class="mb-0">${job.why_match}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="col-md-3 text-center">
                    <div class="match-percentage ${getMatchClass(matchPercentage)}">${matchPercentage}%</div>
                    <p class="text-muted small">Độ phù hợp</p>
                    <a href="job-single.html?id=${job.job_id}" class="btn btn-default btn-sm mt-2">Xem Chi Tiết</a>
                </div>
            </div>
        </div>
    `;
}

// ===== GET MATCH CLASS =====

function getMatchClass(percentage) {
    if (percentage >= 80) return 'match-excellent';
    if (percentage >= 60) return 'match-good';
    if (percentage >= 40) return 'match-fair';
    return 'match-low';
}

// ===== TOGGLE WHY MATCH =====

function toggleWhyMatch(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        if (element.style.display === 'none') {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}

// ===== TOGGLE REMAINING JOBS =====

function toggleRemainingJobs() {
    const container = document.getElementById('remainingJobsContainer');
    const btn = document.getElementById('showMoreJobsBtn');

    if (container && btn) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            btn.innerHTML = '<i class="fi-rr-angle-small-up"></i> Ẩn Bớt';
        } else {
            container.style.display = 'none';
            const remainingCount = container.querySelectorAll('.job-match-card').length;
            btn.innerHTML = `<i class="fi-rr-angle-small-down"></i> Xem Thêm ${remainingCount} Việc Làm`;
        }
    }
}

// Make functions globally accessible
window.toggleWhyMatch = toggleWhyMatch;
window.toggleRemainingJobs = toggleRemainingJobs;

// ===== LOAD EXISTING CVS =====

async function loadExistingCVs() {
    try {
        const response = await fetch(`${API_BASE_URL}/cvs`);
        
        if (response.ok) {
            const cvs = await response.json();
            console.log('Existing CVs:', cvs);
            
            // If there are CVs, could show a list to select from
            // For now, just log them (extend here if needed for UI list)
        }
    } catch (error) {
        console.error('Error loading existing CVs:', error);
    }
}