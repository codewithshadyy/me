
// API Configuration
const API_URL = 'http://localhost:2005/api';
let authToken = localStorage.getItem('authToken');
let currentFilter = 'all';

// Authentication
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('adminUsername', data.admin.username);
            showDashboard();
        } else {
            document.getElementById('login-error').textContent = 'Invalid credentials';
        }
    } catch (error) {
        document.getElementById('login-error').textContent = 'Login failed. Please try again.';
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminUsername');
    authToken = null;
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
});

// Show Dashboard
function showDashboard() {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    document.getElementById('admin-username').textContent = localStorage.getItem('adminUsername');
    loadStats();
    loadMessages();
    loadProjects();
}

// Check authentication on load
if (authToken) {
    showDashboard();
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id === 'logout-btn') return;
        
        e.preventDefault();
        const view = link.dataset.view;
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');
        
        document.getElementById('view-title').textContent = link.textContent.trim().split('\n')[0];
    });
});

// Load Stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('stat-total-messages').textContent = stats.totalMessages;
            document.getElementById('stat-unread-messages').textContent = stats.unreadMessages;
            document.getElementById('stat-total-projects').textContent = stats.totalProjects;
            document.getElementById('unread-badge').textContent = stats.unreadMessages;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/admin/messages`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const messages = await response.json();
            displayMessages(messages, 'recent-messages', 5);
            displayMessages(messages, 'all-messages');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function displayMessages(messages, containerId, limit = null) {
    const container = document.getElementById(containerId);
    const filtered = currentFilter === 'all' ? messages : 
                     currentFilter === 'unread' ? messages.filter(m => !m.read) :
                     messages.filter(m => m.read);
    
    const displayMessages = limit ? filtered.slice(0, limit) : filtered;
    
    if (displayMessages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">No messages found</p>';
        return;
    }
    
    container.innerHTML = displayMessages.map(msg => `
        <div class="message-card ${!msg.read ? 'unread' : ''}" data-id="${msg._id}">
            <div class="message-header">
                <div>
                    <div class="message-from">${msg.name}</div>
                    <div style="color: var(--gray); font-size: 0.9rem;">${msg.email}</div>
                </div>
                <div class="message-date">${new Date(msg.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="message-subject">${msg.subject}</div>
            <div class="message-preview">${msg.message}</div>
            <div class="message-actions">
                <button class="btn btn-sm btn-primary view-message-btn" data-id="${msg._id}">View</button>
                ${!msg.read ? `<button class="btn btn-sm btn-secondary mark-read-btn" data-id="${msg._id}">Mark as Read</button>` : ''}
                <button class="btn btn-sm btn-danger delete-message-btn" data-id="${msg._id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('.view-message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const msg = messages.find(m => m._id === btn.dataset.id);
            showMessageDetail(msg);
        });
    });
    
    container.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await markMessageAsRead(btn.dataset.id);
        });
    });
    
    container.querySelectorAll('.delete-message-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this message?')) {
                await deleteMessage(btn.dataset.id);
            }
        });
    });
}

// Message Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadMessages();
    });
});

// Mark Message as Read
async function markMessageAsRead(id) {
    try {
        const response = await fetch(`${API_URL}/admin/messages/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadStats();
            loadMessages();
        }
    } catch (error) {
        console.error('Error marking message as read:', error);
    }
}

// Delete Message
async function deleteMessage(id) {
    try {
        const response = await fetch(`${API_URL}/admin/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadStats();
            loadMessages();
        }
    } catch (error) {
        console.error('Error deleting message:', error);
    }
}

// Show Message Detail
function showMessageDetail(message) {
    const modal = document.getElementById('message-modal');
    const detail = document.getElementById('message-detail');
    
    detail.innerHTML = `
        <p><strong>From:</strong> ${message.name}</p>
        <p><strong>Email:</strong> ${message.email}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Date:</strong> ${new Date(message.createdAt).toLocaleString()}</p>
        <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--light);">
        <p><strong>Message:</strong></p>
        <p>${message.message}</p>
    `;
    
    modal.classList.add('active');
    
    if (!message.read) {
        markMessageAsRead(message._id);
    }
}

// Load Projects
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        
        if (response.ok) {
            const projects = await response.json();
            displayProjects(projects);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projects-list');
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray);">No projects yet. Add your first project!</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
                ${project.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
            </div>
            <div class="project-card-actions">
                <button class="btn btn-sm btn-primary edit-project-btn" data-id="${project._id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-project-btn" data-id="${project._id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    container.querySelectorAll('.edit-project-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const project = projects.find(p => p._id === btn.dataset.id);
            showProjectModal(project);
        });
    });
    
    container.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this project?')) {
                await deleteProject(btn.dataset.id);
            }
        });
    });
}

// Project Modal
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const addProjectBtn = document.getElementById('add-project-btn');

addProjectBtn.addEventListener('click', () => {
    showProjectModal();
});

function showProjectModal(project = null) {
    document.getElementById('modal-title').textContent = project ? 'Edit Project' : 'Add Project';
    
    if (project) {
        document.getElementById('project-id').value = project._id;
        document.getElementById('project-title').value = project.title;
        document.getElementById('project-description').value = project.description;
        document.getElementById('project-features').value = project.features ? project.features.join(', ') : '';
        document.getElementById('project-technologies').value = project.technologies.join(', ');
        document.getElementById('project-live-url').value = project.liveUrl || '';
        document.getElementById('project-github-url').value = project.githubUrl || '';
        document.getElementById('project-featured').checked = project.featured;
        document.getElementById('project-status').value = project.status;
    } else {
        projectForm.reset();
        document.getElementById('project-id').value = '';
    }
    
    projectModal.classList.add('active');
}

projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectId = document.getElementById('project-id').value;
    const projectData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-description').value,
        features: document.getElementById('project-features').value.split(',').map(f => f.trim()).filter(f => f),
        technologies: document.getElementById('project-technologies').value.split(',').map(t => t.trim()),
        liveUrl: document.getElementById('project-live-url').value,
        githubUrl: document.getElementById('project-github-url').value,
        featured: document.getElementById('project-featured').checked,
        status: document.getElementById('project-status').value
    };
    
    try {
        const url = projectId ? `${API_URL}/admin/projects/${projectId}` : `${API_URL}/admin/projects`;
        const method = projectId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(projectData)
        });
        
        if (response.ok) {
            projectModal.classList.remove('active');
            loadProjects();
            loadStats();
        }
    } catch (error) {
        console.error('Error saving project:', error);
    }
});

async function deleteProject(id) {
    try {
        const response = await fetch(`${API_URL}/admin/projects/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadProjects();
            loadStats();
        }
    } catch (error) {
        console.error('Error deleting project:', error);
    }
}

// Close modals
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    });
});

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});