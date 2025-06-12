import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://iefkmmhmlgfcozwqotgd.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZmttbWhtbGdmY296d3FvdGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NjAwNzMsImV4cCI6MjA2MzIzNjA3M30.UlnF7cWyDi35FnRcIg_FDCWDbtuO4oZ4ExJbr8QtJVo';

const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('login-form');
const errorMsg = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value.trim();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorMsg.textContent = `Błąd logowania: ${error.message}`;
    return;
  }

  window.location.href = '../index.html';
});
