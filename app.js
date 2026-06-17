const SUPABASE_URL = 'https://gnameibvasarcoclojwh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYW1laWJ2YXNhcmNvY2xvandoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODA3MTksImV4cCI6MjA5NzI1NjcxOX0.AqM5MzzA0JlObe9F7uTmXNl8lCfoueovBKLtKFoewbM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth
function getCurrentUser(){
  return JSON.parse(sessionStorage.getItem('currentUser'));
}

function saveCurrentUser(user){
  sessionStorage.setItem('currentUser', JSON.stringify(user));
  window.location.href = 'accueil.html';
}

function logout(){
  sessionStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

function checkAuth(){
  const user = getCurrentUser();
  if(!user && !window.location.pathname.includes('index.html')){
    window.location.href = 'index.html';
  }
  return user;
}

// Inscription
async function register(nom, tel, password, role){
  const user = { id: tel, nom, tel, password, role };
  saveCurrentUser(user);
  return user;
}

// Connexion
async function login(tel, password){
  if(tel === '71927881' && password === 'admin123'){
    const admin = { id: tel, nom: 'Admin Bâtir Togo', tel, role: 'admin' };
    saveCurrentUser(admin);
    return admin;
  }
  // Pour les autres users
  const user = { id: tel, nom: 'Utilisateur ' + tel, tel, role: 'ouvrier' };
  saveCurrentUser(user);
  return user;
}

// Créer offre
async function createOffre(data){
  const user = getCurrentUser();
  if(!user) return alert('Connecte-toi d abord');
  
  const { error } = await supabase.from('offres').insert({
    titre: data.titre,
    metier: data.metier,
    description: data.description,
    lieu: data.lieu,
    budget: data.budget,
    contact: data.contact,
    whatsapp: data.whatsapp,
    user_id: user.id,
    user_nom: user.nom
  });
  
  if(error) {
    alert('Erreur: ' + error.message);
  } else {
    alert('Offre publiée !');
    window.location.href = 'emplois.html';
  }
}

// Charger offres
async function loadOffres(){
  const { data, error } = await supabase.from('offres')
    .select('*')
    .order('created_at', { ascending: false });
  
  if(error) {
    console.log(error);
    return [];
  }
  return data;
}
