const config = window.NOVELSHELF_CONFIG;
const isConfigured = config
    && config.supabaseUrl
    && config.supabaseAnonKey
    && !config.supabaseUrl.includes('YOUR_')
    && !config.supabaseAnonKey.includes('YOUR_');

const client = isConfigured
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;

const state = {
    user: null,
    novels: [],
    selectedNovel: null,
    selectedChapter: null,
    chapters: [],
    reviews: [],
    myShelf: []
};

const pages = {
    store: document.querySelector('#page-store'),
    detail: document.querySelector('#page-detail'),
    reader: document.querySelector('#page-reader'),
    shelf: document.querySelector('#page-shelf'),
    auth: document.querySelector('#page-auth')
};

const statusBox = document.querySelector('#status');
const novelGrid = document.querySelector('#novel-grid');
const novelDetail = document.querySelector('#novel-detail');
const readerView = document.querySelector('#reader-view');
const shelfList = document.querySelector('#shelf-list');
const userLabel = document.querySelector('#user-label');
const signOutButton = document.querySelector('#sign-out-button');

document.addEventListener('DOMContentLoaded', init);

async function init() {
    bindNavigation();
    bindAuthForms();
    bindButtons();

    if (!isConfigured) {
        showStatus('Add your Supabase project URL and anon key in config.js before running the live app.', 'error');
        renderEmptyStore();
        return;
    }

    const { data } = await client.auth.getSession();
    state.user = data.session?.user ?? null;
    updateAuthUI();

    client.auth.onAuthStateChange((_event, session) => {
        state.user = session?.user ?? null;
        updateAuthUI();
        loadShelf();
        if (state.selectedNovel) {
            loadNovelDetail(state.selectedNovel.id);
        }
    });

    await loadNovels();
    if (state.user) {
        await loadShelf();
    }
}

function bindNavigation() {
    document.querySelectorAll('[data-page]').forEach((button) => {
        button.addEventListener('click', () => showPage(button.dataset.page));
    });
}

function bindButtons() {
    document.querySelector('#refresh-store').addEventListener('click', loadNovels);
    document.querySelector('#refresh-shelf').addEventListener('click', loadShelf);
    signOutButton.addEventListener('click', signOut);
}

function bindAuthForms() {
    document.querySelector('#login-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!requireSupabase()) {
            return;
        }
        const form = new FormData(event.currentTarget);
        const email = form.get('email');
        const password = form.get('password');
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
            showStatus(error.message, 'error');
            return;
        }
        showStatus('Logged in successfully.', 'success');
        event.currentTarget.reset();
        showPage('store');
    });

    document.querySelector('#register-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!requireSupabase()) {
            return;
        }
        const form = new FormData(event.currentTarget);
        const email = form.get('email');
        const password = form.get('password');
        const { error } = await client.auth.signUp({ email, password });
        if (error) {
            showStatus(error.message, 'error');
            return;
        }
        showStatus('Account created. Check your email if confirmation is enabled, then log in.', 'success');
        event.currentTarget.reset();
    });
}

function requireSupabase() {
    if (client) {
        return true;
    }
    showStatus('Supabase is not configured yet. Add your project URL and anon key in config.js.', 'error');
    return false;
}

function showPage(name) {
    if ((name === 'shelf' || name === 'reader') && !state.user) {
        showStatus('Please log in before opening that page.', 'error');
        name = 'auth';
    }

    Object.entries(pages).forEach(([pageName, section]) => {
        section.classList.toggle('active', pageName === name);
    });

    document.querySelectorAll('.nav-button[data-page]').forEach((button) => {
        button.classList.toggle('active', button.dataset.page === name);
    });
}

function showStatus(message, type = 'info') {
    if (!message) {
        statusBox.innerHTML = '';
        return;
    }
    statusBox.innerHTML = `<div class="notice ${type}">${escapeHtml(message)}</div>`;
}

function updateAuthUI() {
    const loginButton = document.querySelector('.nav-button[data-page="auth"]');
    if (state.user) {
        userLabel.textContent = `Signed in as ${state.user.email}`;
        loginButton.classList.add('hidden');
        signOutButton.classList.remove('hidden');
    } else {
        userLabel.textContent = 'Not signed in';
        loginButton.classList.remove('hidden');
        signOutButton.classList.add('hidden');
        state.myShelf = [];
    }
}

async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) {
        showStatus(error.message, 'error');
        return;
    }
    showStatus('Logged out successfully.', 'success');
    showPage('store');
}

async function loadNovels() {
    showStatus('');
    const { data, error } = await client
        .from('novels')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    state.novels = data ?? [];
    renderNovels();
}

function renderEmptyStore() {
    novelGrid.innerHTML = `
        <div class="panel">
            <h2>Supabase setup needed</h2>
            <p>Run supabase-schema.sql in Supabase, then paste your project URL and anon key into config.js.</p>
        </div>
    `;
}

function renderNovels() {
    if (!state.novels.length) {
        novelGrid.innerHTML = '<div class="panel">No novels found. Run the seed data in supabase-schema.sql.</div>';
        return;
    }

    novelGrid.innerHTML = state.novels.map((novel) => `
        <article class="novel-card">
            <img src="${coverFor(novel)}" alt="${escapeHtml(novel.title)} cover">
            <div class="novel-card-body">
                <span class="tag">${escapeHtml(novel.category)}</span>
                <h3>${escapeHtml(novel.title)}</h3>
                <strong>${escapeHtml(novel.author)}</strong>
                <p>${escapeHtml(novel.description)}</p>
                <div class="card-actions">
                    <button data-open-novel="${novel.id}">Details</button>
                    <button class="secondary-button" data-add-shelf="${novel.id}">Add to Shelf</button>
                </div>
            </div>
        </article>
    `).join('');

    document.querySelectorAll('[data-open-novel]').forEach((button) => {
        button.addEventListener('click', () => loadNovelDetail(button.dataset.openNovel));
    });
    document.querySelectorAll('[data-add-shelf]').forEach((button) => {
        button.addEventListener('click', () => addToShelf(button.dataset.addShelf));
    });
}

async function loadNovelDetail(novelId) {
    showStatus('');
    const novel = state.novels.find((item) => item.id === novelId);
    state.selectedNovel = novel;

    const [chapterResult, reviewResult] = await Promise.all([
        client.from('chapters').select('*').eq('novel_id', novelId).order('chapter_number'),
        client.from('reviews').select('*').eq('novel_id', novelId).order('created_at', { ascending: false })
    ]);

    if (chapterResult.error) {
        showStatus(chapterResult.error.message, 'error');
        return;
    }
    if (reviewResult.error) {
        showStatus(reviewResult.error.message, 'error');
        return;
    }

    state.chapters = chapterResult.data ?? [];
    state.reviews = reviewResult.data ?? [];
    renderNovelDetail();
    showPage('detail');
}

function renderNovelDetail() {
    const novel = state.selectedNovel;
    const myReview = state.user
        ? state.reviews.find((review) => review.user_id === state.user.id)
        : null;

    novelDetail.innerHTML = `
        <aside class="detail-panel">
            <img class="cover-large" src="${coverFor(novel)}" alt="${escapeHtml(novel.title)} cover">
            <span class="tag">${escapeHtml(novel.category)}</span>
            <h2>${escapeHtml(novel.title)}</h2>
            <strong>${escapeHtml(novel.author)}</strong>
            <p>${escapeHtml(novel.description)}</p>
            <button data-add-shelf="${novel.id}">Add to My Bookshelf</button>
        </aside>

        <div class="detail-panel">
            <h2>Chapters</h2>
            <div class="chapter-list">
                ${state.chapters.map((chapter) => `
                    <div class="chapter-row">
                        <strong>${chapter.chapter_number}. ${escapeHtml(chapter.title)}</strong>
                        <div class="card-actions">
                            <button data-read-chapter="${chapter.id}">Read</button>
                            <button class="secondary-button" data-save-progress="${chapter.id}">Save Progress</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h2>Reviews</h2>
            ${renderReviewForm(myReview)}
            <div class="review-list">
                ${renderReviews()}
            </div>
        </div>
    `;

    novelDetail.querySelector('[data-add-shelf]').addEventListener('click', () => addToShelf(novel.id));
    novelDetail.querySelectorAll('[data-read-chapter]').forEach((button) => {
        button.addEventListener('click', () => openReader(button.dataset.readChapter));
    });
    novelDetail.querySelectorAll('[data-save-progress]').forEach((button) => {
        button.addEventListener('click', () => saveProgress(novel.id, button.dataset.saveProgress));
    });

    const reviewForm = novelDetail.querySelector('#review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', submitReview);
    }

    const deleteButton = novelDetail.querySelector('#delete-review');
    if (deleteButton) {
        deleteButton.addEventListener('click', deleteReview);
    }
}

function renderReviewForm(myReview) {
    if (!state.user) {
        return '<p class="notice">Log in to write a review.</p>';
    }

    return `
        <form id="review-form" class="review-form">
            <label>
                Rating
                <select name="rating" required>
                    ${[5, 4, 3, 2, 1].map((value) => `
                        <option value="${value}" ${myReview?.rating === value ? 'selected' : ''}>${value}</option>
                    `).join('')}
                </select>
            </label>
            <label>
                Comment
                <textarea name="comment" required>${escapeHtml(myReview?.comment ?? '')}</textarea>
            </label>
            <div class="card-actions">
                <button type="submit">${myReview ? 'Update Review' : 'Create Review'}</button>
                ${myReview ? '<button type="button" id="delete-review" class="danger-button">Delete Review</button>' : ''}
            </div>
        </form>
    `;
}

function renderReviews() {
    if (!state.reviews.length) {
        return '<div class="review-row">No reviews yet.</div>';
    }

    return state.reviews.map((review) => `
        <div class="review-row">
            <strong>Rating: ${review.rating}/5</strong>
            <p>${escapeHtml(review.comment)}</p>
            <small>${review.user_id === state.user?.id ? 'Your review' : `User ${review.user_id.slice(0, 8)}`}</small>
        </div>
    `).join('');
}

async function submitReview(event) {
    event.preventDefault();
    if (!state.user) {
        showStatus('Please log in to write a review.', 'error');
        showPage('auth');
        return;
    }

    const form = new FormData(event.currentTarget);
    const existing = state.reviews.find((review) => review.user_id === state.user.id);
    const payload = {
        user_id: state.user.id,
        novel_id: state.selectedNovel.id,
        rating: Number(form.get('rating')),
        comment: form.get('comment'),
        updated_at: new Date().toISOString()
    };

    const result = existing
        ? await client.from('reviews').update(payload).eq('id', existing.id)
        : await client.from('reviews').insert(payload);

    if (result.error) {
        showStatus(result.error.message, 'error');
        return;
    }

    showStatus(existing ? 'Review updated.' : 'Review created.', 'success');
    await loadNovelDetail(state.selectedNovel.id);
}

async function deleteReview() {
    const existing = state.reviews.find((review) => review.user_id === state.user?.id);
    if (!existing) {
        return;
    }

    const { error } = await client.from('reviews').delete().eq('id', existing.id);
    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    showStatus('Review deleted.', 'success');
    await loadNovelDetail(state.selectedNovel.id);
}

async function addToShelf(novelId) {
    if (!state.user) {
        showStatus('Please log in before adding books to your shelf.', 'error');
        showPage('auth');
        return;
    }

    const firstChapter = state.chapters.find((chapter) => chapter.novel_id === novelId)
        ?? await fetchFirstChapter(novelId);

    const { error } = await client.from('bookshelves').upsert({
        user_id: state.user.id,
        novel_id: novelId,
        current_chapter_id: firstChapter?.id ?? null,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id,novel_id'
    });

    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    showStatus('Novel added to your bookshelf.', 'success');
    await loadShelf();
}

async function fetchFirstChapter(novelId) {
    const { data, error } = await client
        .from('chapters')
        .select('*')
        .eq('novel_id', novelId)
        .order('chapter_number')
        .limit(1)
        .single();

    if (error) {
        return null;
    }
    return data;
}

async function loadShelf() {
    if (!state.user || !isConfigured) {
        shelfList.innerHTML = '<div class="panel">Log in to view your bookshelf.</div>';
        return;
    }

    const { data, error } = await client
        .from('bookshelves')
        .select(`
            id,
            user_id,
            novel_id,
            current_chapter_id,
            updated_at,
            novels (*),
            chapters (*)
        `)
        .eq('user_id', state.user.id)
        .order('updated_at', { ascending: false });

    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    state.myShelf = data ?? [];
    renderShelf();
}

function renderShelf() {
    if (!state.myShelf.length) {
        shelfList.innerHTML = '<div class="panel">Your bookshelf is empty. Add a novel from the Book Store.</div>';
        return;
    }

    shelfList.innerHTML = state.myShelf.map((item) => `
        <article class="shelf-item">
            <img src="${coverFor(item.novels)}" alt="${escapeHtml(item.novels.title)} cover">
            <div>
                <span class="tag">${escapeHtml(item.novels.category)}</span>
                <h3>${escapeHtml(item.novels.title)}</h3>
                <p>Current progress: ${item.chapters ? escapeHtml(item.chapters.title) : 'Not started'}</p>
                <div class="card-actions">
                    <button data-open-novel="${item.novel_id}">Details</button>
                    <button class="secondary-button" data-continue="${item.current_chapter_id || ''}" data-novel="${item.novel_id}">Continue Reading</button>
                    <button class="danger-button" data-remove-shelf="${item.id}">Remove</button>
                </div>
            </div>
        </article>
    `).join('');

    shelfList.querySelectorAll('[data-open-novel]').forEach((button) => {
        button.addEventListener('click', () => loadNovelDetail(button.dataset.openNovel));
    });
    shelfList.querySelectorAll('[data-continue]').forEach((button) => {
        button.addEventListener('click', async () => {
            let chapterId = button.dataset.continue;
            if (!chapterId) {
                const chapter = await fetchFirstChapter(button.dataset.novel);
                chapterId = chapter?.id;
            }
            if (chapterId) {
                await openReader(chapterId);
            }
        });
    });
    shelfList.querySelectorAll('[data-remove-shelf]').forEach((button) => {
        button.addEventListener('click', () => removeFromShelf(button.dataset.removeShelf));
    });
}

async function removeFromShelf(shelfId) {
    const { error } = await client.from('bookshelves').delete().eq('id', shelfId);
    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    showStatus('Novel removed from your bookshelf.', 'success');
    await loadShelf();
}

async function openReader(chapterId) {
    if (!state.user) {
        showStatus('Please log in before reading and saving progress.', 'error');
        showPage('auth');
        return;
    }

    const { data, error } = await client
        .from('chapters')
        .select('*, novels (*)')
        .eq('id', chapterId)
        .single();

    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    state.selectedChapter = data;
    state.selectedNovel = data.novels;
    renderReader();
    showPage('reader');
}

function renderReader() {
    const chapter = state.selectedChapter;
    readerView.innerHTML = `
        <p class="tag">${escapeHtml(chapter.novels.title)}</p>
        <h2>${chapter.chapter_number}. ${escapeHtml(chapter.title)}</h2>
        <p class="chapter-content">${escapeHtml(chapter.content)}</p>
        <button data-save-progress="${chapter.id}">Save This as Current Progress</button>
    `;

    readerView.querySelector('[data-save-progress]').addEventListener('click', () => {
        saveProgress(chapter.novel_id, chapter.id);
    });
}

async function saveProgress(novelId, chapterId) {
    if (!state.user) {
        showStatus('Please log in before saving progress.', 'error');
        showPage('auth');
        return;
    }

    const { error } = await client.from('bookshelves').upsert({
        user_id: state.user.id,
        novel_id: novelId,
        current_chapter_id: chapterId,
        updated_at: new Date().toISOString()
    }, {
        onConflict: 'user_id,novel_id'
    });

    if (error) {
        showStatus(error.message, 'error');
        return;
    }

    showStatus('Reading progress saved.', 'success');
    await loadShelf();
}

function coverFor(novel) {
    return novel.cover_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
