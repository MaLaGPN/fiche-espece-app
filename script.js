// 1. Initialisation de Supabase
const SUPABASE_URL = "https://mbrhsbouaktoxpzgkhyx.supabase.co/rest/v1/"; 
const SUPABASE_ANON_KEY = "sb_publishable_AwJeI-Jb5SGifcFvixFgLw_D9ekQyZv";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Gestion de la soumission du formulaire
const form = document.getElementById('formFiche');
const messageDiv = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.textContent = "Envoi en cours...";
  messageDiv.textContent = "";

  try {
    // --- A. TELEVERSER L'IMAGE DANS LE BUCKET ---
    const fileInput = document.getElementById('photoInput');
    const file = fileInput.files[0];

    // Créer un nom de fichier unique pour éviter d'écraser des photos
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `especes/${fileName}`;

    // Envoi de l'image dans le bucket 'photos-especes'
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('photos-especes')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Récupérer l'URL publique de l'image téléversée
    const { data: urlData } = supabaseClient
      .storage
      .from('photos-especes')
      .getPublicUrl(filePath);

    const publicImageUrl = urlData.publicUrl;

    // --- B. ENREGISTRER LE TEXTE ET L'URL DANS LA BASE DE DONNÉES ---
    const { error: insertError } = await supabaseClient
      .from('fiches_especes')
      .insert([
        {
          nom_commun: document.getElementById('nomCommun').value,
          nom_scientifique: document.getElementById('nomScientifique').value,
          famille: document.getElementById('famille').value,
          description: document.getElementById('description').value,
          image_url: publicImageUrl
        }
      ]);

    if (insertError) throw insertError;

    messageDiv.textContent = "✅ La fiche et la photo ont été enregistrées avec succès !";
    messageDiv.style.color = "green";
    form.reset();

  } catch (error) {
    console.error("Erreur :", error);
    messageDiv.textContent = "❌ Erreur : " + error.message;
    messageDiv.style.color = "red";
  } finally {
    btn.disabled = false;
    btn.textContent = "Enregistrer la fiche";
  }
});
