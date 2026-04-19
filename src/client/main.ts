import './styles.css';

const loginBtn = document.getElementById('login_auth') as HTMLButtonElement;

const modal = document.createElement('div');
modal.className = 'modal hidden';
modal.innerHTML = `
  <div class="modal-box">
    <button class="modal-close" id="modal-close">✕</button>

    <div id="view-welcome">
      <h2>Welcome</h2>
      <button class="modal-btn" id="go-login">Login</button>
      <button class="modal-btn" id="go-register">Create Account</button>
    </div>

    <div id="view-login" class="hidden">
      <h2>Login</h2>
      <input class="modal-input" id="login_identifier" type="text" placeholder="Email or Username" />
      <input class="modal-input" id="login_password" type="password" placeholder="Password" />
      <button class="modal-btn" id="sign-in">Sign in</button>
      <button class="modal-link" id="back-welcome">Back</button>
    </div>

    <div id="view-register" class="hidden">
      <h2>Create Account</h2>
      <input class="modal-input" id="register_email" type="email" placeholder="Email" />
	  <input class="modal-input" id="register_username" type="text" placeholder="Username | Optional" />
      <input class="modal-input" id="register_password" type="password" placeholder="Password" />
			<button class="modal-btn" id="register-submit">Register</button>
      <button class="modal-link" id="back-welcome-reg">Back</button>
    </div>
  </div>
`;
document.body.appendChild(modal);

const views = {
	welcome: document.getElementById('view-welcome')!,
	login: document.getElementById('view-login')!,
	register: document.getElementById('view-register')!,
};

function showView(name: keyof typeof views) {
	Object.values(views).forEach((v) => v.classList.add('hidden'));
	views[name].classList.remove('hidden');
}

loginBtn.addEventListener('click', () => {
	showView('welcome');
	modal.classList.remove('hidden');
});
document.getElementById('modal-close')!.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => {
	if (e.target === modal) modal.classList.add('hidden');
});

document.getElementById('go-login')!.addEventListener('click', () => showView('login'));

modal.querySelector('#sign-in')!.addEventListener('click', async () => {
	const [emailInput, passwordInput] = modal.querySelectorAll<HTMLInputElement>('#view-login .modal-input');
	const res = await fetch('/api/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ identifier: emailInput.value, password: passwordInput.value }),
	});
	const data = await res.json() as { success: boolean; error?: string };
	if (!data.success) {
		alert(data.error ?? 'Login failed');
		return;
	}
	modal.classList.add('hidden');
});

document.getElementById('register-submit')!.addEventListener('click', async () => {
	const emailInput = document.getElementById('register_email') as HTMLInputElement | null;
	const usernameInput = document.getElementById('register_username') as HTMLInputElement | null;
	const passwordInput = document.getElementById('register_password') as HTMLInputElement | null;

	if (!emailInput || !passwordInput) {
		alert('Missing register form inputs');
		return;
	}

	const username = usernameInput?.value.trim() || null;
	const res = await fetch('/api/create_user', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email: emailInput.value, password: passwordInput.value, username }),
	});
	const data = await res.json() as { success: boolean; error?: string };
	if (!data.success) {
		alert(data.error ?? 'Account creation failed');
		return;
	}
	modal.classList.add('hidden');
});

document.getElementById('go-register')!.addEventListener('click', () => showView('register'));
document.getElementById('back-welcome')!.addEventListener('click', () => showView('welcome'));
document.getElementById('back-welcome-reg')!.addEventListener('click', () => showView('welcome'));

const comics = [
	{ name: 'One Piece' },
	{ name: 'Naruto' },
	{ name: 'Berserk' },
	{ name: 'Vinland Saga' },
	{ name: 'Attack on Titan' },
	{ name: 'Vagabond' },
	{ name: "JoJo's Bizarre Adventure" },
	{ name: 'Demon Slayer' },
	{ name: 'Fullmetal Alchemist' },
	{ name: 'Death Note' },
	{ name: 'Hunter x Hunter' },
	{ name: 'Blue Period' },
];

const carousel = document.getElementById('carousel') as HTMLDivElement;
const prevBtn = document.getElementById('prev') as HTMLButtonElement;
const nextBtn = document.getElementById('next') as HTMLButtonElement;

const CARD_WIDTH = 160 + 16; // card min-width + gap (1rem = 16px)
let offset = 0;

comics.forEach(({ name }) => {
	const card = document.createElement('div');
	card.className = 'card';

	const avatar = document.createElement('div');
	avatar.className = 'card-avatar';
	avatar.textContent = name[0];

	const label = document.createElement('div');
	label.className = 'card-name';
	label.textContent = name;

	card.appendChild(avatar);
	card.appendChild(label);
	carousel.appendChild(card);
});

function updateButtons(): void {
	const maxOffset = carousel.scrollWidth - carousel.offsetWidth;
	prevBtn.disabled = offset <= 0;
	nextBtn.disabled = offset >= maxOffset;
}

prevBtn.addEventListener('click', () => {
	offset = Math.max(0, offset - CARD_WIDTH * 3);
	carousel.scrollTo({ left: offset, behavior: 'smooth' });
	updateButtons();
});

nextBtn.addEventListener('click', () => {
	const maxOffset = carousel.scrollWidth - carousel.offsetWidth;
	offset = Math.min(maxOffset, offset + CARD_WIDTH * 3);
	carousel.scrollTo({ left: offset, behavior: 'smooth' });
	updateButtons();
});

carousel.addEventListener('scroll', () => {
	offset = carousel.scrollLeft;
	updateButtons();
});

updateButtons();
