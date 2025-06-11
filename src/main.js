import { createClient } from '@supabase/supabase-js';

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

let currentUser = null;
let articles = [];

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error(error);
  currentUser = user;
}

async function fetchArticles() {
  const { data, error } = await supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    articlesContainer.textContent = 'Błąd ładowania artykułów.';
    return;
  }

  articles = data;
  renderArticles();
}

function renderArticles() {
  articlesContainer.innerHTML = '';

  articles.forEach((article) => {
    const div = document.createElement('div');
    div.classList.add('article');
    div.innerHTML = `
      <h2>${article.title}</h2>
      <h4>${article.subtitle || ''}</h4>
      <p><strong>Autor:</strong> ${article.author}</p>
      <p><strong>Data utworzenia:</strong> ${new Date(
        article.created_at
      ).toLocaleString()}</p>
      <p>${article.content}</p>
    `;

    if (currentUser) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edytuj';
      editBtn.onclick = () => openEditModal(article);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Usuń';
      deleteBtn.onclick = () => deleteArticle(article.id);

      div.appendChild(editBtn);
      div.appendChild(deleteBtn);
    }

    articlesContainer.appendChild(div);
  });
}

function openEditModal(article) {
  editForm.id.value = article.id;
  editForm.title.value = article.title;
  editForm.subtitle.value = article.subtitle || '';
  editForm.author.value = article.author;
  editForm.content.value = article.content;

  editModal.classList.remove('hidden');
  modalOverlay.classList.add('active');
}

function closeEditModal() {
  editModal.classList.add('hidden');
  modalOverlay.classList.remove('active');
}

function openAddModal() {
  addModal.classList.remove('hidden');
  modalOverlay.classList.add('active');
}

function closeAddModal() {
  addModal.classList.add('hidden');
  modalOverlay.classList.remove('active');
}

editForm.onsubmit = async (e) => {
  e.preventDefault();

  const id = editForm.id.value;
  const title = editForm.title.value;
  const subtitle = editForm.subtitle.value;
  const author = editForm.author.value;
  const content = editForm.content.value;
  const updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('article')
    .update({ title, subtitle, author, content, updated_at })
    .eq('id', id);

  if (error) {
    alert('Błąd podczas aktualizacji artykułu');
    console.error(error);
    return;
  }

  closeEditModal();
  fetchArticles();
};

addForm.onsubmit = async (e) => {
  e.preventDefault();

  const title = addForm.title.value.trim();
  const subtitle = addForm.subtitle.value.trim();
  const author = addForm.author.value.trim();
  const content = addForm.content.value.trim();
  const created_at = new Date().toISOString();

  if (!title || !author || !content) {
    alert('Wypełnij wszystkie wymagane pola!');
    return;
  }

  const { error } = await supabase
    .from('article')
    .insert([{ title, subtitle, author, content, created_at }]);

  if (error) {
    alert('Błąd podczas dodawania artykułu');
    console.error(error);
    return;
  }

  addForm.reset();
  closeAddModal();
  fetchArticles();
};

async function deleteArticle(id) {
  if (!confirm('Na pewno chcesz usunąć ten artykuł?')) return;

  const { error } = await supabase.from('article').delete().eq('id', id);

  if (error) {
    alert('Błąd podczas usuwania artykułu');
    console.error(error);
    return;
  }

  fetchArticles();
}

logoutBtn.onclick = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Błąd podczas wylogowywania');
    console.error(error);
    return;
  }
  window.location.reload();
};

addArticleBtn.onclick = openAddModal;
closeModalBtn.onclick = closeEditModal;
closeAddModalBtn.onclick = closeAddModal;
modalOverlay.onclick = () => {
  closeAddModal();
  closeEditModal();
};

async function init() {
  await getCurrentUser();
  await fetchArticles();

  if (!currentUser) {
    document.getElementById('add-article-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    // Dodaj link do logowania
    const loginLink = document.createElement('a');
    loginLink.href = '/login/login.html'; // zakładam, że masz podstronę login w folderze /login/
    loginLink.textContent = 'Zaloguj się';
    document.getElementById('app').prepend(loginLink);
  }
}

init();
