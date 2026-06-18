// 1. Connexion à Supabase avec tes clés
const SUPABASE_URL = 'https://gnameibvasarcoclojwh.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_qqqnQl2wjVf7k2tQyMMu3A_yenqfuVp'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 2. Créer une offre depuis offre.html
async function createOffre(data) {
  const { error } = await supabase.from('offres').insert(data)
  if (error) {
    console.log('Erreur Supabase:', error.message)
    alert('Erreur: ' + error.message)
    return false
  }
  return true
}

// 3. Charger les offres sur emplois.html
async function loadOffres() {
  const { data, error } = await supabase.from('offres').select('*').order('created_at', { ascending: false })
  if (error) {
    console.log('Erreur Supabase:', error.message)
    return []
  }
  return data || []
}

// 4. Afficher les offres dans la page emplois.html
async function afficherOffres() {
  const container = document.getElementById('liste-offres')
  if (!container) return
  
  container.innerHTML = 'Chargement...'
  const offres = await loadOffres()
  
  if (offres.length === 0) {
    container.innerHTML = '<p>Aucune offre pour le moment.</p>'
    return
  }
  
  container.innerHTML = offres.map(offre => `
    <div class="offre-card">
      <h3>${offre.titre}</h3>
      <p><strong>Métier:</strong> ${offre.metier}</p>
      <p><strong>Lieu:</strong> ${offre.lieu}</p>
      <p><strong>Budget:</strong> ${offre.budget}</p>
      <p>${offre.description}</p>
      <p><strong>Contact:</strong> ${offre.contact}</p>
      ${offre.whatsapp ? `<a href="https://wa.me/${offre.whatsapp}" target="_blank">Contacter sur WhatsApp</a>` : ''}
      <small>Posté le ${new Date(offre.created_at).toLocaleDateString('fr-FR')}</small>
    </div>
  `).join('')
}

// 5. Gérer le formulaire de offre.html
document.addEventListener('DOMContentLoaded', () => {
  // Si on est sur la page emplois.html
  if (document.getElementById('liste-offres')) {
    afficherOffres()
  }
  
  // Si on est sur la page offre.html
  const form = document.getElementById('form-offre')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const data = {
        titre: form.titre.value,
        metier: form.metier.value,
        description: form.description.value,
        lieu: form.lieu.value,
        budget: form.budget.value,
        contact: form.contact.value,
        whatsapp: form.whatsapp.value
      }
      
      const success = await createOffre(data)
      if (success) {
        alert('Offre publiée avec succès !')
        form.reset()
        window.location.href = 'emplois.html'
      }
    })
  }
})
