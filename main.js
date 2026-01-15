function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}
/* ================= MOBILE NAV ================= */
function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
}

/* ================= HOW TOGGLE ================= */
const pills = document.querySelectorAll('.how-toggle .pill');
const stepGroups = document.querySelectorAll('.how-steps');

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    stepGroups.forEach(group => group.classList.remove('active'));

    pill.classList.add('active');
    document.getElementById(pill.dataset.target).classList.add('active');
  });
});

/* ================= PHONE TOGGLE ================= */
const phonePills = document.querySelectorAll('.hero-toggle .pill');
const phoneStackUser = document.getElementById('phone-stack-user');
const phoneStackBusiness = document.getElementById('phone-stack-business');

phonePills.forEach(pill => {
  pill.addEventListener('click', () => {
    phonePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    if (pill.dataset.target === 'people') {
      phoneStackUser.style.display = 'flex';
      phoneStackBusiness.style.display = 'none';
    } else {
      phoneStackUser.style.display = 'none';
      phoneStackBusiness.style.display = 'flex';
    }   
});
});
/* ================= FEATURE TOGGLE ================= */
const featurePills = document.querySelectorAll('.feature-toggle .pill');
const featureUser = document.getElementById('features-user');
const featureBusiness = document.getElementById('features-business');

featurePills.forEach(pill => {
  pill.addEventListener('click', () => {
    featurePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    if (pill.dataset.target === 'people') {
      featureUser.style.display = 'flex';
      featureBusiness.style.display = 'none';
    } else {
      featureUser.style.display = 'none';
      featureBusiness.style.display = 'flex';
    }
  });
});
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const ctas = document.querySelectorAll('.btn.primary.cta-btn');
ctas.forEach(cta => (
    cta.addEventListener('click', () => {
        document.getElementById('businessSignup').style.display = 'flex'
    })
))

const closeModalBtn = document.getElementById('closeModalBtn');
closeModalBtn.addEventListener('click', () => {
    document.getElementById('businessSignup').style.display = 'none'
})

/* ================= Show Toast ================= */

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;

    toast.innerHTML = `<span>${message}</span><button>&times;</button>`;

    container.appendChild(toast);

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
        removeToast(toast)
    });

    // Auto-remove after duration
    setTimeout(() => {
        removeToast(toast)
    }, duration)
}

function removeToast(toast) {
    toast.style.animation = 'fadeOut 0.5s forwards';
    toast.addEventListener('animationend', () => {
        toast.remove();
    });
}


// Send form data to backend
const businessForm = document.getElementById('signupForm');
const companyNameInput = businessForm.querySelector('input[name="company-name"]');
const emailInput = businessForm.querySelector('input[name="email"]');

businessForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // Validate the input fields here
    const company = companyNameInput.value.trim();
    const email = emailInput.value.trim();
    if (!company) {
        showToast('Please add a company name.', 'error');
        return;
    }
    if (!email) {
        showToast('Please add an email address.', 'error');
        return;
    }
    // Submit email to backend
    const res = await fetch("http://192.168.2.29:8080/api/business-accounts/join-waitlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, company }),
    })
    if (!res.ok) {
        showToast('Something went wrong. Please try again later.', 'error');
        return;
    }
    showToast('Joined Successfully!', 'success');
    businessForm.reset();
    document.getElementById('businessSignup').style.display = 'none';
})