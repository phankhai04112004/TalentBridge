// API Base URL
const API_BASE_URL = 'http://localhost:9990';

// Get job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

console.log('🔍 Job Single Page - Job ID:', jobId);

// Load job details
async function loadJobDetails() {
    if (!jobId) {
        console.error('❌ No job ID provided');
        alert('Không tìm thấy ID việc làm');
        window.location.href = 'jobs.html';
        return;
    }

    try {
        console.log(`📡 Fetching job details for ID: ${jobId}`);
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const job = await response.json();
        console.log('✅ Job details loaded:', job);
        
        displayJobDetails(job);
        
    } catch (error) {
        console.error('❌ Error loading job:', error);
        alert('Không thể tải thông tin việc làm. Vui lòng thử lại.');
        // Don't redirect, just show error
    }
}

// Display job details
function displayJobDetails(job) {
    console.log('🎨 Displaying job details...');
    
    // Update page title
    document.title = `${job.job_title} - ${job.name} | TalentBridge`;
    
    // Update breadcrumb and header
    const headerTitle = document.querySelector('.box-head-single h3');
    if (headerTitle) {
        headerTitle.textContent = job.job_title || 'Chi Tiết Việc Làm';
    }
    
    // Update company logo if exists
    const logoImg = document.querySelector('.single-image-feature img');
    if (logoImg && job.company_logo) {
        logoImg.src = job.company_logo;
        logoImg.alt = job.name;
        logoImg.onerror = function() {
            this.src = 'assets/imgs/page/job-single/img-job-feature.png';
        };
    }
    
    // Update main content
    const contentSingle = document.querySelector('.content-single');
    if (contentSingle) {
        contentSingle.innerHTML = `
            <h5>${job.name || 'Công ty'}</h5>
            
            <div class="job-info-badges mb-3">
                <span class="badge bg-primary me-2"><i class="fi-rr-marker"></i> ${job.work_location || 'N/A'}</span>
                <span class="badge bg-success me-2"><i class="fi-rr-dollar"></i> ${job.salary || 'Thỏa thuận'}</span>
                <span class="badge bg-info me-2"><i class="fi-rr-briefcase"></i> ${job.experience || 'N/A'}</span>
                <span class="badge bg-warning"><i class="fi-rr-calendar"></i> ${job.deadline || 'N/A'}</span>
            </div>
            
            <h5 class="mt-4">Mô Tả Công Việc</h5>
            <div class="job-description">
                ${job.job_description || '<p>Không có mô tả chi tiết.</p>'}
            </div>
            
            <h5 class="mt-4">Yêu Cầu Ứng Viên</h5>
            <div class="job-requirements">
                ${job.candidate_requirements || '<p>Không có yêu cầu cụ thể.</p>'}
            </div>
            
            <h5 class="mt-4">Quyền Lợi</h5>
            <div class="job-benefits">
                ${job.benefits || '<p>Không có thông tin về quyền lợi.</p>'}
            </div>
            
            <h5 class="mt-4">Thông Tin Công Ty</h5>
            <div class="company-info">
                <p><strong>Tên công ty:</strong> ${job.name || 'N/A'}</p>
                <p><strong>Quy mô:</strong> ${job.company_scale || 'N/A'}</p>
                <p><strong>Lĩnh vực:</strong> ${job.company_field || 'N/A'}</p>
                <p><strong>Địa chỉ:</strong> ${job.company_address || 'N/A'}</p>
                ${job.company_url ? `<p><strong>Website:</strong> <a href="${job.company_url}" target="_blank">${job.company_url}</a></p>` : ''}
            </div>
            
            <div class="mt-4">
                <a href="${job.job_url || '#'}" target="_blank" class="btn btn-apply-big btn-apply-now">
                    Ứng Tuyển Ngay
                </a>
            </div>
        `;
    }
    
    // Update sidebar
    updateSidebarInfo(job);
}

// Update sidebar information
function updateSidebarInfo(job) {
    const sidebar = document.querySelector('.sidebar-shadow');
    if (!sidebar) {
        console.warn('⚠️ Sidebar not found');
        return;
    }
    
    sidebar.innerHTML = `
        <div class="sidebar-list-job">
            <div class="box-map job-overview">
                <div class="heading-sidebar mb-30">
                    <h2>Thông Tin Chung</h2>
                </div>
                <div class="job-overview-card">
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-briefcase"></i></div>
                        <div class="job-overview-text">
                            <h5>Cấp bậc</h5>
                            <span>${job.level || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-dollar"></i></div>
                        <div class="job-overview-text">
                            <h5>Mức lương</h5>
                            <span>${job.salary || 'Thỏa thuận'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-marker"></i></div>
                        <div class="job-overview-text">
                            <h5>Địa điểm</h5>
                            <span>${job.work_location || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-time-fast"></i></div>
                        <div class="job-overview-text">
                            <h5>Kinh nghiệm</h5>
                            <span>${job.experience || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-calendar"></i></div>
                        <div class="job-overview-text">
                            <h5>Hạn nộp</h5>
                            <span>${job.deadline || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-user"></i></div>
                        <div class="job-overview-text">
                            <h5>Số lượng tuyển</h5>
                            <span>${job.number_of_hires || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-graduation-cap"></i></div>
                        <div class="job-overview-text">
                            <h5>Học vấn</h5>
                            <span>${job.education || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="job-overview-item">
                        <div class="job-overview-icon"><i class="fi-rr-clock"></i></div>
                        <div class="job-overview-text">
                            <h5>Loại công việc</h5>
                            <span>${job.work_type || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-30">
                    <a href="${job.job_url || '#'}" target="_blank" class="btn btn-apply-now w-100">
                        <i class="fi-rr-paper-plane"></i> Ứng Tuyển Ngay
                    </a>
                </div>
                <div class="mt-20">
                    <button class="btn btn-border w-100" onclick="window.location.href='jobs.html'">
                        <i class="fi-rr-arrow-left"></i> Quay Lại Danh Sách
                    </button>
                </div>
            </div>
            
            ${job.skills ? `
            <div class="box-map mt-30">
                <div class="heading-sidebar mb-20">
                    <h2>Kỹ Năng Yêu Cầu</h2>
                </div>
                <div class="job-tags">
                    ${job.skills.split(',').map(skill => 
                        `<span class="badge bg-light text-dark me-2 mb-2">${skill.trim()}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            
            ${job.job_tags ? `
            <div class="box-map mt-30">
                <div class="heading-sidebar mb-20">
                    <h2>Tags</h2>
                </div>
                <div class="job-tags">
                    ${job.job_tags.split(',').map(tag => 
                        `<span class="badge bg-primary me-2 mb-2">${tag.trim()}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Job Single Page Initialized');
    loadJobDetails();
});

