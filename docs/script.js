


// API Configuration
const API_URL = 'http://localhost:2005/api';

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Load projects from API
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        const projects = await response.json();
        
        if (projects.length > 0) {
            displayProjects(projects);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function displayProjects(projects) {
    const projectsGrid = document.getElementById('projects-grid');
    projectsGrid.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        projectCard.innerHTML = `
            ${project.featured ? '<div class="project-badge">Featured</div>' : ''}
            ${project.status === 'in-progress' ? '<div class="project-badge">In Progress</div>' : ''}
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            ${project.features && project.features.length > 0 ? `
                <div class="project-features">
                    ${project.features.map(f => `<span>${f}</span>`).join('')}
                </div>
            ` : ''}
            <div class="project-tech">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-links">
                ${project.liveUrl ? 
                    `<a href="${project.liveUrl}" target="_blank" class="project-link">View Project →</a>` : 
                    '<span class="project-link coming-soon">Coming Soon...</span>'
                }
                ${project.githubUrl ? 
                    `<a href="${project.githubUrl}" target="_blank" class="project-link">GitHub →</a>` : 
                    ''
                }
            </div>
        `;
        
        projectsGrid.appendChild(projectCard);
    });
}

// Contact form submission
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
            formStatus.className = 'form-status success';
            contactForm.reset();
            
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        } else {
            throw new Error('Failed to send message');
        }
    } catch (error) {
        formStatus.textContent = '✗ Failed to send message. Please try again.';
        formStatus.className = 'form-status error';
    }
});

// Load projects on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});