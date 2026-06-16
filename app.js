/* =====================================
   BATIR TOGO V2 - VERSION VERCEL
   localStorage - Pas de Firebase
===================================== */

const APP = {
MAX_OFFERS: 10,
ADMIN_PHONE: "71927881",
ADMIN_EMAIL: "teboupaternos@gmail.com"
};

/* ==========================
   UTILITAIRES
========================== */
function getCurrentUser(){
return JSON.parse(sessionStorage.getItem("currentUser"));
}

function setCurrentUser(user){
sessionStorage.setItem("currentUser", JSON.stringify(user));
}

function logout(){
sessionStorage.removeItem("currentUser");
window.location.href = "index.html";
}

function getDB(key){
return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveDB(key, data){
localStorage.setItem(key, JSON.stringify(data));
}

/* ==========================
   UTILISATEURS
========================== */
function getUsers(){
return getDB("users");
}

function saveUser(user){
let users = getUsers();
let index = users.findIndex(u => u.phone === user.phone);
if(index >= 0) users[index] = user;
else users.push(user);
saveDB("users", users);
}

function findUser(phone){
return getUsers().find(u => u.phone === phone);
}

function createAdmin(){
const admin = findUser(APP.ADMIN_PHONE);
if(admin) return;

saveUser({
phone: APP.ADMIN_PHONE,
email: APP.ADMIN_EMAIL,
password: "admin123",
role: "admin",
language: "fr",
photo: "",
status: "active",
createdAt: new Date().toISOString()
});
}
createAdmin();

function isAdmin(){
let user = getCurrentUser();
if(!user) return false;
const dbUser = findUser(user.phone);
return dbUser?.role === "admin";
}

function getUserProfile(phone){
return findUser(phone);
}

/* ==========================
   VALIDATION
========================== */
function validPassword(password){
const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,8}$/;
return regex.test(password);
}

function validPhone(phone){
return /^[0-9]{8}$/.test(phone);
}

/* ==========================
   INSCRIPTION
========================== */
function registerUser(data){
if(findUser(data.phone)){
return {success:false, message:"Numéro déjà utilisé."};
}
if(!validPhone(data.phone)){
return {success:false, message:"Numéro invalide. 8 chiffres requis."};
}
if(!validPassword(data.password)){
return {success:false, message:"Mot de passe invalide. 6-8 caractères, 1 lettre + 1 chiffre minimum."};
}

data.role = "user";
data.status = "active";
data.createdAt = new Date().toISOString();

saveUser(data);
return {success:true, message:"Compte créé avec succès."};
}

/* ==========================
   CONNEXION
========================== */
function loginUser(phone, password){
const user = findUser(phone);

if(!user || user.password!== password){
return {success:false, message:"Identifiants incorrects."};
}
if(user.status === "blocked"){
return {success:false, message:"Compte suspendu par l'administrateur."};
}

setCurrentUser(user);
return {success:true, message:"Connexion réussie."};
}

/* ==========================
   OFFRES
========================== */
function getOffers(){
return getDB("offers");
}

function getActiveOffers(){
return getOffers().filter(o => o.status === "active").sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function countUserOffers(phone){
return getOffers().filter(o => o.ownerPhone === phone).length;
}

function createOffer(data){
let currentUser = getCurrentUser();
if(!currentUser) return {success:false, message:"Utilisateur non connecté."};

let totalOffers = countUserOffers(currentUser.phone);
if(totalOffers >= APP.MAX_OFFERS){
return {success:false, message:"Limite de 10 offres atteinte."};
}

data.id = Date.now().toString();
data.ownerPhone = currentUser.phone;
data.ownerEmail = currentUser.email;
data.ownerPhoto = currentUser.photo || "";
data.createdAt = new Date().toISOString();
data.status = "active";

let offers = getOffers();
offers.push(data);
saveDB("offers", offers);
return {success:true, message:"Offre publiée avec succès."};
}

function updateOffer(offerId, newData){
let offers = getOffers();
let index = offers.findIndex(o => o.id === offerId);
if(index >= 0){
offers[index] = {...offers[index],...newData};
saveDB("offers", offers);
}
return {success:true, message:"Offre modifiée."};
}

function deleteOffer(offerId){
let offers = getOffers().filter(o => o.id!== offerId);
saveDB("offers", offers);
return {success:true, message:"Offre supprimée définitivement."};
}

function reactivateOffer(offerId){
return updateOffer(offerId, {status: "active"});
}

function getMyOffers(){
let currentUser = getCurrentUser();
if(!currentUser) return [];
return getOffers().filter(o => o.ownerPhone === currentUser.phone);
}

function getOfferById(id){
return getOffers().find(o => o.id === id);
}

function getLatestOffers(lim = 10){
return getActiveOffers().slice(0, lim);
}

/* ==========================
   STATISTIQUES
========================== */
function getStatistics(){
const users = getUsers();
const offers = getOffers();
const activeOffers = getActiveOffers();
const admins = users.filter(u => u.role === "admin");

return {
users: users.length,
offers: offers.length,
activeOffers: activeOffers.length,
admins: admins.length
};
}

function getAdminStats(){
const users = getUsers();
const offers = getOffers();
const blocked = users.filter(u => u.status === "blocked");
const activeOffers = getActiveOffers();

return {
users: users.length,
blocked: blocked.length,
offers: offers.length,
activeOffers: activeOffers.length
};
}

/* ==========================
   RECHERCHE
========================== */
function searchOffers(filters = {}){
let offers = getActiveOffers();

return offers.filter(function(offer){
if(filters.metier && filters.metier!== "" && offer.metier!== filters.metier) return false;
if(filters.region && filters.region!== "" && (!offer.region ||!offer.region.toLowerCase().includes(filters.region.toLowerCase()))) return false;
if(filters.ville && filters.ville!== "" && (!offer.ville ||!offer.ville.toLowerCase().includes(filters.ville.toLowerCase()))) return false;
if(filters.quartier && filters.quartier!== "" && (!offer.quartier ||!offer.quartier.toLowerCase().includes(filters.quartier.toLowerCase()))) return false;
if(filters.keyword && filters.keyword!== ""){
let text = ((offer.titre || "") + " " + (offer.description || "")).toLowerCase();
if(!text.includes(filters.keyword.toLowerCase())) return false;
}
return true;
});
}

/* ==========================
   ADMIN USERS
========================== */
function blockUser(phone){
if(!isAdmin()) return {success:false, message:"Accès refusé."};
let user = findUser(phone);
if(!user) return {success:false, message:"Utilisateur introuvable."};
user.status = "blocked";
saveUser(user);
return {success:true, message:"Utilisateur bloqué."};
}

function unblockUser(phone){
if(!isAdmin()) return {success:false, message:"Accès refusé."};
let user = findUser(phone);
if(!user) return {success:false, message:"Utilisateur introuvable."};
user.status = "active";
saveUser(user);
return {success:true, message:"Utilisateur débloqué."};
}

/* ==========================
   SUPPRESSION COMPTE
========================== */
function deleteUserAccount(phone, password){
const user = findUser(phone);
if(!user || user.password!== password){
return {success:false, message:"Mot de passe incorrect."};
}

let offers = getOffers().filter(o => o.ownerPhone!== phone);
saveDB("offers", offers);

let users = getUsers().filter(u => u.phone!== phone);
saveDB("users", users);

sessionStorage.removeItem("currentUser");
return {success:true, message:"Compte et toutes vos offres supprimés définitivement."};
}