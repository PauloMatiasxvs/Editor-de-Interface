let posts = JSON.parse(localStorage.getItem('posts')) || [
  { id: 1, content: "Bem-vindo ao SocialDash!", media: "https://via.placeholder.com/300", likes: 5, comments: [], date: "2025-03-22" },
  { id: 2, content: "Confira esse vídeo!", media: "https://www.w3schools.com/html/mov_bbb.mp4", likes: 3, comments: [], date: "2025-03-21" }
];

let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || { 
  sortBy: 'date-desc', 
  colorTheme: 'default', 
  fontSize: 16, 
  enableAnimations: true 
};

const postList = document.getElementById('post-list');
const notifList = document.getElementById('notif-list');
const notifBadge = document.getElementById('notif-badge');
const addPostBtn = document.getElementById('add-post');
const postContent = document.getElementById('post-content');
const postMedia = document.getElementById('post-media');
const mediaPreview = document.getElementById('media-preview');
const editModal = document.getElementById('edit-modal');
const closeModal = document.getElementById('close-modal');
const editContent = document.getElementById('edit-content');
const editMedia = document.getElementById('edit-media');
const editMediaPreview = document.getElementById('edit-media-preview');
const editId = document.getElementById('edit-id');
const savePostBtn = document.getElementById('save-post');
const sidebarItems = document.querySelectorAll('aside li');
const themeSwitch = document.getElementById('theme-switch');
const feedSection = document.getElementById('feed-section');
const notificationsSection = document.getElementById('notifications-section');
const statsSection = document.getElementById('stats-section');
const settingsSection = document.getElementById('settings-section');
const sortPosts = document.getElementById('sort-posts');
const colorTheme = document.getElementById('color-theme');
const fontSize = document.getElementById('font-size');
const fontSizeValue = document.getElementById('font-size-value');
const enableAnimations = document.getElementById('enable-animations');
const clearPostsBtn = document.getElementById('clear-posts');

// Inicializar Tema
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
themeSwitch.checked = savedTheme === 'dark';
themeSwitch.addEventListener('change', () => {
  const newTheme = themeSwitch.checked ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Inicializar Configurações
sortPosts.value = settings.sortBy;
colorTheme.value = settings.colorTheme;
fontSize.value = settings.fontSize;
enableAnimations.checked = settings.enableAnimations;
fontSizeValue.textContent = `${settings.fontSize}px`;
document.documentElement.style.setProperty('--font-size-base', `${settings.fontSize}px`);

// Aplicar Tema de Cores
function applyColorTheme(theme) {
  if (theme === 'blue') {
    document.documentElement.style.setProperty('--accent-color', '#4a90e2');
    document.documentElement.style.setProperty('--accent-hover', '#357abd');
  } else if (theme === 'green') {
    document.documentElement.style.setProperty('--accent-color', '#2ecc71');
    document.documentElement.style.setProperty('--accent-hover', '#27ae60');
  } else {
    document.documentElement.style.setProperty('--accent-color', '#ff6f61');
    document.documentElement.style.setProperty('--accent-hover', '#d83f87');
  }
}
applyColorTheme(settings.colorTheme);

function renderPosts() {
  postList.innerHTML = '';
  let sortedPosts = [...posts];
  sortedPosts.sort((a, b) => {
    switch (settings.sortBy) {
      case 'date-asc': return new Date(a.date) - new Date(b.date);
      case 'date-desc': return new Date(b.date) - new Date(a.date);
      case 'likes-desc': return b.likes - a.likes;
      default: return 0;
    }
  });

  sortedPosts.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('card-bg', 'p-6', 'rounded-xl', 'shadow-custom', 'relative', 'animate-fade-in');
    if (settings.enableAnimations) {
      card.classList.add('card-float');
    }
    card.draggable = true;
    card.innerHTML = `
      <div class="absolute top-4 right-4 flex gap-3">
        <span class="edit-icon text-purple-400 hover:text-purple-300 cursor-pointer"><i class="fas fa-edit"></i></span>
        <span class="delete-icon text-red-400 hover:text-red-300 cursor-pointer"><i class="fas fa-trash"></i></span>
      </div>
      <p class="mb-4 text-lg">${post.content}</p>
      ${post.media ? (post.media.includes('video') ? `<video src="${post.media}" controls class="w-full rounded-lg mb-4"></video>` : `<img src="${post.media}" alt="Mídia" class="w-full rounded-lg mb-4">`) : ''}
      <small class="text-gray-400">${post.date}</small>
      <div class="flex gap-4 mt-4">
        <button class="like-btn flex items-center gap-2 text-gray-300 hover:text-red-400"><i class="fas fa-heart ${post.liked ? 'text-red-400' : ''}"></i> ${post.likes}</button>
        <button class="comment-btn flex items-center gap-2 text-gray-300 hover:text-purple-400"><i class="fas fa-comment"></i> ${post.comments.length}</button>
      </div>
      <div class="comments mt-4 hidden">
        <ul class="space-y-2 mb-4">${post.comments.map(c => `<li class="text-sm text-gray-400">${c}</li>`).join('')}</ul>
        <input type="text" placeholder="Adicionar comentário..." class="w-full p-3 input-bg rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
      </div>
    `;

    card.addEventListener('dragstart', () => card.classList.add('opacity-50'));
    card.addEventListener('dragend', () => card.classList.remove('opacity-50'));
    card.querySelector('.edit-icon').addEventListener('click', () => editPost(post.id));
    card.querySelector('.delete-icon').addEventListener('click', () => deletePost(post.id));
    card.querySelector('.like-btn').addEventListener('click', () => likePost(post.id));
    card.querySelector('.comment-btn').addEventListener('click', () => {
      const commentsSection = card.querySelector('.comments');
      commentsSection.classList.toggle('hidden');
    });
    card.querySelector('.comments input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        post.comments.push(e.target.value.trim());
        localStorage.setItem('posts', JSON.stringify(posts));
        renderPosts();
        notifications.push({ message: `Novo comentário no post: ${post.content.slice(0, 20)}...` });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications();
      }
    });
    postList.appendChild(card);
  });
}

postList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(postList, e.clientY);
  const draggable = document.querySelector('.opacity-50');
  if (afterElement == null) {
    postList.appendChild(draggable);
  } else {
    postList.insertBefore(draggable, afterElement);
  }
});

postList.addEventListener('drop', () => {
  const newOrder = Array.from(postList.children).map((child, index) => {
    const postId = parseInt(child.querySelector('.edit-icon').parentElement.parentElement.textContent.match(/id: (\d+)/)?.[1] || 0);
    return posts.find(post => post.id === postId);
  }).filter(post => post);
  posts = newOrder;
  localStorage.setItem('posts', JSON.stringify(posts));
});

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.card-bg:not(.opacity-50)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function renderNotifications() {
  notifList.innerHTML = '';
  notifications.forEach((notif, index) => {
    const li = document.createElement('li');
    li.classList.add('card-bg', 'p-4', 'rounded-xl', 'shadow-custom', 'animate-fade-in');
    li.textContent = notif.message;
    notifList.appendChild(li);
    setTimeout(() => {
      li.classList.add('opacity-0');
      setTimeout(() => {
        notifications.splice(index, 1);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        renderNotifications();
      }, 300);
    }, 5000);
  });
  notifBadge.textContent = notifications.length;
}

function addPost() {
  const content = postContent.value.trim();
  const file = postMedia.files[0];
  if (!content) return;
  const newPost = {
    id: Date.now(),
    content,
    media: file ? URL.createObjectURL(file) : '',
    likes: 0,
    comments: [],
    date: new Date().toISOString().split('T')[0]
  };
  posts.push(newPost);
  localStorage.setItem('posts', JSON.stringify(posts));
  notifications.push({ message: `Novo post publicado: ${content.slice(0, 20)}...` });
  localStorage.setItem('notifications', JSON.stringify(notifications));
  postContent.value = '';
  postMedia.value = '';
  mediaPreview.innerHTML = '';
  renderPosts();
  renderNotifications();
  updateCharts();
}

function editPost(id) {
  const post = posts.find(p => p.id === id);
  editContent.value = post.content;
  editId.value = id;
  editMediaPreview.innerHTML = post.media ? (post.media.includes('video') ? `<video src="${post.media}" controls class="w-full rounded-lg mb-4"></video>` : `<img src="${post.media}" alt="Mídia" class="w-full rounded-lg mb-4">`) : '';
  editModal.classList.remove('hidden');
}

function deletePost(id) {
  if (confirm('Tem certeza que deseja excluir este post?')) {
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('posts', JSON.stringify(posts));
    notifications.push({ message: `Post excluído.` });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    renderPosts();
    renderNotifications();
    updateCharts();
  }
}

function likePost(id) {
  const post = posts.find(p => p.id === id);
  post.likes++;
  post.liked = true;
  localStorage.setItem('posts', JSON.stringify(posts));
  notifications.push({ message: `Seu post "${post.content.slice(0, 20)}..." foi curtido!` });
  localStorage.setItem('notifications', JSON.stringify(notifications));
  renderPosts();
  renderNotifications();
  updateCharts();
}

postMedia.addEventListener('change', () => {
  const file = postMedia.files[0];
  if (file) {
    mediaPreview.innerHTML = file.type.includes('video') ? `<video src="${URL.createObjectURL(file)}" controls class="w-full rounded-lg"></video>` : `<img src="${URL.createObjectURL(file)}" alt="Pré-visualização" class="w-full rounded-lg">`;
  }
});

editMedia.addEventListener('change', () => {
  const file = editMedia.files[0];
  if (file) {
    editMediaPreview.innerHTML = file.type.includes('video') ? `<video src="${URL.createObjectURL(file)}" controls class="w-full rounded-lg"></video>` : `<img src="${URL.createObjectURL(file)}" alt="Pré-visualização" class="w-full rounded-lg">`;
  }
});

addPostBtn.addEventListener('click', addPost);

closeModal.addEventListener('click', () => editModal.classList.add('hidden'));

savePostBtn.addEventListener('click', () => {
  const id = parseInt(editId.value);
  const content = editContent.value.trim();
  const file = editMedia.files[0];
  if (!content) return;
  const post = posts.find(p => p.id === id);
  post.content = content;
  if (file) post.media = URL.createObjectURL(file);
  localStorage.setItem('posts', JSON.stringify(posts));
  editModal.classList.add('hidden');
  renderPosts();
});

sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    if (item.querySelector('#theme-switch')) return; // Ignora o item de tema
    sidebarItems.forEach(i => i.classList.remove('bg-purple-600'));
    item.classList.add('bg-purple-600');
    feedSection.classList.add('hidden');
    notificationsSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    settingsSection.classList.add('hidden');
    if (item.dataset.section === 'feed') {
      feedSection.classList.remove('hidden');
    } else if (item.dataset.section === 'notifications') {
      notificationsSection.classList.remove('hidden');
    } else if (item.dataset.section === 'stats') {
      statsSection.classList.remove('hidden');
    } else if (item.dataset.section === 'settings') {
      settingsSection.classList.remove('hidden');
    }
  });
});

let engagementChart, activityChart;
function updateCharts() {
  const likes = posts.reduce((sum, post) => sum + post.likes, 0);
  const comments = posts.reduce((sum, post) => sum + post.comments.length, 0);
  const postsCount = posts.length;

  if (engagementChart) engagementChart.destroy();
  engagementChart = new Chart(document.getElementById('engagement-chart'), {
    type: 'bar',
    data: {
      labels: ['Posts', 'Curtidas', 'Comentários'],
      datasets: [{
        label: 'Engajamento',
        data: [postsCount, likes, comments],
        backgroundColor: ['var(--accent-color)', 'var(--accent-hover)', '#28a745']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  if (activityChart) activityChart.destroy();
  activityChart = new Chart(document.getElementById('activity-chart'), {
    type: 'line',
    data: {
      labels: posts.map(p => p.date),
      datasets: [{
        label: 'Curtidas por Dia',
        data: posts.map(p => p.likes),
        borderColor: 'var(--accent-color)',
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Configurações
sortPosts.addEventListener('change', () => {
  settings.sortBy = sortPosts.value;
  localStorage.setItem('settings', JSON.stringify(settings));
  renderPosts();
});

colorTheme.addEventListener('change', () => {
  settings.colorTheme = colorTheme.value;
  applyColorTheme(settings.colorTheme);
  localStorage.setItem('settings', JSON.stringify(settings));
  updateCharts();
});

fontSize.addEventListener('input', () => {
  settings.fontSize = fontSize.value;
  fontSizeValue.textContent = `${settings.fontSize}px`;
  document.documentElement.style.setProperty('--font-size-base', `${settings.fontSize}px`);
  localStorage.setItem('settings', JSON.stringify(settings));
});

enableAnimations.addEventListener('change', () => {
  settings.enableAnimations = enableAnimations.checked;
  localStorage.setItem('settings', JSON.stringify(settings));
  renderPosts();
});

clearPostsBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar todos os posts?')) {
    posts = [];
    localStorage.setItem('posts', JSON.stringify(posts));
    notifications.push({ message: 'Todos os posts foram limpos.' });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    renderPosts();
    renderNotifications();
    updateCharts();
  }
});

renderPosts();
renderNotifications();
updateCharts();