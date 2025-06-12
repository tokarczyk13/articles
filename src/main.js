import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://iefkmmhmlgfcozwqotgd.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZmttbWhtbGdmY296d3FvdGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjAwNzMsImV4cCI6MjA2MzIzNjA3M30.UlnF7cWyDi35FnRcIg_FDCWDbtuO4oZ4ExJbr8QtJVo';
const supabase = createClient(supabaseUrl, supabaseKey);

const articlesContainer = document.getElementById('articles-container');
const editModal = document.getElementById('edit-modal');
const addModal = document.getElementById('add-modal');
const modalOverlay = document.getElementById('modal-overlay');
const editForm = document.getElementById('edit-form');
const addForm = document.getElementById('add-form');
const addArticleBtn = document.getElementById('add-article-btn');
const closeModalBtn = document.getElementById('close-modal');
const closeAddModalBtn = document.getElementById('close-add-modal');
const logoutBtn = document.getElementById('logout-btn');
const loginLink = document.getElementById('login-link');

let currentUser = null;
let articles = [];

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;
}

async function fetchArticles() {
  const { data } = await supabase.from('article').select('*').order('created_at', { ascending: false });
  articles = data || [];
  renderArticles();
}

function renderArticles() {
  if (!articles || articles.length === 0) {
    articlesContainer.innerHTML = `<div class="text-center py-12 text-gray-500">Brak artykułów</div>`;
    return;
  }

  articlesContainer.innerHTML = '';

  articles.forEach((article) => {
    const articleElement = document.createElement('article');
    articleElement.className = 'bg-white rounded-lg shadow-sm border p-6';

    const createdDate = new Date(article.created_at).toLocaleString('pl-PL');
    const updatedDate = article.updated_at && article.updated_at !== article.created_at
      ? new Date(article.updated_at).toLocaleString('pl-PL')
      : null;

    articleElement.innerHTML = `
      <h2 class="text-xl font-bold mb-2">${article.title}</h2>
      ${article.subtitle ? `<h3 class="text-md text-gray-600 mb-2">${article.subtitle}</h3>` : ''}
      <div class="text-sm text-gray-500 mb-2">
      ${article.author ? `<span class="italic">Autor: ${article.author}</span> | ` : ''}
        Utworzono: ${createdDate}
        ${updatedDate ? ` | Zaktualizowano: ${updatedDate}` : ''}
      </div>
      <p class="mb-4">${article.content.replace(/\n/g, '<br>')}</p>
      ${currentUser ? `
        <button onclick="openEditModal(${article.id})" class="bg-blue-500 text-white px-3 py-1 rounded">Edytuj</button>
        <button onclick="deleteArticle(${article.id})" class="bg-red-500 text-white px-3 py-1 rounded ml-2">Usuń</button>
      ` : ''}
    `;
    articlesContainer.appendChild(articleElement);
  });
}

function openEditModal(articleId) {
  const article = articles.find(a => a.id === articleId);
  if (!article) return;

  editForm.id.value = article.id;
  editForm.title.value = article.title;
  editForm.subtitle.value = article.subtitle || '';
  editForm.author.value = article.author || '';
  editForm.content.value = article.content;
  showModal(editModal);
}

function openAddModal() {
  addForm.reset();
  showModal(addModal);
}

function showModal(modal) {
  modalOverlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function hideModals() {
  modalOverlay.classList.add('hidden');
  editModal.classList.add('hidden');
  addModal.classList.add('hidden');
  document.body.style.overflow = '';
}

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = editForm.id.value;
  const title = editForm.title.value.trim();
  const subtitle = editForm.subtitle.value.trim() || null;
  const author = editForm.author.value.trim() || null;
  const content = editForm.content.value.trim();
  const updated_at = new Date().toISOString();

  await supabase.from('article')
    .update({ title, subtitle, author, content, updated_at })
    .eq('id', id);

  hideModals();
  await fetchArticles();
});

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = addForm.title.value.trim();
  const subtitle = addForm.subtitle.value.trim() || null;
  const author = addForm.author.value.trim() || null;
  const content = addForm.content.value.trim();
  const created_at = new Date().toISOString();

  await supabase.from('article')
    .insert([{ title, subtitle, author, content, created_at }]);

  hideModals();
  await fetchArticles();
});

async function deleteArticle(id) {
  await supabase.from('article').delete().eq('id', id);
  await fetchArticles();
}

async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}

addArticleBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', hideModals);
closeAddModalBtn.addEventListener('click', hideModals);
logoutBtn.addEventListener('click', logout);
modalOverlay.addEventListener('click', hideModals);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideModals(); });
window.openEditModal = openEditModal;
window.deleteArticle = deleteArticle;

async function init() {
  await getCurrentUser();
  await fetchArticles();

  if (!currentUser) {
    addArticleBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    loginLink.classList.remove('hidden');
  } else {
    addArticleBtn.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loginLink.classList.add('hidden');
  }
}

supabase.auth.onAuthStateChange(() => { init(); });
init();
