/**
 * Index Page - Homepage with featured jobs
 */

const API_BASE_URL = 'http://localhost:9990';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTotalJobsCount();
    loadFeaturedJobs();
    loadRecentJobs(); // Load jobs for "Recent Jobs" section with tabs
    initializeSearchForm();
});

// ===== LOAD TOTAL JOBS COUNT =====

async function loadTotalJobsCount() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs?limit=1`);
        
        if (!response.ok) {
            throw new Error('Failed to load jobs count');
        }
        
        const data = await response.json();
        
        if (data.total) {
            const countElement = document.getElementById('totalJobsCount');
            if (countElement) {
                countElement.textContent = data.total.toLocaleString() + '+';
            }
            
            // Also update other job count elements
            const jobCountElements = document.querySelectorAll('.job-count');
            jobCountElements.forEach(el => {
                el.textContent = data.total.toLocaleString();
            });
        }
    } catch (error) {
        console.error('Error loading jobs count:', error);
    }
}

// ===== LOAD FEATURED JOBS =====

async function loadFeaturedJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs?limit=100`);

        if (!response.ok) {
            throw new Error('Failed to load featured jobs');
        }

        const data = await response.json();
        const allJobs = data.jobs || [];

        // Get random 8 jobs
        const shuffled = allJobs.sort(() => 0.5 - Math.random());
        const featuredJobs = shuffled.slice(0, 8);

        // Find the featured jobs container
        const container = document.querySelector('.list-recent-jobs');
        if (!container) {
            console.warn('Featured jobs container not found');
            return;
        }

        // Render featured jobs
        let html = '';
        featuredJobs.forEach(job => {
            html += renderFeaturedJobCard(job);
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading featured jobs:', error);
    }
}

// ===== LOAD RECENT JOBS (TAB PANELS) =====

async function loadRecentJobs() {
    try {
        console.log('Loading recent jobs for tab panels...');

        const response = await fetch(`${API_BASE_URL}/jobs?limit=6`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const jobs = data.jobs || [];

        console.log(`✅ Loaded ${jobs.length} jobs for Recent Jobs section`);

        // Render jobs into all tab panels
        renderJobsToTab('tab-one-1', jobs);
        renderJobsToTab('tab-two-1', jobs);
        renderJobsToTab('tab-three-1', jobs);
        renderJobsToTab('tab-four-1', jobs);
        renderJobsToTab('tab-five-1', jobs);
        renderJobsToTab('tab-six-1', jobs);

    } catch (error) {
        console.error('❌ Error loading recent jobs:', error);
        // Show error message in all tabs
        const errorHtml = `
            <div class="col-12 text-center">
                <div class="alert alert-warning" role="alert">
                    <i class="fi-rr-info"></i> Không thể tải danh sách việc làm. Vui lòng thử lại sau.
                </div>
            </div>
        `;
        document.querySelectorAll('.tab-pane').forEach(tab => {
            const container = tab.querySelector('.row');
            if (container) {
                container.innerHTML = errorHtml;
            }
        });
    }
}

// ===== RENDER JOBS TO TAB PANEL =====

function renderJobsToTab(tabId, jobs) {
    const tabPanel = document.getElementById(tabId);
    if (!tabPanel) {
        console.warn(`Tab panel ${tabId} not found`);
        return;
    }

    const container = tabPanel.querySelector('.row');
    if (!container) {
        console.warn(`Container not found in tab ${tabId}`);
        return;
    }

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">Không có việc làm nào</p>
            </div>
        `;
        return;
    }

    let html = '';
    jobs.forEach((job, index) => {
        html += renderRecentJobCard(job, index);
    });

    container.innerHTML = html;
}

// ===== RENDER RECENT JOB CARD (FOR TAB PANELS) =====

function renderRecentJobCard(job, index) {
    const jobImageIndex = (index % 10) + 1;
    const logoIndex = (index % 6) + 1;

    const salary = job.salary || 'Thỏa thuận';
    const location = job.work_location || 'N/A';
    const workType = job.work_type || 'Full time';
    const companyName = job.name || 'N/A';
    const jobTitle = job.job_title || 'N/A';

    return `
        <div class="col-lg-4 col-md-6">
            <div class="card-grid-2 hover-up">
                <div class="text-center card-grid-2-image">
                    <a href="job-single.html?id=${job.id}">
                        <figure><img alt="${companyName}" src="assets/imgs/jobs/job-${jobImageIndex}.png"/></figure>
                    </a>
                </div>
                <div class="card-block-info">
                    <div class="row">
                        <div class="col-lg-7 col-6">
                            <a class="card-2-img-text" href="job-single.html?id=${job.id}">
                                <span class="card-grid-2-img-small">
                                    <img alt="${companyName}" src="assets/imgs/jobs/logos/logo-${logoIndex}.svg"/>
                                </span>
                                <span>${companyName}</span>
                            </a>
                        </div>
                        <div class="col-lg-5 col-6 text-end">
                            <a class="btn btn-grey-small disc-btn" href="job-single.html?id=${job.id}">${workType}</a>
                        </div>
                    </div>
                    <h5 class="mt-20">
                        <a href="job-single.html?id=${job.id}">${jobTitle}</a>
                    </h5>
                    <div class="mt-15">
                        <span class="card-location">${location}</span>
                    </div>
                    <div class="card-2-bottom mt-30">
                        <div class="row">
                            <div class="col-lg-7 col-8">
                                <span class="card-text-price">${salary}</span>
                            </div>
                            <div class="col-lg-5 col-4 text-end">
                                <span><img alt="jobhub" src="assets/imgs/theme/icons/shield-check.svg"/></span>
                                <span class="ml-5"><img alt="jobhub" src="assets/imgs/theme/icons/bookmark.svg"/></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== RENDER FEATURED JOB CARD =====

function renderFeaturedJobCard(job) {
    const salary = job.salary || 'Thỏa thuận';
    const location = job.work_location || 'Không xác định';
    const experience = job.experience || 'Không yêu cầu';
    const companyLogo = job.company_logo || 'assets/imgs/theme/icons/icon-briefcase.svg';
    const jobType = job.work_type || 'Toàn thời gian';
    
    // Truncate location
    const shortLocation = location.length > 40 ? location.substring(0, 40) + '...' : location;
    
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-12">
            <div class="card-grid-2 hover-up">
                <div class="card-grid-2-image-left">
                    <span class="flash"></span>
                    <div class="image-box">
                        <img src="${companyLogo}" alt="${job.name}" 
                             onerror="this.src='assets/imgs/theme/icons/icon-briefcase.svg'">
                    </div>
                    <div class="right-info">
                        <a class="name-job" href="job-single.html?id=${job.id}">${job.name || 'Công ty'}</a>
                        <span class="location-small">${shortLocation}</span>
                    </div>
                </div>
                <div class="card-block-info">
                    <h6>
                        <a href="job-single.html?id=${job.id}">${job.job_title || 'Không có tiêu đề'}</a>
                    </h6>
                    <div class="mt-5">
                        <span class="card-briefcase">${jobType}</span>
                        <span class="card-time">${experience}</span>
                    </div>
                    <p class="font-sm color-text-paragraph mt-15">
                        ${(job.job_description || '').substring(0, 100)}...
                    </p>
                    <div class="card-2-bottom mt-30">
                        <div class="row">
                            <div class="col-lg-7 col-7">
                                <span class="card-text-price">${salary}</span>
                            </div>
                            <div class="col-lg-5 col-5 text-end">
                                <div class="btn btn-apply-now" onclick="window.location.href='job-single.html?id=${job.id}'">
                                    Xem
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== INITIALIZE SEARCH FORM =====

function initializeSearchForm() {
    const searchForm = document.querySelector('.form-find form');
    if (!searchForm) {
        console.warn('Search form not found');
        return;
    }
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get search values
        const keywordInput = searchForm.querySelector('.input-keysearch');
        const locationSelect = searchForm.querySelector('.select-active');
        
        const keyword = keywordInput ? keywordInput.value.trim() : '';
        const location = locationSelect ? locationSelect.value : '';
        
        // Build URL with parameters
        let url = 'jobs.html?';
        const params = [];
        
        if (keyword) {
            params.push(`search=${encodeURIComponent(keyword)}`);
        }
        if (location) {
            params.push(`location=${encodeURIComponent(location)}`);
        }
        
        url += params.join('&');
        
        // Redirect to jobs page
        window.location.href = url;
    });
    
    // Also handle the search button click
    const searchBtn = searchForm.querySelector('.btn-find');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            searchForm.dispatchEvent(new Event('submit'));
        });
    }
}

// ===== HELPER FUNCTIONS =====

function formatSalary(salary) {
    if (!salary || salary === 'Thỏa thuận') return 'Thỏa thuận';
    return salary;
}

function formatLocation(location) {
    if (!location) return 'Không xác định';
    
    // Extract first city if multiple
    const parts = location.split(':');
    if (parts.length > 0) {
        const cities = parts[0].split(';');
        if (cities.length > 0) {
            return cities[0].trim();
        }
    }
    
    return location;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

