const signinForm = document.getElementById('signin-form')
const signinStep = document.getElementById('signin-step')
const signedInStep = document.getElementById('signed-in-step')
const emailInput = document.getElementById('email-input')
const passwordInput = document.getElementById('password-input')
const signInBtn = document.getElementById('sign-in-btn')
const statusEl = document.getElementById('status')
const userEmailEl = document.getElementById('user-email')

const togglePasswordBtn = document.getElementById('toggle-password-btn')
const eyeIconOpen = document.getElementById('eye-icon-open')
const eyeIconClosed = document.getElementById('eye-icon-closed')

if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password'
    passwordInput.type = isPassword ? 'text' : 'password'
    if (isPassword) {
      eyeIconOpen.classList.add('hidden')
      eyeIconClosed.classList.remove('hidden')
    } else {
      eyeIconClosed.classList.add('hidden')
      eyeIconOpen.classList.remove('hidden')
    }
  })
}

async function render() {
  const session = await getValidSession()
  if (session) {
    signinForm.classList.add('hidden')
    signedInStep.classList.remove('hidden')
    userEmailEl.textContent = session.user.email
  } else {
    signedInStep.classList.add('hidden')
    signinForm.classList.remove('hidden')
  }
}

signinForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  if (!email || !password) return

  statusEl.className = ''
  statusEl.textContent = 'Signing in…'
  signInBtn.disabled = true

  try {
    await signInWithPassword(email, password)
    statusEl.textContent = ''
    signInBtn.disabled = false
    render()
  } catch (err) {
    signInBtn.disabled = false
    statusEl.className = 'error'
    statusEl.textContent = err.message || 'Invalid email or password.'
  }
})

document.getElementById('sign-out').addEventListener('click', async () => {
  await clearSession()
  statusEl.textContent = ''
  render()
})

render()
