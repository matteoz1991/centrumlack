document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 2. Navbar Scroll Effect with Throttling
    const navbar = document.getElementById('navbar');
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    // 3. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.style.display === 'none';
            mobileMenu.style.display = isHidden ? 'block' : 'none';
        }, { passive: true });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.style.display = 'none';
            });
        });
    }

    // 4. Randomized Gallery Swapper (Delayed to prioritize initial load)
    setTimeout(initializeGallerySwapper, 2000);

    // 5. Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            // Simulation
            btn.disabled = true;
            btn.innerHTML = 'Skickar...';
            
            setTimeout(() => {
                contactForm.innerHTML = `
                    <div style="text-align: center; padding: 4rem 0;">
                        <i data-lucide="check-circle" style="width: 80px; height: 80px; color: #22c55e; margin-bottom: 2rem;"></i>
                        <h3 style="font-size: 2.5rem; margin-bottom: 1rem;">Tack för ditt meddelande!</h3>
                        <p style="color: #94a3b8; font-size: 1.25rem;">Vi återkommer till dig så snart som möjligt.</p>
                        <button onclick="location.reload()" style="margin-top: 2rem; background: none; border: none; color: var(--brand-red); font-weight: 800; cursor: pointer; text-decoration: underline;">Skicka ett nytt meddelande</button>
                    </div>
                `;
                window.lucide.createIcons();
            }, 1000);
        });
    }
});

/**
 * Gallery Swapper Logic
 * Fetches the manifest and rotates images in homepage slots
 */
async function initializeGallerySwapper() {
    const slots = ['slot-1', 'slot-2', 'slot-3'];
    let images = [];

    try {
        const response = await fetch('assets/galleri-manifest.json');
        if (!response.ok) throw new Error('Manifest missing');
        images = await response.json();
        console.log(`Gallery: Found ${images.length} images.`);
    } catch (err) {
        console.warn('Gallery manifest failed, using fallbacks.');
        images = [
            'c8769120-d0c4-4933-b0f7-afeecddcb59e.jpg',
            '0af2cc81-adca-4ce8-bc8c-e21aa36789b7.jpg',
            '5242d715-48d9-4364-991b-cbcf9c6988dc.jpg'
        ];
    }

    if (images.length === 0) return;

    // Start rotation
    let currentSlot = 0;
    
    // Track currently displayed image filenames to ensure uniqueness
    const currentImages = slots.map(id => {
        const el = document.getElementById(id);
        const img = el?.querySelector('.slot-img');
        if (img) {
            const parts = img.src.split('/');
            return parts[parts.length - 1];
        }
        return null;
    });

    setInterval(() => {
        const slotId = slots[currentSlot];
        const slotEl = document.getElementById(slotId);
        if (!slotEl) return;

        const img = slotEl.querySelector('.slot-img');
        if (!img) return;

        // Transition: Fade out
        img.style.opacity = '0';
        img.style.transform = 'scale(1.05)';

        setTimeout(() => {
            // Filter images to find one not currently displayed in any slot
            const availableImages = images.filter(imageName => !currentImages.includes(imageName));
            
            // Fallback if images array is too small (shouldn't happen with 40+ images)
            const pool = availableImages.length > 0 ? availableImages : images;
            
            const randomIndex = Math.floor(Math.random() * pool.length);
            const selectedImage = pool[randomIndex];
            const newSrc = `assets/galleri/${selectedImage}`;
            
            // Preload image
            const tempImg = new Image();
            tempImg.src = newSrc;
            tempImg.onload = () => {
                img.src = newSrc;
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
                
                // Update tracker for this slot
                currentImages[currentSlot] = selectedImage;
                
                // Advance to next slot for the next cycle
                currentSlot = (currentSlot + 1) % slots.length;
            };
        }, 700);

    }, 5000); // Every 5 seconds
}
